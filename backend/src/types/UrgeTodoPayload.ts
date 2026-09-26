export interface UrgeTodoPayload {
  ticket_id: number;
  fault_report_id: number;
  severity: string;
  status: string;
  overdue_minutes: number;
  reason: string;
}
