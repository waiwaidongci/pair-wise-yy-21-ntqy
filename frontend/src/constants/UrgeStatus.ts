export const UrgeStatus = ["OPEN", "CLOSED"] as const;
export type UrgeStatus = (typeof UrgeStatus)[number];
export const UrgeStatusText: Record<UrgeStatus, string> = { OPEN: "催办中", CLOSED: "已解除" };
export const UrgeCloseReasonText: Record<string, string> = { DISPATCHED: "已派工关闭", STATUS_ADVANCED: "工单已推进" };
