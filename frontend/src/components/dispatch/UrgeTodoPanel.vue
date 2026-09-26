<script setup lang="ts">
import { computed, ref } from "vue";
import type { UrgeTodo } from "../../types/UrgeTodo";
import { formatDate, formatDuration } from "../../utils/formatters";
import StatusBadge from "../common/StatusBadge.vue";
import EmptyState from "../common/EmptyState.vue";

const props = defineProps<{ todos: UrgeTodo[] }>();
const emit = defineEmits<{
  (e: "close", id: number, reason: string): void;
  (e: "locate", ticketId: number): void;
}>();

const reasonMap = ref<Record<number, string>>({});

const ordered = computed(() =>
  [...props.todos].sort((a, b) => Number(b.status === "OPEN") - Number(a.status === "OPEN") || b.id - a.id)
);

const submit = (todo: UrgeTodo) => {
  emit("close", todo.id, reasonMap.value[todo.id]?.trim() || "手动解除");
  reasonMap.value[todo.id] = "";
};
</script>

<template>
  <section class="panel urge-panel">
    <div class="panel-head">
      <h2>超时催办待办</h2>
      <span class="hint">重复扫描只保留一条，解除后再超时重新生成</span>
    </div>
    <EmptyState v-if="!ordered.length" text="暂无催办待办" />
    <ul v-else class="urge-list">
      <li v-for="todo in ordered" :key="todo.id" :class="{ closed: todo.status === 'CLOSED' }">
        <div class="urge-main" @click="emit('locate', todo.ticket_id)">
          <div class="urge-row">
            <strong>#{{ todo.ticket_id }} 工单</strong>
            <StatusBadge kind="severity" :value="todo.severity" />
            <StatusBadge kind="urge" :value="todo.status" />
          </div>
          <p class="urge-reason">{{ todo.reason }} · 超时 {{ formatDuration(todo.overdue_minutes) }}</p>
          <p class="urge-time">
            生成 {{ formatDate(todo.created_at) }}
            <template v-if="todo.closed_at"> · 解除 {{ formatDate(todo.closed_at) }}（{{ todo.close_reason }}）</template>
          </p>
        </div>
        <div v-if="todo.status === 'OPEN'" class="urge-actions">
          <input v-model="reasonMap[todo.id]" placeholder="解除说明，如：已电话催办" />
          <button class="btn" @click="submit(todo)">解除催办</button>
        </div>
      </li>
    </ul>
  </section>
</template>
