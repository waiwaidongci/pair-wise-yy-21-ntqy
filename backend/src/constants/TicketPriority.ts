export const TicketPriority = ["LOW", "MEDIUM", "HIGH"] as const;
export type TicketPriority = (typeof TicketPriority)[number];
