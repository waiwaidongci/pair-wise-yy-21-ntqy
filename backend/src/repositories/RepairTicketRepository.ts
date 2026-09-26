import { store } from "../data/store";
import type { RepairTicket } from "../models/RepairTicket";

export const repairTicketRepository = {
  findAll: (): RepairTicket[] => store.tickets,
  findById: (id: number): RepairTicket | undefined => store.tickets.find((t) => t.id === id),
  findByStatus: (status: string): RepairTicket[] => store.tickets.filter((t) => t.status === status),
  save: (row: Omit<RepairTicket, "id"> & { id?: number }): RepairTicket => {
    const ticket = { ...row, id: row.id ?? store.nextId("repairTicket") } as RepairTicket;
    store.tickets.push(ticket);
    store.save();
    return ticket;
  },
  update: (id: number, patch: Partial<RepairTicket>): RepairTicket | undefined => {
    const ticket = store.tickets.find((t) => t.id === id);
    if (!ticket) return undefined;
    Object.assign(ticket, patch);
    store.save();
    return ticket;
  }
};
