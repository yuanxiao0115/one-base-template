<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useLayoutStore, useSystemStore } from '@one-base-template/core';

import SidebarMenu from '../../components/menu/SidebarMenu.vue';
import TopBar from '../../components/top/TopBar.vue';
import TabsBar from '../../components/tabs/TabsBar.vue';
import KeepAliveView from '../../components/view/KeepAliveView.vue';

const layoutStore = useLayoutStore();
const systemStore = useSystemStore();
const route = useRoute();

const hideTabsBar = computed(() => Boolean(route.meta.hideTabsBar));
const fullScreen = computed(() => Boolean(route.meta.fullScreen));
const contentPaddingClass = computed(() => (fullScreen.value ? 'p-0' : 'p-4'));
const currentSystemName = computed(() => systemStore.currentSystemName || 'one-base');
</script>

<template>
  <div class="h-screen w-screen flex flex-col bg-[var(--el-bg-color-page)]">
    <header class="shrink-0">
      <TopBar />
    </header>

    <div class="flex-1 min-h-0 flex">
      <aside
        class="shrink-0 border-r border-[var(--el-border-color)] bg-white flex flex-col"
        :class="layoutStore.siderCollapsed ? 'w-16' : 'w-64'"
      >
        <div class="h-12 shrink-0 flex items-center px-4 border-b border-[var(--el-border-color)]">
          <div class="flex items-center justify-between w-full gap-2">
            <div v-show="!layoutStore.siderCollapsed" class="font-medium truncate">
              {{ currentSystemName }}
            </div>
            <button
              type="button"
              class="text-xs text-[var(--el-text-color-regular)] hover:text-[var(--el-color-primary)]"
              :title="layoutStore.siderCollapsed ? '展开菜单' : '折叠菜单'"
              @click="layoutStore.toggleSiderCollapsed"
            >
              {{ layoutStore.siderCollapsed ? '展开' : '折叠' }}
            </button>
          </div>
        </div>

        <div class="flex-1 min-h-0">
          <SidebarMenu :collapsed="layoutStore.siderCollapsed" />
        </div>
      </aside>

      <section class="flex-1 min-w-0 min-h-0 flex flex-col">
        <TabsBar v-if="!hideTabsBar" class="shrink-0" />
        <main class="flex-1 min-h-0 overflow-auto" :class="contentPaddingClass">
          <KeepAliveView />
        </main>
      </section>
    </div>
  </div>
</template>
