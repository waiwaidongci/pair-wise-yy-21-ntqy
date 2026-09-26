export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "missing bearer token",
  RBAC_DENIED: "role denied",
  VALIDATION_FAILED: "invalid payload",
  RATE_LIMITED: "too many requests",
  TICKET_NOT_FOUND: "抢修工单不存在",
  CREW_NOT_FOUND: "抢修班组不存在",
  TICKET_NOT_WAITING: "工单不在待派工状态，无法派工",
  TICKET_NOT_ASSIGNED: "工单未处于已派工状态，无法撤销",
  CREW_OFF_DUTY: "班组已离岗，不能派工",
  CREW_SKILL_MISMATCH: "班组技能与故障类型不匹配",
  CREW_HAS_OPEN_TICKET: "班组存在未结工单，不能重复派工"
};
