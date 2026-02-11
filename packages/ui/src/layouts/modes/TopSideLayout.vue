<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { AppMenuItem } from '@one-base-template/core';
import { useLayoutStore, useMenuStore } from '@one-base-template/core';

import SidebarMenu from '../../components/menu/SidebarMenu.vue';
import SystemMenu from '../../components/menu/SystemMenu.vue';
import TopBar from '../../components/top/TopBar.vue';
import TabsBar from '../../components/tabs/TabsBar.vue';
import KeepAliveView from '../../components/view/KeepAliveView.vue';

const route = useRoute();
const router = useRouter();
const layoutStore = useLayoutStore();
const menuStore = useMenuStore();

const systems = computed(() => menuStore.menus);

function findItemByPath(list: AppMenuItem[], path: string): AppMenuItem | undefined {
  for (const item of list) {
    if (item.path === path) return item;
    if (item.children?.length) {
      const found = findItemByPath(item.children, path);
      if (found) return found;
    }
  }
  return undefined;
}

function containsPath(item: AppMenuItem, path: string): boolean {
  if (item.path === path) return true;
  if (!item.children?.length) return false;
  return item.children.some(c => containsPath(c, path));
}

function findSystemByRoutePath(path: string): AppMenuItem | undefined {
  for (const sys of systems.value) {
    if (containsPath(sys, path)) return sys;
  }
  return undefined;
}

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

const activeSystem = computed(() => {
  if (!systems.value.length) return undefined;
  const hit = systems.value.find(s => s.path === layoutStore.activeSystem);
  return hit ?? systems.value[0];
});

const activeMenus = computed(() => activeSystem.value?.children ?? []);

// 路由切换时，自动同步当前 system（确保顶栏高亮正确）
watch(
  () => route.path,
  () => {
    if (!systems.value.length) return;
    const sys = findSystemByRoutePath(route.path);
    if (sys && layoutStore.activeSystem !== sys.path) {
      layoutStore.setActiveSystem(sys.path);
    }
  },
  { immediate: true }
);

// 菜单加载后，初始化默认 system（避免首次进入时为空）
watch(
  () => systems.value,
  list => {
    if (!list.length) return;
    if (layoutStore.activeSystem && findItemByPath(list, layoutStore.activeSystem)) return;

    const sys = findSystemByRoutePath(route.path) ?? list[0];
    if (sys) layoutStore.setActiveSystem(sys.path);
  },
  { immediate: true }
);

function onSelectSystem(path: string) {
  const sys = systems.value.find(s => s.path === path);
  if (!sys) return;

  if (sys.external) {
    window.open(sys.path, '_blank', 'noopener,noreferrer');
    return;
  }

  layoutStore.setActiveSystem(path);

  // 如果当前路由不在该系统下，则跳到系统的第一个可用叶子路由
  if (!containsPath(sys, route.path)) {
    const next = findFirstLeafPath(sys);
    if (next) router.push(next);
  }
}
</script>

<template>
  <div class="h-screen w-screen flex flex-col bg-[var(--el-bg-color-page)]">
    <header class="shrink-0">
      <TopBar />
      <SystemMenu
        :systems="systems"
        :active="activeSystem?.path ?? ''"
        @select="onSelectSystem"
      />
      <TabsBar />
    </header>

    <div class="flex-1 min-h-0 flex">
      <aside
        class="w-64 shrink-0 border-r border-[var(--el-border-color)] bg-white flex flex-col"
        :class="layoutStore.siderCollapsed ? 'w-16' : 'w-64'"
      >
        <div class="h-12 shrink-0 flex items-center px-4 border-b border-[var(--el-border-color)]">
          <div class="flex items-center justify-between w-full gap-2">
            <div v-show="!layoutStore.siderCollapsed" class="font-medium truncate">
              {{ activeSystem?.title ?? '系统' }}
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
          <SidebarMenu
            :menus="activeMenus"
            :collapsed="layoutStore.siderCollapsed"
          />
        </div>
      </aside>

      <main class="flex-1 min-w-0 overflow-auto p-4">
        <KeepAliveView />
      </main>
    </div>
  </div>
</template>
