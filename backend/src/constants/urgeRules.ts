import { FaultType } from "./FaultType";
import { Severity } from "./Severity";

/** 超时催办阈值（分钟）：重大/紧急报修超过该时长未派工即升级 */
export const URGE_TIMEOUT_MINUTES = Number(process.env.URGE_TIMEOUT_MINUTES ?? 15);

/** 参与超时催办的报修等级：重大或紧急 */
export const URGE_SEVERITIES: readonly string[] = [Severity[1], Severity[2]];

/** 故障类型 -> 班组所需技能标签（技能匹配规则） */
export const FAULT_SKILL_MAP: Record<string, string> = {
  [FaultType[0]]: "线路抢修",
  [FaultType[1]]: "电压治理",
  [FaultType[2]]: "开关检修",
  [FaultType[3]]: "设备更换",
  [FaultType[4]]: "带电作业"
};
