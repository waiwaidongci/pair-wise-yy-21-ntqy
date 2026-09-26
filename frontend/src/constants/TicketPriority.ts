export const TicketPriority = ["LOW", "MEDIUM", "HIGH"] as const;
export type TicketPriority = (typeof TicketPriority)[number];
export const TicketPriorityText: Record<TicketPriority, string> = { LOW: "低", MEDIUM: "中", HIGH: "高" };
