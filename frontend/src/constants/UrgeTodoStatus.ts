export const UrgeTodoStatus = ["OPEN", "CLOSED"] as const;
export type UrgeTodoStatus = (typeof UrgeTodoStatus)[number];
export const UrgeTodoStatusText: Record<UrgeTodoStatus, string> = { OPEN: "催办中", CLOSED: "已解除" };

/** 超时催办阈值（分钟），与后端 urgeRules 保持一致 */
export const URGE_TIMEOUT_MINUTES = 15;
