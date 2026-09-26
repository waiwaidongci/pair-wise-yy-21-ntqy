import { loadStore, persist } from "../utils/jsonStore";
import type { RepairTicket } from "../models/RepairTicket";

export const repairTicketRepository = {
  findAll: (): RepairTicket[] => loadStore().repairTicket,
  findById: (id: number): RepairTicket | undefined => loadStore().repairTicket.find((row) => row.id === id),
  save(row: Partial<RepairTicket>): RepairTicket {
    const store = loadStore();
    const next = { ...row, id: row.id ?? Math.max(0, ...store.repairTicket.map((t) => t.id)) + 1 } as RepairTicket;
    store.repairTicket.push(next);
    persist();
    return next;
  },
  update(row: RepairTicket): RepairTicket {
    const store = loadStore();
    const index = store.repairTicket.findIndex((t) => t.id === row.id);
    if (index >= 0) store.repairTicket[index] = row;
    persist();
    return row;
  }
};
