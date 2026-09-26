<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useDispatchConsoleStore } from "../stores/DispatchConsoleStore";
import { FAULT_SKILL_MAP } from "../constants/urgeRules";
import type { DispatchBoardRow } from "../types/DispatchBoard";
import StatCard from "../components/common/StatCard.vue";
import DispatchTicketTable from "../components/dispatch/DispatchTicketTable.vue";
import UrgeTodoPanel from "../components/dispatch/UrgeTodoPanel.vue";
import AssignCrewDialog from "../components/dispatch/AssignCrewDialog.vue";

const store = useDispatchConsoleStore();

/** 本地秒级时钟：让等待时长实时跳动，后端数据每 5 秒轮询刷新 */
const now = ref(Date.now());
let clockTimer: ReturnType<typeof setInterval> | undefined;
let pollTimer: ReturnType<typeof setInterval> | undefined;

const highlightTicketId = ref<number | null>(null);
const assignRow = ref<DispatchBoardRow | null>(null);

const requiredSkill = computed(() => {
  const faultType = assignRow.value?.report?.fault_type;
  return faultType ? FAULT_SKILL_MAP[faultType] ?? "" : "";
});

const openAssign = (row: DispatchBoardRow) => {
  assignRow.value = row;
  void store.openAssign(row.ticket.id);
};

const doAssign = async (crewId: number) => {
  await store.doAssign(crewId);
  if (!store.assign) assignRow.value = null;
};

const closeAssign = () => {
  assignRow.value = null;
  store.closeAssign();
};

const locate = (ticketId: number) => {
  highlightTicketId.value = ticketId;
  document.getElementById("dispatch-table")?.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => (highlightTicketId.value = null), 2500);
};

onMounted(async () => {
  await store.refresh();
  clockTimer = setInterval(() => (now.value = Date.now()), 1000);
  pollTimer = setInterval(() => void store.refresh(), 5000);
});
onBeforeUnmount(() => {
  clearInterval(clockTimer);
  clearInterval(pollTimer);
});
</script>

<template>
  <div class="dispatch-page">
    <section class="page-head">
      <div>
        <p class="eyebrow">grid-repair · 调度台</p>
        <h1>抢修调度台</h1>
      </div>
      <div class="head-actions">
        <button class="btn" :disabled="store.loading" @click="store.refresh()">刷新</button>
        <button class="btn primary" @click="store.scanNow()">立即扫描超时</button>
      </div>
    </section>

    <p v-if="store.actionError" class="error-banner">{{ store.actionError }}</p>

    <section class="metrics">
      <StatCard label="待派工工单" :value="store.waitingRows.length" />
      <StatCard label="超时未派工" :value="store.overdueRows.length" tone="danger" />
      <StatCard label="催办中待办" :value="store.openTodos.length" tone="warn" />
      <StatCard label="催办待办总数" :value="store.todos.length" tone="ok" />
    </section>

    <div id="dispatch-table">
      <DispatchTicketTable
        :rows="store.board"
        :now="now"
        :highlight-ticket-id="highlightTicketId"
        @assign="openAssign"
        @arrive="store.doArrive"
        @restore="store.doRestore"
      />
    </div>

    <UrgeTodoPanel :todos="store.todos" @close="store.doCloseTodo" @locate="locate" />

    <AssignCrewDialog
      :open="!!assignRow"
      :ticket-id="assignRow?.ticket.id ?? 0"
      :loading="store.assign?.loading ?? false"
      :crews="store.assign?.crews ?? []"
      :required-skill="requiredSkill"
      @close="closeAssign"
      @assign="doAssign"
    />
  </div>
</template>
