import { loadStore, persist } from "../utils/jsonStore";
import type { DispatchUrge } from "../models/DispatchUrge";

export const dispatchUrgeRepository = {
  findAll: (): DispatchUrge[] => loadStore().dispatchUrge,
  findOpenByTicketId: (ticketId: number): DispatchUrge | undefined =>
    loadStore().dispatchUrge.find((row) => row.ticket_id === ticketId && row.status === "OPEN"),
  insert(row: Omit<DispatchUrge, "id">): DispatchUrge {
    const store = loadStore();
    const next: DispatchUrge = { ...row, id: Math.max(0, ...store.dispatchUrge.map((u) => u.id)) + 1 };
    store.dispatchUrge.push(next);
    persist();
    return next;
  },
  update(row: DispatchUrge): DispatchUrge {
    const store = loadStore();
    const index = store.dispatchUrge.findIndex((u) => u.id === row.id);
    if (index >= 0) store.dispatchUrge[index] = row;
    persist();
    return row;
  }
};
