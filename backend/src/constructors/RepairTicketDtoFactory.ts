import type { RepairTicket } from "../models/RepairTicket";

/** 新工单默认结构（页面 / service 不得散写默认字段） */
export const createRepairTicketDto = (overrides: Partial<RepairTicket> = {}): Omit<RepairTicket, "id"> => ({
  fault_report_id: 0,
  team_id: null,
  dispatcher_id: null,
  priority: "MEDIUM",
  status: "WAIT_DISPATCH",
  reported_at: new Date().toISOString(),
  assigned_at: null,
  arrived_at: null,
  restored_at: null,
  escalated_at: null,
  ...overrides
});
