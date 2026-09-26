import { request } from "./request";
import type { UrgeTodo } from "../types/UrgeTodo";

const endpoint = "/api/urge-todo";

export const listUrgeTodos = (status?: string) =>
  request<UrgeTodo[]>(status ? `${endpoint}?status=${status}` : endpoint);

export const closeUrgeTodo = (id: number, reason?: string) =>
  request<UrgeTodo>(`${endpoint}/${id}/close`, { method: "POST", body: JSON.stringify({ reason }) });

export const scanUrgeTodos = () =>
  request<{ escalated: number[]; reopened: number[] }>(`${endpoint}/scan`, { method: "POST" });
