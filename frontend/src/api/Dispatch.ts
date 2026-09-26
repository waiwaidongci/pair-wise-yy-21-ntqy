import type { DispatchOverview, CrewEligibility } from "../types/DispatchOverview";
import type { DispatchUrge } from "../types/DispatchUrge";

const endpoint = "/api/dispatch";

async function request<T>(path: string, init?: RequestInit, fallback?: T): Promise<T> {
  const res = await fetch(`${endpoint}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `请求失败(${res.status})`);
  }
  return (await res.json()) as T ?? (fallback as T);
}

const emptyOverview: DispatchOverview = {
  scanned_at: "",
  escalation_timeout_minutes: 15,
  pending: [],
  in_progress: [],
  open_urges: []
};

export const fetchDispatchOverview = () => request<DispatchOverview>("/overview", undefined, emptyOverview);
export const fetchDispatchUrges = () => request<DispatchUrge[]>("/urges", undefined, []);
export const postDispatchScan = () => request<{ scanned_at: string }>("/scan", { method: "POST" });
export const fetchEligibleCrews = (ticketId: number) =>
  request<CrewEligibility[]>(`/eligible-crews?ticket_id=${ticketId}`, undefined, []);
export const postDispatch = (ticketId: number, teamId: number) =>
  request("/dispatch", { method: "POST", body: JSON.stringify({ ticket_id: ticketId, team_id: teamId }) });
export const postRevoke = (ticketId: number) =>
  request("/revoke", { method: "POST", body: JSON.stringify({ ticket_id: ticketId }) });
