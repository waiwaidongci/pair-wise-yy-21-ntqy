import type { DispatchUrge } from "../types/DispatchUrge";

// 催办待办默认对象（离线兜底/表单初始化用）
export const createDispatchUrge = (overrides: Partial<DispatchUrge> = {}): DispatchUrge => ({
  id: 0,
  ticket_id: 0,
  status: "OPEN",
  escalated_priority: "HIGH",
  timeout_minutes: 15,
  created_at: "",
  last_scan_at: "",
  scan_count: 0,
  closed_at: "",
  close_reason: "",
  ...overrides
});

// 派工表单对象
export const createDispatchForm = () => ({ ticket_id: 0, team_id: 0 });
