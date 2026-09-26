<script setup lang="ts">
import { computed, ref } from "vue";
import { routes } from "./router/routes";
import DispatchPage from "./pages/DispatchPage.vue";

const active = ref<string>("/dispatch");
const current = computed(() => routes.find((route) => route.route === active.value) ?? routes[0]);
</script>

<template>
  <div class="shell">
    <aside>
      <div class="brand">电力配网抢修工单系统</div>
      <nav>
        <button
          v-for="route in routes"
          :key="route.route"
          :class="{ active: active === route.route }"
          @click="active = route.route"
        >{{ route.name }}</button>
      </nav>
    </aside>
    <main class="page">
      <DispatchPage v-if="current.route === '/dispatch'" />
      <section v-else class="panel placeholder">
        <h2>{{ current.name }}</h2>
        <p>该模块骨架保留，调度台（/dispatch）承载超时催办与派工闭环。</p>
      </section>
    </main>
  </div>
</template>
