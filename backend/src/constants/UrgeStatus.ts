export const UrgeStatus = ["OPEN", "CLOSED"] as const;
export type UrgeStatus = (typeof UrgeStatus)[number];
export const UrgeStatusText: Record<UrgeStatus, string> = { OPEN: "催办中", CLOSED: "已解除" };
