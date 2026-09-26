// 班组不可派原因与催办状态文案，调度台页面共用
export const CREW_REJECT_REASON_TEXT: Record<string, string> = {
  CREW_SKILL_MISMATCH: "技能不匹配",
  CREW_OFF_DUTY: "离岗",
  CREW_HAS_OPEN_TICKET: "有未结工单"
};

export const TICKET_URGE_STATE_TEXT: Record<string, string> = {
  URGING: "催办中",
  ESCALATED: "已升级",
  WAITING: "未超时",
  NORMAL: "普通工单"
};
