import type { RepairTicket } from "../types/RepairTicket";

export const createDefaultRepairTicket = (overrides: Partial<RepairTicket> = {}): RepairTicket => ({
  id: 1 as never,
  fault_report_id: 1 as never,
  team_id: 1 as never,
  dispatcher_id: 1 as never,
  priority: "MEDIUM" as never,
  status: "WAIT_DISPATCH" as never,
  created_at: "2026-09-26T08:00:00Z" as never,
  assigned_at: "" as never,
  restored_at: "" as never,
  ...overrides
});

export const createRepairTicketForm = createDefaultRepairTicket;
export const createRepairTicketResponse = createDefaultRepairTicket;
