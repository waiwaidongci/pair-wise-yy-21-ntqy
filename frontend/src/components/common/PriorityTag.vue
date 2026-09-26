<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{ value: string; escalated?: boolean }>(), { escalated: false });

const TEXT: Record<string, string> = { LOW: "低优先级", MEDIUM: "中优先级", HIGH: "高优先级" };
const label = computed(() => (props.escalated ? "超时升级" : TEXT[props.value] ?? props.value));
</script>

<template>
  <span class="badge badge-priority" :class="{ escalated: escalated || value === 'HIGH' }">
    {{ label }}
  </span>
</template>
