<script setup lang="ts">
import { computed } from "vue";
import type { Crew } from "../../types/Crew";
import { parseSkillTags } from "../../utils/formatters";
import StatusBadge from "./StatusBadge.vue";

const props = withDefaults(
  defineProps<{ crew: Crew; selectable?: boolean; disabledReason?: string }>(),
  { selectable: false, disabledReason: "" }
);

const emit = defineEmits<{ (e: "select", crew: Crew): void }>();
const skills = computed(() => parseSkillTags(props.crew.skill_tags));
</script>

<template>
  <div class="crew-card" :class="{ disabled: !!disabledReason }">
    <div class="crew-head">
      <strong>{{ crew.name }}</strong>
      <StatusBadge kind="duty" :value="crew.duty_status" />
    </div>
    <p class="crew-skills">
      <span v-for="skill in skills" :key="skill" class="skill">{{ skill }}</span>
    </p>
    <p class="crew-meta">电话 {{ crew.contact_phone }} · 未结工单 {{ crew.current_ticket_id ?? "无" }}</p>
    <p v-if="disabledReason" class="crew-block">不可派工：{{ disabledReason }}</p>
    <button v-else-if="selectable" class="btn primary" @click="emit('select', crew)">派给该班组</button>
  </div>
</template>
