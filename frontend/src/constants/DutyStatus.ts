export const DutyStatus = ["ON_DUTY", "OFF_DUTY", "BUSY"] as const;
export type DutyStatus = (typeof DutyStatus)[number];
export const DutyStatusText: Record<DutyStatus, string> = { ON_DUTY: "在岗", OFF_DUTY: "离岗", BUSY: "任务中" };
