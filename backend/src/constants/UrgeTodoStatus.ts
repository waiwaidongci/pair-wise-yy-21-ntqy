export const UrgeTodoStatus = ["OPEN", "CLOSED"] as const;
export type UrgeTodoStatus = (typeof UrgeTodoStatus)[number];
