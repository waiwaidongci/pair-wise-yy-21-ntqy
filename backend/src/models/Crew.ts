export interface Crew {
  id: number;
  name: string;
  leader_id: number;
  /** JSON 字符串数组，如 ["线路抢修","开关检修"] */
  skill_tags: string;
  duty_status: string;
  current_ticket_id: number | null;
  contact_phone: string;
}
