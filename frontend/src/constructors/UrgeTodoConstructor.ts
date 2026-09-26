import type { UrgeTodo } from "../types/UrgeTodo";

export const createDefaultUrgeTodo = (overrides: Partial<UrgeTodo> = {}): UrgeTodo => ({
  id: 0,
  ticket_id: 0,
  fault_report_id: 0,
  severity: "MAJOR",
  status: "OPEN",
  overdue_minutes: 0,
  reason: "",
  created_at: new Date().toISOString(),
  closed_at: null,
  close_reason: null,
  ...overrides
});
