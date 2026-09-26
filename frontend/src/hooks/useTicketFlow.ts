import { computed, type Ref } from "vue";
import type { DispatchBoardRow } from "../types/DispatchBoard";
import { URGE_TIMEOUT_MINUTES } from "../constants/UrgeTodoStatus";

/**
 * 工单流转辅助：状态标签、下一步动作、超时时长（秒级实时刷新）。
 */
export function useTicketFlow(row: Ref<DispatchBoardRow | null>, now: Ref<number>) {
  /** 待派工工单的实时等待分钟数 */
  const waitMinutes = computed(() => {
    const r = row.value;
    if (!r || r.ticket.status !== "WAIT_DISPATCH") return 0;
    return Math.max(0, Math.floor((now.value - new Date(r.ticket.reported_at).getTime()) / 60_000));
  });

  /** 距离超时剩余分钟数（负数表示已超时） */
  const remainMinutes = computed(() => URGE_TIMEOUT_MINUTES - waitMinutes.value);

  const canAssign = computed(() => row.value?.ticket.status === "WAIT_DISPATCH");
  const canArrive = computed(() => row.value?.ticket.status === "ASSIGNED");
  const canRestore = computed(() => ["ASSIGNED", "ARRIVED", "REPAIRING"].includes(row.value?.ticket.status ?? ""));

  return { waitMinutes, remainMinutes, canAssign, canArrive, canRestore };
}
