<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useDispatchStore } from "../stores/DispatchStore";
import { usePagination } from "../hooks/usePagination";
import { FaultTypeText } from "../constants/FaultType";
import { SeverityText } from "../constants/Severity";
import { DutyStatusText } from "../constants/DutyStatus";
import { UrgeCloseReasonText } from "../constants/UrgeStatus";
import { CREW_REJECT_REASON_TEXT, TICKET_URGE_STATE_TEXT } from "../constants/dispatchText";
import { formatDate, formatDurationMinutes } from "../utils/formatters";
import type { PendingTicketView } from "../types/DispatchOverview";
import StatusBadge from "../components/common/StatusBadge.vue";
import StatCard from "../components/common/StatCard.vue";
import PriorityTag from "../components/common/PriorityTag.vue";
import EmptyState from "../components/common/EmptyState.vue";

const store = useDispatchStore();
const now = ref(Date.now());
const dispatchTarget = ref<PendingTicketView | null>(null);
const chosenCrew = ref(0);

let ticker: ReturnType<typeof setInterval>;
let refresher: ReturnType<typeof setInterval>;
onMounted(async () => {
  await store.load();
  ticker = setInterval(() => (now.value = Date.now()), 15000);
  refresher = setInterval(() => store.load(), 30000);
});
onBeforeUnmount(() => {
  clearInterval(ticker);
  clearInterval(refresher);
});

const timeoutMinutes = computed(() => store.overview?.escalation_timeout_minutes ?? 15);
const escalatable = (severity: string) => severity === "MAJOR" || severity === "URGENT";
const waitedMinutes = (createdAt: string) => Math.max(0, (now.value - new Date(createdAt).getTime()) / 60000);
const overtimeMinutes = (row: PendingTicketView) =>
  escalatable(row.severity) ? Math.max(0, waitedMinutes(row.ticket.created_at) - timeoutMinutes.value) : 0;
const urgeState = (row: PendingTicketView) => {
  if (row.urge_status === "OPEN") return TICKET_URGE_STATE_TEXT.URGING;
  if (overtimeMinutes(row) > 0) return TICKET_URGE_STATE_TEXT.ESCALATED;
  return escalatable(row.severity) ? TICKET_URGE_STATE_TEXT.WAITING : TICKET_URGE_STATE_TEXT.NORMAL;
};

const pending = computed(() => store.overview?.pending ?? []);
const inProgress = computed(() => store.overview?.in_progress ?? []);
const openUrgeRows = computed(() =>
  store.openUrges.map((urge) => {
    const row = pending.value.find((p) => p.ticket.id === urge.ticket_id);
    return { urge, overtime: row ? overtimeMinutes(row) : 0 };
  })
);

const closedPager = usePagination(store.closedUrges);
const closedPageRows = computed(() => {
  closedPager.total = store.closedUrges.length;
  return store.closedUrges.slice((closedPager.page.value - 1) * closedPager.pageSize, closedPager.page.value * closedPager.pageSize);
});

async function openDispatch(row: PendingTicketView) {
  dispatchTarget.value = row;
  chosenCrew.value = 0;
  await store.loadEligibility(row.ticket.id);
}
async function confirmDispatch() {
  if (!dispatchTarget.value || !chosenCrew.value) return;
  const ok = await store.dispatch(dispatchTarget.value.ticket.id, chosenCrew.value);
  if (ok) dispatchTarget.value = null;
}
const eligibility = computed(() =>
  dispatchTarget.value ? store.eligibility[dispatchTarget.value.ticket.id] ?? [] : []
);
</script>

<template>
  <div class="dispatch">
    <section class="metrics">
      <StatCard label="待派工工单" :value="pending.length" />
      <StatCard label="超时催办中" :value="store.openUrges.length" />
      <StatCard label="进行中工单" :value="inProgress.length" />
    </section>

    <p v-if="store.error" class="error-banner">{{ store.error }}</p>

    <section class="workbench">
      <div class="panel wide">
        <h2>
          待派工工单
          <button class="mini" :disabled="store.loading" @click="store.scan()">立即扫描</button>
          <span class="hint">重大/紧急报修超过 {{ timeoutMinutes }} 分钟未派工将升级高优先级并生成催办待办</span>
        </h2>
        <EmptyState v-if="!pending.length" title="暂无待派工工单" />
        <article class="ticket-row" v-for="row in pending" :key="row.ticket.id" :class="{ overtime: overtimeMinutes(row) > 0 }">
          <div class="ticket-main">
            <strong>#{{ row.ticket.id }} {{ FaultTypeText[row.fault_type as keyof typeof FaultTypeText] ?? row.fault_type }}</strong>
            <span class="sub">{{ row.address_desc }} · 报修人 {{ row.reporter_name }}</span>
            <span class="sub">
              严重度 {{ SeverityText[row.severity as keyof typeof SeverityText] ?? row.severity }} ·
              已等待 {{ formatDurationMinutes(waitedMinutes(row.ticket.created_at)) }}
              <template v-if="overtimeMinutes(row) > 0"> · <b class="overtime-text">超时 {{ formatDurationMinutes(overtimeMinutes(row)) }}</b></template>
            </span>
          </div>
          <PriorityTag :value="row.ticket.priority" />
          <StatusBadge :value="urgeState(row)" />
          <button @click="openDispatch(row)">派工</button>
        </article>

        <div v-if="dispatchTarget" class="dispatch-box">
          <h3>为工单 #{{ dispatchTarget.ticket.id }} 选择班组（技能匹配 / 非离岗 / 无未结工单）</h3>
          <article class="crew-row" v-for="item in eligibility" :key="item.crew.id" :class="{ disabled: !item.eligible }">
            <label>
              <input type="radio" name="crew" :value="item.crew.id" :disabled="!item.eligible" v-model.number="chosenCrew" />
              <strong>{{ item.crew.name }}</strong>
            </label>
            <span class="sub">技能 {{ item.crew.skill_tags }}</span>
            <StatusBadge :value="DutyStatusText[item.crew.duty_status as keyof typeof DutyStatusText] ?? item.crew.duty_status" />
            <span v-if="item.eligible" class="ok">可派</span>
            <span v-else class="reject">{{ item.reasons.map((r) => CREW_REJECT_REASON_TEXT[r] ?? r).join("、") }}</span>
          </article>
          <div class="actions">
            <button :disabled="!chosenCrew" @click="confirmDispatch">确认派工</button>
            <button class="mini" @click="dispatchTarget = null">取消</button>
          </div>
        </div>
      </div>

      <div class="panel">
        <h2>催办待办</h2>
        <EmptyState v-if="!openUrgeRows.length" title="暂无催办待办" />
        <article class="urge-row" v-for="row in openUrgeRows" :key="row.urge.id">
          <strong>工单 #{{ row.urge.ticket_id }}</strong>
          <span class="overtime-text">已超时 {{ formatDurationMinutes(row.overtime) }}</span>
          <span class="sub">升级于 {{ formatDate(row.urge.created_at) }} · 扫描 {{ row.urge.scan_count }} 次</span>
        </article>

        <h2>进行中工单</h2>
        <EmptyState v-if="!inProgress.length" title="暂无进行中工单" />
        <article class="urge-row" v-for="row in inProgress" :key="row.ticket.id">
          <strong>#{{ row.ticket.id }} → {{ row.team_name }}</strong>
          <span class="sub">{{ row.ticket.status }} · 派工于 {{ formatDate(row.ticket.assigned_at) }}</span>
          <button v-if="row.ticket.status === 'ASSIGNED'" class="mini" @click="store.revoke(row.ticket.id)">撤销派工</button>
        </article>

        <h2>催办记录</h2>
        <EmptyState v-if="!store.closedUrges.length" title="暂无历史催办" />
        <article class="urge-row" v-for="urge in closedPageRows" :key="urge.id">
          <strong>工单 #{{ urge.ticket_id }}</strong>
          <StatusBadge value="已解除" />
          <span class="sub">{{ UrgeCloseReasonText[urge.close_reason] ?? urge.close_reason }} · {{ formatDate(urge.closed_at) }}</span>
        </article>
        <div class="pager" v-if="closedPager.total > closedPager.pageSize">
          <button class="mini" :disabled="closedPager.page.value <= 1" @click="closedPager.page.value--">上一页</button>
          <span class="sub">{{ closedPager.page.value }} / {{ Math.ceil(closedPager.total / closedPager.pageSize) }}</span>
          <button class="mini" :disabled="closedPager.page.value * closedPager.pageSize >= closedPager.total" @click="closedPager.page.value++">下一页</button>
        </div>
      </div>
    </section>
  </div>
</template>
