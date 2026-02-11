import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { AppMenuItem, MenuMode } from '../adapter/types';
import { getCoreOptions } from '../context';
import { isHttpUrl } from '../utils/url';

function normalizeMenuTree(items: AppMenuItem[]): AppMenuItem[] {
  const walk = (list: AppMenuItem[]): AppMenuItem[] => {
    return list
      .map(item => {
        const external = item.external ?? isHttpUrl(item.path);
        const children = item.children ? walk(item.children) : undefined;
        return { ...item, external, children };
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  };
  return walk(items);
}

function collectAllowedPaths(items: AppMenuItem[], out: Set<string>) {
  for (const item of items) {
    // 外链不参与路由访问控制
    if (!item.external) {
      out.add(item.path);
    }
    if (item.children?.length) {
      collectAllowedPaths(item.children, out);
    }
  }
}

export const useMenuStore = defineStore('sb-menu', () => {
  const menus = ref<AppMenuItem[]>([]);
  const loaded = ref(false);
  const allowedPaths = ref<string[]>([]);

  const allowedPathSet = computed(() => new Set(allowedPaths.value));

  function setMenus(nextMenus: AppMenuItem[]) {
    menus.value = normalizeMenuTree(nextMenus);

    const set = new Set<string>();
    collectAllowedPaths(menus.value, set);

    // 基础白名单（不应该被菜单树控制的路由）
    // 注意：`/` 通常会重定向到首页，但为避免某些场景先命中根路径导致 403，这里也加入白名单。
    for (const p of ['/', '/login', '/sso', '/403', '/404']) {
      set.add(p);
    }

    allowedPaths.value = Array.from(set);
    loaded.value = true;
  }

  async function loadMenus(mode?: MenuMode) {
    const options = getCoreOptions();
    const menuMode = mode ?? options.menuMode;

    if (menuMode === 'static') {
      if (!options.staticMenus) {
        throw new Error('[menu] menuMode=static 但未提供 staticMenus');
      }
      setMenus(options.staticMenus);
      return;
    }

    const tree = await options.adapter.menu.fetchMenuTree();
    setMenus(tree);
  }

  function reset() {
    menus.value = [];
    loaded.value = false;
    allowedPaths.value = [];
  }

  function isAllowed(path: string): boolean {
    return allowedPathSet.value.has(path);
  }

  return {
    menus,
    loaded,
    allowedPaths,
    loadMenus,
    reset,
    isAllowed
  };
});
