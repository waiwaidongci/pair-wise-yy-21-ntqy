import type { DispatchUrge } from "../models/DispatchUrge";

// 构造催办待办默认对象：工单超时未派工时由扫描器创建。
export const createDispatchUrge = (overrides: Partial<DispatchUrge> = {}, now = new Date()): Omit<DispatchUrge, "id"> => ({
  ticket_id: 0,
  status: "OPEN",
  escalated_priority: "HIGH",
  timeout_minutes: 15,
  created_at: now.toISOString(),
  last_scan_at: now.toISOString(),
  scan_count: 1,
  closed_at: "",
  close_reason: "",
  ...overrides
});

// 列表/详情响应对象
export const createDispatchUrgeView = (urge: DispatchUrge) => ({
  ...urge,
  status_text: urge.status === "OPEN" ? "催办中" : "已解除"
});
