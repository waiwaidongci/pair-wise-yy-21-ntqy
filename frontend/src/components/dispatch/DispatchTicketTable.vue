<script setup lang="ts">
import type { DispatchBoardRow } from "../../types/DispatchBoard";
import { formatDate, formatDuration } from "../../utils/formatters";
import { FaultTypeText } from "../../constants/FaultType";
import { URGE_TIMEOUT_MINUTES } from "../../constants/UrgeTodoStatus";
import StatusBadge from "../common/StatusBadge.vue";
import PriorityTag from "../common/PriorityTag.vue";
import EmptyState from "../common/EmptyState.vue";

defineProps<{
  rows: DispatchBoardRow[];
  now: number;
  highlightTicketId: number | null;
}>();
const emit = defineEmits<{
  (e: "assign", row: DispatchBoardRow): void;
  (e: "arrive", id: number): void;
  (e: "restore", id: number): void;
}>();

const liveWait = (row: DispatchBoardRow, now: number) =>
  row.ticket.status === "WAIT_DISPATCH"
    ? Math.max(0, Math.floor((now - new Date(row.ticket.reported_at).getTime()) / 60_000))
    : row.wait_minutes;
</script>

<template>
  <section class="panel">
    <div class="panel-head">
      <h2>待派工 / 在途工单</h2>
      <span class="hint">重大、紧急报修超过 {{ URGE_TIMEOUT_MINUTES }} 分钟未派工即自动升级催办</span>
    </div>
    <EmptyState v-if="!rows.length" text="暂无工单" />
    <table v-else class="ticket-table">
      <thead>
        <tr>
          <th>工单</th><th>报修</th><th>地址</th><th>报修时间</th>
          <th>等待时长</th><th>优先级</th><th>状态</th><th>催办</th><th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          :key="row.ticket.id"
          :class="{ overdue: row.is_overdue, flash: highlightTicketId === row.ticket.id }"
        >
          <td><strong>#{{ row.ticket.id }}</strong></td>
          <td>
            <div class="cell-stack">
              <StatusBadge v-if="row.report" kind="severity" :value="row.report.severity" />
              <span>{{ row.report ? FaultTypeText[row.report.fault_type as keyof typeof FaultTypeText] ?? row.report.fault_type : "-" }}</span>
              <span class="sub">{{ row.report?.reporter_name }} {{ row.report?.phone }}</span>
            </div>
          </td>
          <td>{{ row.report?.address_desc ?? "-" }}</td>
          <td>{{ row.report ? formatDate(row.report.reported_at) : "-" }}</td>
          <td>
            <span :class="{ 'danger-text': row.is_overdue }">
              {{ formatDuration(liveWait(row, now)) }}
            </span>
            <span v-if="row.urge_rule_hit && row.ticket.status === 'WAIT_DISPATCH' && !row.is_overdue" class="sub">
              距催办 {{ URGE_TIMEOUT_MINUTES - liveWait(row, now) }} 分钟
            </span>
          </td>
          <td><PriorityTag :value="row.ticket.priority" :escalated="!!row.ticket.escalated_at" /></td>
          <td><StatusBadge kind="ticket" :value="row.ticket.status" /></td>
          <td>
            <StatusBadge v-if="row.open_todo" kind="urge" value="OPEN" />
            <span v-else-if="row.is_overdue" class="danger-text">待生成</span>
            <span v-else class="sub">—</span>
          </td>
          <td>
            <div class="row-actions">
              <button v-if="row.ticket.status === 'WAIT_DISPATCH'" class="btn primary" @click="emit('assign', row)">派工</button>
              <button v-if="row.ticket.status === 'ASSIGNED'" class="btn" @click="emit('arrive', row.ticket.id)">到场</button>
              <button
                v-if="['ASSIGNED', 'ARRIVED', 'REPAIRING'].includes(row.ticket.status)"
                class="btn ok"
                @click="emit('restore', row.ticket.id)"
              >复电</button>
              <span v-if="['RESTORED', 'CLOSED'].includes(row.ticket.status)" class="sub">已闭环</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
