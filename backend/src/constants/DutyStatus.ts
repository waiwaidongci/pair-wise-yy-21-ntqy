export const DutyStatus = ["ON_DUTY", "OFF_DUTY", "BUSY"] as const;
export type DutyStatus = (typeof DutyStatus)[number];
