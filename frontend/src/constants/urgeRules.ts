import { FaultType } from "./FaultType";

/** 故障类型 -> 班组所需技能标签（与后端 FAULT_SKILL_MAP 保持一致） */
export const FAULT_SKILL_MAP: Record<string, string> = {
  [FaultType[0]]: "线路抢修",
  [FaultType[1]]: "电压治理",
  [FaultType[2]]: "开关检修",
  [FaultType[3]]: "设备更换",
  [FaultType[4]]: "带电作业"
};
