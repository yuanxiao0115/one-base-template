<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import TopMenu from '../../components/menu/TopMenu.vue';
import TopBar from '../../components/top/TopBar.vue';
import TabsBar from '../../components/tabs/TabsBar.vue';
import KeepAliveView from '../../components/view/KeepAliveView.vue';

const route = useRoute();

const hideTabsBar = computed(() => Boolean(route.meta.hideTabsBar));
const fullScreen = computed(() => Boolean(route.meta.fullScreen));
const contentPaddingClass = computed(() => (fullScreen.value ? 'p-0' : 'p-4'));
</script>

<template>
  <div class="h-screen w-screen flex flex-col bg-[var(--el-bg-color-page)]">
    <header class="shrink-0 bg-white border-b border-[var(--el-border-color)]">
      <TopBar />
      <TopMenu />
      <TabsBar v-if="!hideTabsBar" />
    </header>
    <main class="flex-1 min-h-0 overflow-auto" :class="contentPaddingClass">
      <KeepAliveView />
    </main>
  </div>
</template>
