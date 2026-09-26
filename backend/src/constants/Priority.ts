export const Priority = ["LOW", "MEDIUM", "HIGH"] as const;
export type Priority = (typeof Priority)[number];
export const PriorityText: Record<Priority, string> = { LOW: "低", MEDIUM: "中", HIGH: "高" };
