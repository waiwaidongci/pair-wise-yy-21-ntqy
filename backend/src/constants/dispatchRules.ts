import { config } from "../config/env";

// 超时催办规则：重大/紧急报修生成的工单超过 15 分钟未派工即升级高优先级并生成催办待办。
export const DISPATCH_RULES = {
  escalationTimeoutMinutes: config.escalationTimeoutMinutes,
  escalationSeverities: ["MAJOR", "URGENT"] as const,
  escalatedPriority: "HIGH",
  scanIntervalMs: config.scanIntervalMs,
  // 工单处于这些状态时视为班组手上的“未结工单”
  crewActiveStatuses: ["ASSIGNED", "ARRIVED", "REPAIRING"] as const
};
