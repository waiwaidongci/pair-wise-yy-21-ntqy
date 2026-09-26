export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "missing bearer token",
  RBAC_DENIED: "role denied",
  VALIDATION_FAILED: "invalid payload",
  RATE_LIMITED: "too many requests",
  TICKET_NOT_FOUND: "抢修工单不存在",
  REPORT_NOT_FOUND: "故障报修不存在",
  CREW_NOT_FOUND: "抢修班组不存在",
  TODO_NOT_FOUND: "催办待办不存在",
  TICKET_NOT_WAITING: "工单不在待派工状态，无法派工",
  CREW_UNAVAILABLE: "班组已离岗，无法派工",
  CREW_SKILL_MISMATCH: "班组技能与故障类型不匹配",
  CREW_HAS_OPEN_TICKET: "班组存在未结工单，无法派工",
  INVALID_STATUS_TRANSITION: "非法的工单状态流转"
};
