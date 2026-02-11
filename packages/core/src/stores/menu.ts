import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { AppMenuItem, MenuMode } from '../adapter/types';
import { getCoreOptions } from '../context';
import { useSystemStore } from './system';
import { isHttpUrl } from '../utils/url';

const MENU_TREE_LEGACY_STORAGE_KEY = 'ob_menu_tree';
const MENU_TREE_STORAGE_KEY_PREFIX = 'ob_menu_tree:';
const MENU_PATH_INDEX_STORAGE_KEY = 'ob_menu_path_index';

function buildMenuTreeKey(systemCode: string) {
  return `${MENU_TREE_STORAGE_KEY_PREFIX}${systemCode}`;
}

function readStoredMenuTree(systemCode: string): AppMenuItem[] | null {
  try {
    const raw = localStorage.getItem(buildMenuTreeKey(systemCode));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as AppMenuItem[]) : null;
  } catch {
    // localStorage 不可用或 JSON 解析失败时，直接清理缓存，避免后续反复报错
    try {
      localStorage.removeItem(buildMenuTreeKey(systemCode));
    } catch {
      // ignore
    }
    return null;
  }
}

function writeStoredMenuTree(systemCode: string, tree: AppMenuItem[]) {
  try {
    localStorage.setItem(buildMenuTreeKey(systemCode), JSON.stringify(tree));
  } catch {
    // ignore
  }
}

function clearStoredMenuTree(systemCode: string) {
  try {
    localStorage.removeItem(buildMenuTreeKey(systemCode));
  } catch {
    // ignore
  }
}

function readLegacyStoredMenuTree(): AppMenuItem[] | null {
  try {
    const raw = localStorage.getItem(MENU_TREE_LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as AppMenuItem[]) : null;
  } catch {
    // localStorage 不可用或 JSON 解析失败时，直接清理缓存，避免后续反复报错
    try {
      localStorage.removeItem(MENU_TREE_LEGACY_STORAGE_KEY);
    } catch {
      // ignore
    }
    return null;
  }
}

function clearLegacyStoredMenuTree() {
  try {
    localStorage.removeItem(MENU_TREE_LEGACY_STORAGE_KEY);
  } catch {
    // ignore
  }
}

function readStoredPathIndex(): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(MENU_PATH_INDEX_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;

    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === 'string' && v) out[k] = v;
    }
    return Object.keys(out).length ? out : null;
  } catch {
    try {
      localStorage.removeItem(MENU_PATH_INDEX_STORAGE_KEY);
    } catch {
      // ignore
    }
    return null;
  }
}

function writeStoredPathIndex(index: Record<string, string>) {
  try {
    localStorage.setItem(MENU_PATH_INDEX_STORAGE_KEY, JSON.stringify(index));
  } catch {
    // ignore
  }
}

function clearStoredPathIndex() {
  try {
    localStorage.removeItem(MENU_PATH_INDEX_STORAGE_KEY);
  } catch {
    // ignore
  }
}

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

function collectPathIndex(items: AppMenuItem[], systemCode: string, out: Record<string, string>) {
  for (const item of items) {
    if (!item.external) {
      // 多系统下 path 需要全局唯一；若重复，这里默认“先到先得”，避免来回抖动
      if (!out[item.path]) out[item.path] = systemCode;
    }
    if (item.children?.length) {
      collectPathIndex(item.children, systemCode, out);
    }
  }
}

export const useMenuStore = defineStore('ob-menu', () => {
  const systemStore = useSystemStore();

  // 按 systemCode 分片缓存菜单树：{ [systemCode]: tree }
  const menuTrees = ref<Record<string, AppMenuItem[]>>({});
  const allowedPathsBySystem = ref<Record<string, string[]>>({});
  const loadedSystemFlags = ref<Record<string, true>>({});

  // path -> systemCode 索引：用于跨系统跳转/直输 URL 时快速定位目标系统
  const pathIndex = ref<Record<string, string>>({});

  const currentSystemCode = computed(() => systemStore.currentSystemCode);
  const menus = computed(() => {
    const code = currentSystemCode.value;
    return code ? menuTrees.value[code] ?? [] : [];
  });
  const allowedPaths = computed(() => {
    const code = currentSystemCode.value;
    return code ? allowedPathsBySystem.value[code] ?? [] : [];
  });
  const loaded = computed(() => {
    const code = currentSystemCode.value;
    return Boolean(code && loadedSystemFlags.value[code]);
  });

  const allowedPathSet = computed(() => new Set(allowedPaths.value));

  function setMenusForSystem(systemCode: string, nextMenus: AppMenuItem[], persist = true) {
    const normalized = normalizeMenuTree(nextMenus);
    menuTrees.value[systemCode] = normalized;
    if (persist) writeStoredMenuTree(systemCode, normalized);

    const set = new Set<string>();
    collectAllowedPaths(normalized, set);

    // 基础白名单（不应该被菜单树控制的路由）
    // 注意：`/` 通常会重定向到首页，但为避免某些场景先命中根路径导致 403，这里也加入白名单。
    for (const p of ['/', '/login', '/sso', '/403', '/404']) {
      set.add(p);
    }

    allowedPathsBySystem.value[systemCode] = Array.from(set);
    loadedSystemFlags.value[systemCode] = true;
  }

  function rebuildPathIndexFromTrees() {
    const next: Record<string, string> = {};
    const codes = Object.keys(menuTrees.value).sort();
    for (const code of codes) {
      const tree = menuTrees.value[code];
      if (tree?.length) {
        collectPathIndex(tree, code, next);
      }
    }
    pathIndex.value = next;
    writeStoredPathIndex(next);
  }

  // 初始化：尽可能从 localStorage 恢复多系统菜单与 path 索引
  const storedIndex = readStoredPathIndex();
  if (storedIndex) {
    pathIndex.value = storedIndex;
  }

  const candidateSystemCodes = new Set<string>();
  for (const s of systemStore.systems) {
    if (s.code) candidateSystemCodes.add(s.code);
  }
  if (systemStore.currentSystemCode) candidateSystemCodes.add(systemStore.currentSystemCode);

  let hydratedAny = false;
  for (const code of candidateSystemCodes) {
    const storedTree = readStoredMenuTree(code);
    if (storedTree?.length) {
      setMenusForSystem(code, storedTree, false);
      hydratedAny = true;
    }
  }

  // 兼容迁移：老版本只存了一棵树（ob_menu_tree），这里尽量迁移到“当前系统”
  const legacyTree = readLegacyStoredMenuTree();
  if (legacyTree?.length) {
    const fallbackCode = systemStore.currentSystemCode || systemStore.systems[0]?.code || 'default';
    if (!menuTrees.value[fallbackCode]?.length) {
      setMenusForSystem(fallbackCode, legacyTree, true);
      hydratedAny = true;
    }
    clearLegacyStoredMenuTree();
  }

  if (hydratedAny) {
    rebuildPathIndexFromTrees();
  }

  function resolveSystemCodeByPath(path: string): string | undefined {
    const hit = pathIndex.value[path];
    if (hit) return hit;

    // 索引缺失时兜底扫描（通常只发生在首次加载或缓存被清理后）
    for (const [code, tree] of Object.entries(menuTrees.value)) {
      if (!tree?.length) continue;
      const found = findMenuByPath(tree, path);
      if (found) {
        pathIndex.value[path] = code;
        writeStoredPathIndex(pathIndex.value);
        return code;
      }
    }

    return undefined;
  }

  function findMenuByPath(list: AppMenuItem[], path: string): AppMenuItem | undefined {
    for (const item of list) {
      if (item.path === path) return item;
      if (item.children?.length) {
        const found = findMenuByPath(item.children, path);
        if (found) return found;
      }
    }
    return undefined;
  }

  async function loadMenus(mode?: MenuMode) {
    const options = getCoreOptions();
    const menuMode = mode ?? options.menuMode;

    if (menuMode === 'static') {
      if (!options.staticMenus) {
        throw new Error('[menu] menuMode=static 但未提供 staticMenus');
      }

      // 静态菜单模式默认按单系统处理
      menuTrees.value = {};
      allowedPathsBySystem.value = {};
      loadedSystemFlags.value = {};

      const code = systemStore.currentSystemCode || 'default';
      systemStore.setSystems([{ code, name: code }]);
      if (!systemStore.currentSystemCode) {
        systemStore.setCurrentSystem(code);
      }
      setMenusForSystem(code, options.staticMenus, true);
      rebuildPathIndexFromTrees();
      return;
    }

    // 多系统优先：一次拉取全部系统菜单树
    if (options.adapter.menu.fetchMenuSystems) {
      const systems = await options.adapter.menu.fetchMenuSystems();
      const normalizedSystems = (Array.isArray(systems) ? systems : [])
        .map(s => ({
          code: typeof s.code === 'string' ? s.code : '',
          name: typeof s.name === 'string' && s.name ? s.name : typeof s.code === 'string' ? s.code : '',
          menus: Array.isArray(s.menus) ? s.menus : []
        }))
        .filter(s => s.code);

      const nextCodes = new Set(normalizedSystems.map(s => s.code));
      // 清理已被移除的系统菜单缓存，避免 pathIndex / 菜单切换误命中旧系统
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (!key || !key.startsWith(MENU_TREE_STORAGE_KEY_PREFIX)) continue;
          const code = key.slice(MENU_TREE_STORAGE_KEY_PREFIX.length);
          if (code && !nextCodes.has(code)) localStorage.removeItem(key);
        }
      } catch {
        // ignore
      }

      menuTrees.value = {};
      allowedPathsBySystem.value = {};
      loadedSystemFlags.value = {};

      systemStore.setSystems(normalizedSystems.map(s => ({ code: s.code, name: s.name })));

      const picked = systemStore.ensureCurrentSystem(normalizedSystems.map(s => s.code));
      if (picked) {
        // 确保 currentSystemCode 一定是有效值（避免 UI/守卫取不到）
        if (systemStore.currentSystemCode !== picked) {
          systemStore.setCurrentSystem(picked);
        }
      }

      for (const sys of normalizedSystems) {
        setMenusForSystem(sys.code, sys.menus, true);
      }
      rebuildPathIndexFromTrees();
      return;
    }

    // 单系统：退化为旧逻辑
    const tree = await options.adapter.menu.fetchMenuTree();
    menuTrees.value = {};
    allowedPathsBySystem.value = {};
    loadedSystemFlags.value = {};

    const code = systemStore.currentSystemCode || 'default';
    systemStore.setSystems([{ code, name: code }]);
    if (!systemStore.currentSystemCode) {
      systemStore.setCurrentSystem(code);
    }
    setMenusForSystem(code, tree, true);
    rebuildPathIndexFromTrees();
  }

  function reset() {
    // 清理所有系统的菜单分片缓存（不依赖当前内存态，避免遗漏旧系统残留）
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(MENU_TREE_STORAGE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      }
    } catch {
      // ignore
    }

    menuTrees.value = {};
    allowedPathsBySystem.value = {};
    loadedSystemFlags.value = {};

    pathIndex.value = {};
    clearStoredPathIndex();

    // 兼容：顺手清理旧 key
    clearLegacyStoredMenuTree();
  }

  function isAllowed(path: string): boolean {
    return allowedPathSet.value.has(path);
  }

  /**
   * 根据 path/activePath 推断目标 systemCode（用于跨系统跳转/直输 URL）。\n
   * 注意：该方法会优先使用本地缓存的索引，因此可在菜单未加载前“预判”系统。\n
   */
  function resolveSystemByMenuKey(menuKey: string): string | undefined {
    return resolveSystemCodeByPath(menuKey);
  }

  return {
    menus,
    loaded,
    allowedPaths,
    loadMenus,
    reset,
    isAllowed,
    resolveSystemByMenuKey
  };
});
