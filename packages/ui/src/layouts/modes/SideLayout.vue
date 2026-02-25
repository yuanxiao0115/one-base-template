<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useLayoutStore } from '@one-base-template/core';

import SidebarMenu from '../../components/menu/SidebarMenu.vue';
import TopBar from '../../components/top/TopBar.vue';
import TabsBar from '../../components/tabs/TabsBar.vue';
import KeepAliveView from '../../components/view/KeepAliveView.vue';

const layoutStore = useLayoutStore();
const route = useRoute();

const hideTabsBar = computed(() => Boolean(route.meta.hideTabsBar));
const fullScreen = computed(() => Boolean(route.meta.fullScreen));
const contentPaddingClass = computed(() => (fullScreen.value ? 'p-0' : 'p-4'));
const sidebarStyle = computed(() => ({
  width: layoutStore.siderCollapsed ? layoutStore.sidebarCollapsedWidth : layoutStore.sidebarWidth
}));
const collapseIcon = computed(() => (layoutStore.siderCollapsed ? 'ri:menu-unfold-line' : 'ri:menu-fold-line'));
const collapseLabel = computed(() => (layoutStore.siderCollapsed ? '展开菜单' : '折叠菜单'));
</script>

<template>
  <div class="h-screen w-screen flex flex-col bg-[var(--el-bg-color-page)]">
    <header class="shrink-0">
      <TopBar />
    </header>

    <div class="flex-1 min-h-0 flex">
      <aside
        class="shrink-0 border-r border-[var(--el-border-color)] bg-white flex flex-col"
        :style="sidebarStyle"
      >
        <div class="flex-1 min-h-0">
          <SidebarMenu :collapsed="layoutStore.siderCollapsed" />
        </div>

        <div class="ob-side-layout__collapse-panel shrink-0 border-t border-[var(--el-border-color)]">
          <el-tooltip :content="collapseLabel" :show-after="280" placement="right" effect="dark">
            <button
              type="button"
              class="ob-side-layout__collapse-btn"
              :aria-label="collapseLabel"
              :title="collapseLabel"
              @click="layoutStore.toggleSiderCollapsed"
            >
              <Icon :icon="collapseIcon" width="20" height="20" />
            </button>
          </el-tooltip>
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

<style scoped>
.ob-side-layout__collapse-panel {
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 8px;
}

.ob-side-layout__collapse-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  color: var(--one-text-color-secondary, #666666);
  transition:
    color 180ms ease,
    background-color 180ms ease,
    transform 120ms ease;
}

.ob-side-layout__collapse-btn:hover {
  color: var(--one-color-primary, #0f79e9);
  background: var(--one-color-primary-light-1, #e7f1fc);
}

.ob-side-layout__collapse-btn:active {
  transform: translateY(1px);
}
</style>
