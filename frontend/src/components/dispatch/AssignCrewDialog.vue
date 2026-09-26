<script setup lang="ts">
import { computed } from "vue";
import type { Crew } from "../../types/Crew";
import { useCrewAvailability } from "../../hooks/useCrewAvailability";
import CrewCard from "../common/CrewCard.vue";
import EmptyState from "../common/EmptyState.vue";

const props = defineProps<{
  open: boolean;
  ticketId: number;
  loading: boolean;
  crews: Crew[];
  requiredSkill: string;
}>();
const emit = defineEmits<{
  (e: "close"): void;
  (e: "assign", crewId: number): void;
}>();

const { unavailableReason } = useCrewAvailability(computed(() => props.crews));
</script>

<template>
  <div v-if="open" class="modal-mask" @click.self="emit('close')">
    <div class="modal">
      <header>
        <h3>派工选择 · 工单 #{{ ticketId }}</h3>
        <button class="icon-btn" @click="emit('close')">×</button>
      </header>
      <p class="modal-hint">仅展示在岗班组；必须具备技能「{{ requiredSkill }}」且无未结工单。</p>
      <p v-if="loading" class="hint">加载班组…</p>
      <EmptyState v-else-if="!crews.length" text="没有满足条件的班组，请调整班组状态后再派工" />
      <div v-else class="crew-grid">
        <CrewCard
          v-for="crew in crews"
          :key="crew.id"
          :crew="crew"
          selectable
          :disabled-reason="unavailableReason(crew)"
          @select="emit('assign', crew.id)"
        />
      </div>
    </div>
  </div>
</template>
