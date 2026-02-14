<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { AppMenuItem } from '@one-base-template/core';
import { useLayoutStore, useMenuStore, useSystemStore } from '@one-base-template/core';

import SidebarMenu from '../../components/menu/SidebarMenu.vue';
import SystemMenu from '../../components/menu/SystemMenu.vue';
import TopBar from '../../components/top/TopBar.vue';
import TabsBar from '../../components/tabs/TabsBar.vue';
import KeepAliveView from '../../components/view/KeepAliveView.vue';

const router = useRouter();
const route = useRoute();
const layoutStore = useLayoutStore();
const menuStore = useMenuStore();
const systemStore = useSystemStore();

const hideTabsBar = computed(() => Boolean(route.meta.hideTabsBar));
const fullScreen = computed(() => Boolean(route.meta.fullScreen));
const contentPaddingClass = computed(() => (fullScreen.value ? 'p-0' : 'p-4'));

function findFirstLeafPath(item: AppMenuItem): string | undefined {
  if (item.children?.length) {
    for (const child of item.children) {
      const leaf = findFirstLeafPath(child);
      if (leaf) return leaf;
    }
    return undefined;
  }

  // 仅对“叶子节点”做跳转兜底，避免误跳到“仅用于分组”的父节点 path
  if (!item.external && item.path) return item.path;

  return undefined;
}

const systems = computed(() => systemStore.systems);
const activeSystemCode = computed(() => systemStore.currentSystemCode);
const currentSystemName = computed(() => systemStore.currentSystemName);

function findFirstLeafPathFromList(list: AppMenuItem[]): string | undefined {
  for (const item of list) {
    const leaf = findFirstLeafPath(item);
    if (leaf) return leaf;
  }
  return undefined;
}

async function onSelectSystem(systemCode: string) {
  if (!systemCode || systemCode === systemStore.currentSystemCode) return;

  systemStore.setCurrentSystem(systemCode);

  // 切系统后确保当前系统菜单已加载（fetchMenuSystems 模式通常一次性拉全量，这里主要兜底缓存不全/系统列表变更）
  if (!menuStore.loaded) {
    await menuStore.loadMenus();
  }

  let home = systemStore.resolveHomePath(systemCode);

  // 如果 home 未配置或不在当前系统 allowedPaths 内，兜底跳到第一个可访问叶子路由
  if (!home || !menuStore.isAllowed(home)) {
    const firstLeaf = findFirstLeafPathFromList(menuStore.menus);
    if (firstLeaf) home = firstLeaf;
  }

  if (home) {
    await router.replace(home);
  }
}
</script>

<template>
  <div class="h-screen w-screen flex flex-col bg-[var(--el-bg-color-page)]">
    <header class="shrink-0">
      <TopBar />
      <SystemMenu
        :systems="systems"
        :active="activeSystemCode"
        @select="onSelectSystem"
      />
      <TabsBar v-if="!hideTabsBar" />
    </header>

    <div class="flex-1 min-h-0 flex">
      <aside
        class="w-64 shrink-0 border-r border-[var(--el-border-color)] bg-white flex flex-col"
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

      <main class="flex-1 min-w-0 overflow-auto" :class="contentPaddingClass">
        <KeepAliveView />
      </main>
    </div>
  </div>
</template>
