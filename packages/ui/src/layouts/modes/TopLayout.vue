<script setup lang="ts">
import { computed, inject } from 'vue';
import { useRoute } from 'vue-router';

import TopMenu from '../../components/menu/TopMenu.vue';
import TopBar from '../../components/top/TopBar.vue';
import TabsBar from '../../components/tabs/TabsBar.vue';
import KeepAliveView from '../../components/view/KeepAliveView.vue';
import { DEFAULT_ONE_UI_GLOBAL_CONFIG, ONE_UI_GLOBAL_CONFIG_KEY } from '../../config';

const route = useRoute();
const globalConfig = inject(ONE_UI_GLOBAL_CONFIG_KEY, DEFAULT_ONE_UI_GLOBAL_CONFIG);

const hideTabsBar = computed(() => Boolean(route.meta.hideTabsBar));
const fullScreen = computed(() => Boolean(route.meta.fullScreen));
const contentPaddingClass = computed(() => (fullScreen.value ? 'p-0' : 'p-4'));
const topBarComponent = computed(() => globalConfig.topBarComponent || TopBar);
</script>

<template>
  <div class="h-screen w-screen flex flex-col bg-[var(--el-bg-color-page)]">
    <header class="shrink-0">
      <component :is="topBarComponent" />
      <TopMenu />
      <TabsBar v-if="!hideTabsBar" />
    </header>
    <main class="flex-1 min-h-0 overflow-auto" :class="contentPaddingClass"><KeepAliveView /></main>
  </div>
</template>
