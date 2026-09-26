export const UrgeCloseReason = ["DISPATCHED", "STATUS_ADVANCED"] as const;
export type UrgeCloseReason = (typeof UrgeCloseReason)[number];
export const UrgeCloseReasonText: Record<UrgeCloseReason, string> = {
  DISPATCHED: "已派工关闭",
  STATUS_ADVANCED: "工单已推进"
};
