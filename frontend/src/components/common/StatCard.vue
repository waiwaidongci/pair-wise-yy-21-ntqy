<script setup lang="ts">
withDefaults(defineProps<{ label: string; value: string | number; tone?: "default" | "danger" | "warn" | "ok" }>(), {
  tone: "default"
});
</script>
<template>
  <div class="stat" :class="'tone-' + tone">
    <span>{{ label }}</span>
    <strong>{{ value }}</strong>
  </div>
</template>
