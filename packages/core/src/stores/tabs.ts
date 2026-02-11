import { defineStore } from 'pinia';
import { computed, nextTick, ref } from 'vue';
import type { RouteLocationNormalized } from 'vue-router';

export interface TabItem {
  fullPath: string;
  path: string;
  title: string;
  name?: string;
  affix?: boolean;
  keepAlive?: boolean;
}

export const useTabsStore = defineStore('ob-tabs', () => {
  const tabs = ref<TabItem[]>([]);
  const activeFullPath = ref<string>('');

  /** keep-alive include：使用组件名（约定=route.name） */
  const cacheNames = ref<string[]>([]);

  const activeTab = computed(() => tabs.value.find(t => t.fullPath === activeFullPath.value));

  function openByRoute(route: RouteLocationNormalized) {
    const meta = route.meta;
    if (meta.hiddenTab) return;

    const title =
      typeof meta.title === 'string' && meta.title
        ? meta.title
        : route.name
          ? String(route.name)
          : route.path;
    const name = route.name ? String(route.name) : undefined;
    const affix = Boolean(meta.affix);
    const keepAlive = Boolean(meta.keepAlive);

    activeFullPath.value = route.fullPath;

    const exists = tabs.value.find(t => t.fullPath === route.fullPath);
    if (exists) {
      exists.title = title;
      return;
    }

    tabs.value.push({
      fullPath: route.fullPath,
      path: route.path,
      title,
      name,
      affix,
      keepAlive
    });

    if (keepAlive && name) {
      if (!cacheNames.value.includes(name)) {
        cacheNames.value.push(name);
      }
    }
  }

  function close(fullPath: string): { next?: string } {
    const index = tabs.value.findIndex(t => t.fullPath === fullPath);
    if (index === -1) return {};

    const tab = tabs.value[index];
    if (!tab) return {};
    if (tab.affix) return {};

    if (tab.keepAlive && tab.name) {
      cacheNames.value = cacheNames.value.filter(n => n !== tab.name);
    }

    tabs.value.splice(index, 1);

    if (activeFullPath.value !== fullPath) return {};

    const next = tabs.value[index] ?? tabs.value[index - 1];
    activeFullPath.value = next?.fullPath ?? '';
    return { next: next?.fullPath };
  }

  function closeOthers(fullPath: string) {
    tabs.value = tabs.value.filter(t => t.affix || t.fullPath === fullPath);
    activeFullPath.value = fullPath;

    const nextCache = new Set<string>();
    for (const t of tabs.value) {
      if (t.keepAlive && t.name) nextCache.add(t.name);
    }
    cacheNames.value = Array.from(nextCache);
  }

  function closeAll() {
    tabs.value = tabs.value.filter(t => t.affix);
    activeFullPath.value = tabs.value[0]?.fullPath ?? '';

    const nextCache = new Set<string>();
    for (const t of tabs.value) {
      if (t.keepAlive && t.name) nextCache.add(t.name);
    }
    cacheNames.value = Array.from(nextCache);

    return { next: activeFullPath.value };
  }

  async function refreshActive() {
    const tab = activeTab.value;
    if (!tab?.keepAlive || !tab.name) return;

    cacheNames.value = cacheNames.value.filter(n => n !== tab.name);
    await nextTick();
    if (!cacheNames.value.includes(tab.name)) {
      cacheNames.value.push(tab.name);
    }
  }

  function reset() {
    tabs.value = [];
    activeFullPath.value = '';
    cacheNames.value = [];
  }

  return {
    tabs,
    activeFullPath,
    cacheNames,
    activeTab,
    openByRoute,
    close,
    closeOthers,
    closeAll,
    refreshActive,
    reset
  };
});
