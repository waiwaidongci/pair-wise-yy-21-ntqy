export const Severity = ["NORMAL", "MAJOR", "URGENT"] as const;
export type Severity = (typeof Severity)[number];
export const SeverityText: Record<Severity, string> = { NORMAL: "一般", MAJOR: "重大", URGENT: "紧急" };
