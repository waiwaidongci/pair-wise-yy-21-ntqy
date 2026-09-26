<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{ value: string; kind?: "ticket" | "severity" | "duty" | "urge" | "plain" }>(), {
  kind: "plain"
});

const TICKET_TEXT: Record<string, string> = {
  WAIT_DISPATCH: "待派工", ASSIGNED: "已派工", ARRIVED: "已到场",
  REPAIRING: "抢修中", RESTORED: "已复电", CLOSED: "已关闭"
};
const SEVERITY_TEXT: Record<string, string> = { NORMAL: "一般", MAJOR: "重大", URGENT: "紧急" };
const DUTY_TEXT: Record<string, string> = { ON_DUTY: "在岗", OFF_DUTY: "离岗", BUSY: "任务中" };
const URGE_TEXT: Record<string, string> = { OPEN: "催办中", CLOSED: "已解除" };

const text = computed(() => {
  switch (props.kind) {
    case "ticket": return TICKET_TEXT[props.value] ?? props.value;
    case "severity": return SEVERITY_TEXT[props.value] ?? props.value;
    case "duty": return DUTY_TEXT[props.value] ?? props.value;
    case "urge": return URGE_TEXT[props.value] ?? props.value;
    default: return props.value.replace(/_/g, " ");
  }
});
</script>

<template>
  <span class="badge" :class="['badge-' + kind, 'v-' + value]">{{ text }}</span>
</template>
