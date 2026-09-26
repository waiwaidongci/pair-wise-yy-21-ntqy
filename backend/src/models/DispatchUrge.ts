export interface DispatchUrge {
  id: number;
  ticket_id: number;
  status: string;
  escalated_priority: string;
  timeout_minutes: number;
  created_at: string;
  last_scan_at: string;
  scan_count: number;
  closed_at: string;
  close_reason: string;
}
