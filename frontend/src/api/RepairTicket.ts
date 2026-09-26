import { request } from "./request";
import type { RepairTicket } from "../types/RepairTicket";
import type { DispatchBoardRow } from "../types/DispatchBoard";
import type { Crew } from "../types/Crew";

const endpoint = "/api/repair-ticket";

export const listRepairTicket = () => request<RepairTicket[]>(endpoint);

export const fetchDispatchBoard = () => request<DispatchBoardRow[]>(`${endpoint}/board`);

export const listAvailableCrews = (ticketId: number) =>
  request<Crew[]>(`${endpoint}/${ticketId}/available-crews`);

export const assignTicket = (ticketId: number, crewId: number) =>
  request<{ ticket: RepairTicket; crew: Crew }>(`${endpoint}/${ticketId}/assign`, {
    method: "POST",
    body: JSON.stringify({ crew_id: crewId, dispatcher_id: 1 })
  });

export const arriveTicket = (ticketId: number) =>
  request<RepairTicket>(`${endpoint}/${ticketId}/arrive`, { method: "POST" });

export const restoreTicket = (ticketId: number) =>
  request<RepairTicket>(`${endpoint}/${ticketId}/restore`, { method: "POST" });
