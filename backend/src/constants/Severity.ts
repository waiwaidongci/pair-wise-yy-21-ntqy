export const Severity = ["NORMAL", "MAJOR", "URGENT"] as const;
export type Severity = (typeof Severity)[number];
