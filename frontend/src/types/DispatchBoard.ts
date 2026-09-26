import type { RepairTicket } from "./RepairTicket";
import type { FaultReport } from "./FaultReport";
import type { UrgeTodo } from "./UrgeTodo";

/** 调度台看板行：工单 + 报修 + 超时时长 + 催办状态 */
export interface DispatchBoardRow {
  ticket: RepairTicket;
  report: FaultReport | null;
  wait_minutes: number;
  is_overdue: boolean;
  urge_rule_hit: boolean;
  open_todo: UrgeTodo | null;
}
