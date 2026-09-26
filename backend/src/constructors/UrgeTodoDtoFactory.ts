import type { UrgeTodo } from "../models/UrgeTodo";

/** 催办待办默认结构 */
export const createUrgeTodoDto = (overrides: Partial<UrgeTodo> = {}): Omit<UrgeTodo, "id"> => ({
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
