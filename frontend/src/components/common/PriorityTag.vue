<script setup lang="ts">
import { computed } from "vue";
import { PriorityText } from "../../constants/Priority";

const props = defineProps<{ value?: string; title?: string }>();
const label = computed(() => PriorityText[props.value as keyof typeof PriorityText] ?? props.title ?? props.value ?? "—");
const levelClass = computed(() => ({ HIGH: "prio-high", MEDIUM: "prio-mid", LOW: "prio-low" }[props.value ?? ""] ?? "prio-mid"));
</script>

<template><span class="prio" :class="levelClass">{{ label }}</span></template>
