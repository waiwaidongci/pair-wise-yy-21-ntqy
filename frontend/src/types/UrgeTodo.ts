export interface UrgeTodo {
  id: number;
  ticket_id: number;
  fault_report_id: number;
  severity: string;
  status: string;
  overdue_minutes: number;
  reason: string;
  created_at: string;
  closed_at: string | null;
  close_reason: string | null;
}
