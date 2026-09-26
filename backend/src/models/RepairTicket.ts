export interface RepairTicket {
  id: number;
  fault_report_id: number;
  team_id: number | null;
  dispatcher_id: number | null;
  priority: string;
  status: string;
  /** 报修登记时间（超时计时起点） */
  reported_at: string;
  assigned_at: string | null;
  arrived_at: string | null;
  restored_at: string | null;
  /** 超时升级时间，未升级为 null */
  escalated_at: string | null;
}
