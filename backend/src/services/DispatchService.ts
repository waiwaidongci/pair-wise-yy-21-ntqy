import { DISPATCH_RULES } from "../constants/dispatchRules";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { faultReportRepository } from "../repositories/FaultReportRepository";
import { crewRepository } from "../repositories/CrewRepository";
import { dispatchUrgeRepository } from "../repositories/DispatchUrgeRepository";
import { createDispatchUrge } from "../constructors/DispatchUrgeDtoFactory";
import type { RepairTicket } from "../models/RepairTicket";
import type { Crew } from "../models/Crew";
import type { DispatchUrge } from "../models/DispatchUrge";

export class DispatchError extends Error {
  constructor(public code: keyof typeof ERROR_MESSAGES, public status = 400) {
    super(ERROR_MESSAGES[code]);
  }
}

const log = (template: string, detail: Record<string, unknown>) => console.info(template, JSON.stringify(detail));
const minutesBetween = (from: string, to: Date) => Math.max(0, (to.getTime() - new Date(from).getTime()) / 60000);

export interface CrewEligibility {
  crew: Crew;
  eligible: boolean;
  reasons: string[];
}

// 班组可派条件：技能匹配故障类型、非离岗、无未结工单
function evaluateCrew(ticket: RepairTicket, crew: Crew): CrewEligibility {
  const report = faultReportRepository.findById(ticket.fault_report_id);
  const reasons: string[] = [];
  const skills = crew.skill_tags.split(",").map((tag) => tag.trim());
  if (!report || !skills.includes(report.fault_type)) reasons.push(ERROR_CODES.CREW_SKILL_MISMATCH);
  if (crew.duty_status !== "ON_DUTY") reasons.push(ERROR_CODES.CREW_OFF_DUTY);
  const busy = repairTicketRepository
    .findAll()
    .some((t) => t.team_id === crew.id && (DISPATCH_RULES.crewActiveStatuses as readonly string[]).includes(t.status));
  if (busy) reasons.push(ERROR_CODES.CREW_HAS_OPEN_TICKET);
  return { crew, eligible: reasons.length === 0, reasons };
}

function closeUrge(urge: DispatchUrge, reason: string, now: Date) {
  urge.status = "CLOSED";
  urge.closed_at = now.toISOString();
  urge.close_reason = reason;
  dispatchUrgeRepository.update(urge);
  log(LOG_TEMPLATES.DispatchUrge[3], { urge_id: urge.id, ticket_id: urge.ticket_id, reason });
}

export const dispatchService = {
  // 超时扫描：升级优先级 + 生成/维持催办待办；已推进工单的待办自动关闭。
  // 重复扫描只保留一条 OPEN 待办；待办关闭后若工单再次超时，会重新生成。
  scan(now = new Date()) {
    let escalated = 0;
    let opened = 0;
    let closed = 0;

    for (const urge of dispatchUrgeRepository.findAll().filter((u) => u.status === "OPEN")) {
      const ticket = repairTicketRepository.findById(urge.ticket_id);
      if (!ticket || ticket.status !== "WAIT_DISPATCH") {
        closeUrge(urge, ticket && ticket.status === "ASSIGNED" ? "DISPATCHED" : "STATUS_ADVANCED", now);
        closed += 1;
      }
    }

    const waiting = repairTicketRepository.findAll().filter((t) => t.status === "WAIT_DISPATCH");
    for (const ticket of waiting) {
      const report = faultReportRepository.findById(ticket.fault_report_id);
      if (!report || !(DISPATCH_RULES.escalationSeverities as readonly string[]).includes(report.severity)) continue;
      const waited = minutesBetween(ticket.created_at, now);
      if (waited < DISPATCH_RULES.escalationTimeoutMinutes) continue;

      if (ticket.priority !== DISPATCH_RULES.escalatedPriority) {
        ticket.priority = DISPATCH_RULES.escalatedPriority;
        repairTicketRepository.update(ticket);
        escalated += 1;
        log(LOG_TEMPLATES.DispatchUrge[0], { ticket_id: ticket.id, priority: ticket.priority });
      }
      const open = dispatchUrgeRepository.findOpenByTicketId(ticket.id);
      if (open) {
        open.last_scan_at = now.toISOString();
        open.scan_count += 1;
        dispatchUrgeRepository.update(open);
        log(LOG_TEMPLATES.DispatchUrge[2], { urge_id: open.id, ticket_id: ticket.id, scan_count: open.scan_count });
      } else {
        const urge = dispatchUrgeRepository.insert(
          createDispatchUrge({ ticket_id: ticket.id, timeout_minutes: DISPATCH_RULES.escalationTimeoutMinutes }, now)
        );
        opened += 1;
        log(LOG_TEMPLATES.DispatchUrge[1], { urge_id: urge.id, ticket_id: ticket.id });
      }
    }
    log(LOG_TEMPLATES.Dispatch[2], { escalated, opened, closed });
    return { scanned_at: now.toISOString(), escalated, opened, closed };
  },

  overview() {
    this.scan();
    const now = new Date();
    const pending = repairTicketRepository
      .findAll()
      .filter((t) => t.status === "WAIT_DISPATCH")
      .map((ticket) => {
        const report = faultReportRepository.findById(ticket.fault_report_id);
        const waited = minutesBetween(ticket.created_at, now);
        const escalatable = !!report && (DISPATCH_RULES.escalationSeverities as readonly string[]).includes(report.severity);
        const overtime = escalatable ? Math.max(0, waited - DISPATCH_RULES.escalationTimeoutMinutes) : 0;
        const urge = dispatchUrgeRepository.findOpenByTicketId(ticket.id);
        return {
          ticket,
          fault_type: report?.fault_type ?? "",
          severity: report?.severity ?? "",
          address_desc: report?.address_desc ?? "",
          reporter_name: report?.reporter_name ?? "",
          waited_minutes: Math.floor(waited),
          overtime_minutes: Math.floor(overtime),
          urge_status: urge ? "OPEN" : "NONE",
          urge_id: urge?.id ?? null
        };
      })
      .sort((a, b) => b.overtime_minutes - a.overtime_minutes || b.waited_minutes - a.waited_minutes);

    const in_progress = repairTicketRepository
      .findAll()
      .filter((t) => (DISPATCH_RULES.crewActiveStatuses as readonly string[]).includes(t.status))
      .map((ticket) => ({
        ticket,
        team_name: crewRepository.findById(ticket.team_id)?.name ?? "未分配"
      }));

    return {
      scanned_at: now.toISOString(),
      escalation_timeout_minutes: DISPATCH_RULES.escalationTimeoutMinutes,
      pending,
      in_progress,
      open_urges: dispatchUrgeRepository.findAll().filter((u) => u.status === "OPEN")
    };
  },

  listUrges() {
    this.scan();
    return [...dispatchUrgeRepository.findAll()].sort((a, b) => b.id - a.id);
  },

  eligibleCrews(ticketId: number): CrewEligibility[] {
    const ticket = repairTicketRepository.findById(ticketId);
    if (!ticket) throw new DispatchError(ERROR_CODES.TICKET_NOT_FOUND, 404);
    return crewRepository.findAll().map((crew) => evaluateCrew(ticket, crew));
  },

  // 派工：仅允许派给技能匹配、非离岗且无未结工单的班组；成功后关闭催办待办。
  dispatch(ticketId: number, teamId: number, dispatcherId: number) {
    const ticket = repairTicketRepository.findById(ticketId);
    if (!ticket) throw new DispatchError(ERROR_CODES.TICKET_NOT_FOUND, 404);
    if (ticket.status !== "WAIT_DISPATCH") throw new DispatchError(ERROR_CODES.TICKET_NOT_WAITING, 409);
    const crew = crewRepository.findById(teamId);
    if (!crew) throw new DispatchError(ERROR_CODES.CREW_NOT_FOUND, 404);

    const { eligible, reasons } = evaluateCrew(ticket, crew);
    if (!eligible) {
      log(LOG_TEMPLATES.Dispatch[3], { ticket_id: ticketId, team_id: teamId, reasons });
      throw new DispatchError(reasons[0] as keyof typeof ERROR_MESSAGES, 422);
    }

    ticket.status = "ASSIGNED";
    ticket.team_id = crew.id;
    ticket.dispatcher_id = dispatcherId;
    ticket.assigned_at = new Date().toISOString();
    repairTicketRepository.update(ticket);
    crew.current_ticket_id = ticket.id;
    crewRepository.update(crew);

    const open = dispatchUrgeRepository.findOpenByTicketId(ticket.id);
    if (open) closeUrge(open, "DISPATCHED", new Date());

    log(LOG_TEMPLATES.Dispatch[0], { ticket_id: ticket.id, team_id: crew.id });
    return { ticket, closed_urge_id: open?.id ?? null };
  },

  // 撤销派工：工单回到待派工，班组释放；再次超时后扫描会重新生成催办待办。
  revoke(ticketId: number) {
    const ticket = repairTicketRepository.findById(ticketId);
    if (!ticket) throw new DispatchError(ERROR_CODES.TICKET_NOT_FOUND, 404);
    if (ticket.status !== "ASSIGNED") throw new DispatchError(ERROR_CODES.TICKET_NOT_ASSIGNED, 409);
    const crew = crewRepository.findById(ticket.team_id);
    if (crew && crew.current_ticket_id === ticket.id) {
      crew.current_ticket_id = 0;
      crewRepository.update(crew);
    }
    ticket.status = "WAIT_DISPATCH";
    ticket.team_id = 0;
    ticket.assigned_at = "";
    repairTicketRepository.update(ticket);
    log(LOG_TEMPLATES.Dispatch[1], { ticket_id: ticket.id });
    return { ticket };
  }
};
