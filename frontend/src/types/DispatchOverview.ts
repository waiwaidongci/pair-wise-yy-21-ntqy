import type { RepairTicket } from "./RepairTicket";
import type { DispatchUrge } from "./DispatchUrge";
import type { Crew } from "./Crew";

export interface PendingTicketView {
  ticket: RepairTicket;
  fault_type: string;
  severity: string;
  address_desc: string;
  reporter_name: string;
  waited_minutes: number;
  overtime_minutes: number;
  urge_status: string;
  urge_id: number | null;
}

export interface InProgressTicketView {
  ticket: RepairTicket;
  team_name: string;
}

export interface DispatchOverview {
  scanned_at: string;
  escalation_timeout_minutes: number;
  pending: PendingTicketView[];
  in_progress: InProgressTicketView[];
  open_urges: DispatchUrge[];
}

export interface CrewEligibility {
  crew: Crew;
  eligible: boolean;
  reasons: string[];
}
