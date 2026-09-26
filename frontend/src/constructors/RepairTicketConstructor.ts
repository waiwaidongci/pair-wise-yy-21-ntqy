import type { RepairTicket } from "../types/RepairTicket";

export const createDefaultRepairTicket = (overrides: Partial<RepairTicket> = {}): RepairTicket => ({
  id: 0,
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

export const createRepairTicketForm = createDefaultRepairTicket;
export const createRepairTicketResponse = createDefaultRepairTicket;
