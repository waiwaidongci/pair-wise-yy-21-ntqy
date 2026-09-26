import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { faultReportRepository } from "../repositories/FaultReportRepository";
import { crewRepository } from "../repositories/CrewRepository";
import { urgeTodoRepository } from "../repositories/UrgeTodoRepository";
import { TicketStatus } from "../constants/TicketStatus";
import { TicketPriority } from "../constants/TicketPriority";
import { DutyStatus } from "../constants/DutyStatus";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { URGE_TIMEOUT_MINUTES, URGE_SEVERITIES, FAULT_SKILL_MAP } from "../constants/urgeRules";
import { minutesBetween, parseSkillTags } from "../utils/formatters";
import type { RepairTicket } from "../models/RepairTicket";
import type { FaultReport } from "../models/FaultReport";
import type { Crew } from "../models/Crew";
import type { UrgeTodo } from "../models/UrgeTodo";

/** service 层独立包装的业务异常（controller 只做 HTTP 映射，不吞异常） */
export class ServiceError extends Error {
  constructor(
    public code: keyof typeof ERROR_MESSAGES,
    public status = 400
  ) {
    super(ERROR_MESSAGES[code]);
    this.name = "ServiceError";
  }
}

export interface BoardRow {
  ticket: RepairTicket;
  report: FaultReport | null;
  /** 已等待分钟数（待派工工单从报修时刻起算） */
  wait_minutes: number;
  /** 是否超过催办阈值 */
  is_overdue: boolean;
  /** 是否命中重大/紧急催办规则 */
  urge_rule_hit: boolean;
  /** 当前打开的催办待办，无则 null */
  open_todo: UrgeTodo | null;
}

const log = (template: string, detail: unknown) => console.info(`[${template}]`, JSON.stringify(detail));

const OPEN_TICKET_STATUSES: readonly string[] = [
  TicketStatus[0], // WAIT_DISPATCH
  TicketStatus[1], // ASSIGNED
  TicketStatus[2], // ARRIVED
  TicketStatus[3] // REPAIRING
];

const mustTicket = (id: number): RepairTicket => {
  const ticket = repairTicketRepository.findById(id);
  if (!ticket) throw new ServiceError(ERROR_CODES.TICKET_NOT_FOUND, 404);
  return ticket;
};

export const repairTicketService = {
  list: () => repairTicketRepository.findAll(),

  create: (row: Omit<RepairTicket, "id">) => repairTicketRepository.save(row),

  /**
   * 超时催办扫描（定时器 + 手动触发共用）：
   * 重大/紧急报修的待派工工单超过阈值未派工 → 优先级升为 HIGH 并生成一条 OPEN 待办。
   * 重复扫描只保留一条待办；已到场/已复电/已派工的工单不生成。
   */
  scanOverdue(now: Date = new Date()): { escalated: number[]; reopened: number[] } {
    const escalated: number[] = [];
    const reopened: number[] = [];
    const waiting = repairTicketRepository.findByStatus(TicketStatus[0]);
    for (const ticket of waiting) {
      const report = faultReportRepository.findById(ticket.fault_report_id);
      if (!report || !URGE_SEVERITIES.includes(report.severity)) continue;
      const overdue = minutesBetween(ticket.reported_at, now);
      if (overdue < URGE_TIMEOUT_MINUTES) continue;

      if (ticket.priority !== TicketPriority[2]) {
        repairTicketRepository.update(ticket.id, { priority: TicketPriority[2], escalated_at: now.toISOString() });
        log(LOG_TEMPLATES.RepairTicket[4], { ticket_id: ticket.id, overdue_minutes: overdue });
      }
      const openTodo = urgeTodoRepository.findOpenByTicket(ticket.id);
      if (!openTodo) {
        urgeTodoRepository.save({
          ticket_id: ticket.id,
          fault_report_id: report.id,
          severity: report.severity,
          status: "OPEN",
          overdue_minutes: overdue,
          reason: `${report.severity === "URGENT" ? "紧急" : "重大"}报修超过${URGE_TIMEOUT_MINUTES}分钟未派工`,
          created_at: now.toISOString(),
          closed_at: null,
          close_reason: null
        });
        // 此前被关闭过 → 解除后再次超时，属于重新生成
        const everClosed = urgeTodoRepository
          .findAll()
          .some((t) => t.ticket_id === ticket.id && t.status === "CLOSED");
        log(everClosed ? LOG_TEMPLATES.UrgeTodo[2] : LOG_TEMPLATES.UrgeTodo[0], {
          ticket_id: ticket.id,
          overdue_minutes: overdue
        });
        (everClosed ? reopened : escalated).push(ticket.id);
      }
    }
    log(LOG_TEMPLATES.UrgeTodo[3], { waiting: waiting.length, escalated, reopened });
    return { escalated, reopened };
  },

  /**
   * 派工：仅允许技能匹配、非离岗且无未结工单的班组；
   * 成功后工单转 ASSIGNED，并关闭该工单打开的催办待办。
   */
  assign(ticketId: number, crewId: number, dispatcherId: number): { ticket: RepairTicket; crew: Crew } {
    const ticket = mustTicket(ticketId);
    if (ticket.status !== TicketStatus[0]) throw new ServiceError(ERROR_CODES.TICKET_NOT_WAITING, 409);

    const crew = crewRepository.findById(crewId);
    if (!crew) throw new ServiceError(ERROR_CODES.CREW_NOT_FOUND, 404);
    if (crew.duty_status === DutyStatus[1]) throw new ServiceError(ERROR_CODES.CREW_UNAVAILABLE, 409);
    if (crew.current_ticket_id != null) throw new ServiceError(ERROR_CODES.CREW_HAS_OPEN_TICKET, 409);

    const report = faultReportRepository.findById(ticket.fault_report_id);
    if (!report) throw new ServiceError(ERROR_CODES.REPORT_NOT_FOUND, 404);
    const requiredSkill = FAULT_SKILL_MAP[report.fault_type];
    if (requiredSkill && !parseSkillTags(crew.skill_tags).includes(requiredSkill)) {
      throw new ServiceError(ERROR_CODES.CREW_SKILL_MISMATCH, 409);
    }

    const now = new Date().toISOString();
    const updated = repairTicketRepository.update(ticketId, {
      team_id: crewId,
      dispatcher_id: dispatcherId,
      status: TicketStatus[1],
      assigned_at: now
    })!;
    crewRepository.update(crewId, { current_ticket_id: ticketId, duty_status: DutyStatus[2] });
    faultReportRepository.update(report.id, { status: "DISPATCHED" });
    repairTicketService.closeOpenTodo(ticketId, "已派工");
    log(LOG_TEMPLATES.RepairTicket[1], { ticket_id: ticketId, crew_id: crewId });
    return { ticket: updated, crew: crewRepository.findById(crewId)! };
  },

  /** 到场：工单转 ARRIVED；到场工单不再参与催办 */
  arrive(ticketId: number): RepairTicket {
    const ticket = mustTicket(ticketId);
    if (ticket.status !== TicketStatus[1]) throw new ServiceError(ERROR_CODES.INVALID_STATUS_TRANSITION, 409);
    const updated = repairTicketRepository.update(ticketId, {
      status: TicketStatus[2],
      arrived_at: new Date().toISOString()
    })!;
    log(LOG_TEMPLATES.RepairTicket[2], { ticket_id: ticketId });
    return updated;
  },

  /** 复电确认：工单转 RESTORED，释放班组，关闭仍未关闭的催办待办 */
  restore(ticketId: number): RepairTicket {
    const ticket = mustTicket(ticketId);
    if (![TicketStatus[1], TicketStatus[2], TicketStatus[3]].includes(ticket.status as never)) {
      throw new ServiceError(ERROR_CODES.INVALID_STATUS_TRANSITION, 409);
    }
    const now = new Date().toISOString();
    const updated = repairTicketRepository.update(ticketId, { status: TicketStatus[4], restored_at: now })!;
    if (ticket.team_id != null) {
      crewRepository.update(ticket.team_id, { current_ticket_id: null, duty_status: DutyStatus[0] });
    }
    const report = faultReportRepository.findById(ticket.fault_report_id);
    if (report) faultReportRepository.update(report.id, { status: "RESTORED" });
    repairTicketService.closeOpenTodo(ticketId, "已复电");
    log(LOG_TEMPLATES.RepairTicket[3], { ticket_id: ticketId });
    return updated;
  },

  /** 关闭工单当前打开的催办待办（派工/复电时调用） */
  closeOpenTodo(ticketId: number, reason: string): void {
    const open = urgeTodoRepository.findOpenByTicket(ticketId);
    if (open) {
      urgeTodoRepository.update(open.id, { status: "CLOSED", closed_at: new Date().toISOString(), close_reason: reason });
      log(LOG_TEMPLATES.UrgeTodo[1], { todo_id: open.id, ticket_id: ticketId, reason });
    }
  },

  /** 调度台看板：工单 + 报修 + 等待时长 + 催办状态 */
  board(now: Date = new Date()): BoardRow[] {
    return repairTicketRepository.findAll().map((ticket) => {
      const report = faultReportRepository.findById(ticket.fault_report_id) ?? null;
      const waiting = ticket.status === TicketStatus[0];
      const waitMinutes = waiting ? minutesBetween(ticket.reported_at, now) : 0;
      const urgeRuleHit = waiting && !!report && URGE_SEVERITIES.includes(report.severity);
      return {
        ticket,
        report,
        wait_minutes: waitMinutes,
        is_overdue: urgeRuleHit && waitMinutes >= URGE_TIMEOUT_MINUTES,
        urge_rule_hit: urgeRuleHit,
        open_todo: urgeTodoRepository.findOpenByTicket(ticket.id) ?? null
      };
    });
  },

  /** 可供派工的班组：技能匹配、非离岗、无未结工单 */
  availableCrews(ticketId: number): Crew[] {
    const ticket = mustTicket(ticketId);
    const report = faultReportRepository.findById(ticket.fault_report_id);
    const requiredSkill = report ? FAULT_SKILL_MAP[report.fault_type] : undefined;
    return crewRepository.findAll().filter((crew) => {
      if (crew.duty_status === DutyStatus[1]) return false;
      if (crew.current_ticket_id != null) return false;
      if (requiredSkill && !parseSkillTags(crew.skill_tags).includes(requiredSkill)) return false;
      return true;
    });
  }
};

export const isOpenTicket = (status: string) => OPEN_TICKET_STATUSES.includes(status);
