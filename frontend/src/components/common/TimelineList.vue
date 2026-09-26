<script setup lang="ts">
export interface TimelineItem {
  time: string;
  title: string;
  desc?: string;
  tone?: "default" | "danger" | "ok";
}
defineProps<{ items: TimelineItem[]; emptyText?: string }>();
</script>

<template>
  <ol v-if="items.length" class="timeline">
    <li v-for="(item, i) in items" :key="i" :class="['tl-item', 'tone-' + (item.tone ?? 'default')]">
      <div class="tl-dot" />
      <div class="tl-body">
        <p class="tl-title">{{ item.title }}</p>
        <p v-if="item.desc" class="tl-desc">{{ item.desc }}</p>
        <time>{{ item.time }}</time>
      </div>
    </li>
  </ol>
  <div v-else class="empty">{{ emptyText ?? "暂无数据" }}</div>
</template>
