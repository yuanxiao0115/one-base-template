import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { AppMenuItem, MenuMode } from '../adapter/types';
import { getCoreOptions } from '../context';
import { useSystemStore } from './system';
import { isHttpUrl } from '../utils/url';
import { byteLength, readFromStorages, removeFromStorages, safeSetToStorage } from '../utils/storage';
import {
  readWithLegacyFallback,
  removeByScopedPrefixes,
  removeScopedAndLegacy,
  resolveNamespacedKey,
  resolveNamespacedPrefix
} from '../storage/namespace';

const MENU_TREE_LEGACY_STORAGE_BASE_KEY = 'ob_menu_tree';
const MENU_TREE_STORAGE_BASE_PREFIX = 'ob_menu_tree:';
const MENU_PATH_INDEX_STORAGE_BASE_KEY = 'ob_menu_path_index';

// localStorage 空间有限，菜单树可能很大；超限时需要降级为“仅内存缓存/或 sessionStorage”。
// 这里按单条 key 做上限控制，避免个别超大系统把整个站点 localStorage 挤爆。
const MAX_MENU_TREE_STORAGE_BYTES = 1024 * 1024; // 1MB
const MAX_PATH_INDEX_STORAGE_BYTES = 256 * 1024; // 256KB

function buildMenuTreeKey(systemCode: string) {
  return `${resolveNamespacedPrefix(MENU_TREE_STORAGE_BASE_PREFIX)}${systemCode}`;
}

function buildLegacyMenuTreeKey(systemCode: string) {
  return `${MENU_TREE_STORAGE_BASE_PREFIX}${systemCode}`;
}

function clearStoredMenuTree(systemCode: string) {
  const scopedKey = buildMenuTreeKey(systemCode);
  const legacyKey = buildLegacyMenuTreeKey(systemCode);
  removeFromStorages(scopedKey, ['local', 'session']);
  if (scopedKey !== legacyKey) {
    removeFromStorages(legacyKey, ['local', 'session']);
  }
}

function readStoredMenuTree(systemCode: string): AppMenuItem[] | null {
  const scopedKey = buildMenuTreeKey(systemCode);
  const legacyKey = buildLegacyMenuTreeKey(systemCode);

  try {
    const raw = readFromStorages(scopedKey, ['local', 'session']) ?? (scopedKey !== legacyKey ? readFromStorages(legacyKey, ['local', 'session']) : null);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as AppMenuItem[]) : null;
  } catch {
    // localStorage 不可用或 JSON 解析失败时，直接清理缓存，避免后续反复报错
    clearStoredMenuTree(systemCode);
    return null;
  }
}

function writeStoredMenuTree(systemCode: string, tree: AppMenuItem[]) {
  const key = buildMenuTreeKey(systemCode);
  const legacyKey = buildLegacyMenuTreeKey(systemCode);
  const raw = JSON.stringify(tree);

  // 预防超大值导致 localStorage 满额：超过上限则直接不落盘，并清理旧缓存腾空间。
  if (byteLength(raw) > MAX_MENU_TREE_STORAGE_BYTES) {
    clearStoredMenuTree(systemCode);
    return;
  }

  safeSetToStorage(key, raw, {
    primary: 'local',
    fallback: 'session',
    onPrimaryQuotaExceeded: () => {
      // 清理所有菜单缓存（可再拉取），避免影响关键状态持久化（system/theme/layout）
      removeByScopedPrefixes(
        [MENU_TREE_STORAGE_BASE_PREFIX, MENU_TREE_LEGACY_STORAGE_BASE_KEY, MENU_PATH_INDEX_STORAGE_BASE_KEY],
        'local'
      );
    }
  });

  if (key !== legacyKey) {
    removeFromStorages(legacyKey, ['local', 'session']);
  }
}

function readLegacyStoredMenuTree(): AppMenuItem[] | null {
  try {
    const hit = readWithLegacyFallback(MENU_TREE_LEGACY_STORAGE_BASE_KEY, ['local', 'session']);
    if (!hit?.value) return null;

    const parsed = JSON.parse(hit.value) as unknown;
    return Array.isArray(parsed) ? (parsed as AppMenuItem[]) : null;
  } catch {
    // localStorage 不可用或 JSON 解析失败时，直接清理缓存，避免后续反复报错
    removeScopedAndLegacy(MENU_TREE_LEGACY_STORAGE_BASE_KEY, ['local', 'session']);
    return null;
  }
}

function clearLegacyStoredMenuTree() {
  removeScopedAndLegacy(MENU_TREE_LEGACY_STORAGE_BASE_KEY, ['local', 'session']);
}

function readStoredPathIndex(): Record<string, string> | null {
  try {
    const hit = readWithLegacyFallback(MENU_PATH_INDEX_STORAGE_BASE_KEY, ['local', 'session']);
    if (!hit?.value) return null;

    const parsed = JSON.parse(hit.value) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;

    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === 'string' && v) out[k] = v;
    }
    return Object.keys(out).length ? out : null;
  } catch {
    removeScopedAndLegacy(MENU_PATH_INDEX_STORAGE_BASE_KEY, ['local', 'session']);
    return null;
  }
}

function writeStoredPathIndex(index: Record<string, string>) {
  const key = resolveNamespacedKey(MENU_PATH_INDEX_STORAGE_BASE_KEY);
  const raw = JSON.stringify(index);
  if (byteLength(raw) > MAX_PATH_INDEX_STORAGE_BYTES) {
    removeScopedAndLegacy(MENU_PATH_INDEX_STORAGE_BASE_KEY, ['local', 'session']);
    return;
  }

  safeSetToStorage(key, raw, {
    primary: 'local',
    fallback: 'session',
    onPrimaryQuotaExceeded: () => {
      removeByScopedPrefixes(
        [MENU_TREE_STORAGE_BASE_PREFIX, MENU_TREE_LEGACY_STORAGE_BASE_KEY, MENU_PATH_INDEX_STORAGE_BASE_KEY],
        'local'
      );
    }
  });

  if (key !== MENU_PATH_INDEX_STORAGE_BASE_KEY) {
    removeFromStorages(MENU_PATH_INDEX_STORAGE_BASE_KEY, ['local', 'session']);
  }
}

function clearStoredPathIndex() {
  removeScopedAndLegacy(MENU_PATH_INDEX_STORAGE_BASE_KEY, ['local', 'session']);
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
  const remoteSynced = ref(false);
  let loadMenusPromise: Promise<void> | null = null;

  const allowedPathSet = computed(() => new Set(allowedPaths.value));

  function setMenusForSystem(systemCode: string, nextMenus: AppMenuItem[], persist = true) {
    const normalized = normalizeMenuTree(nextMenus);
    menuTrees.value[systemCode] = normalized;
    if (persist) {
      // 仅当系统下存在可用菜单时才落盘。
      // 空菜单系统（例如 children=[]）不写本地缓存，也不保留旧缓存。
      if (normalized.length > 0) {
        writeStoredMenuTree(systemCode, normalized);
      } else {
        clearStoredMenuTree(systemCode);
      }
    }

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

  async function performLoadMenus(mode?: MenuMode) {
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
      remoteSynced.value = true;
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
        .filter(s => s.code && s.menus.length > 0);

      const nextCodes = new Set(normalizedSystems.map(s => s.code));
      const scopedPrefix = resolveNamespacedPrefix(MENU_TREE_STORAGE_BASE_PREFIX);
      const legacyPrefix = MENU_TREE_STORAGE_BASE_PREFIX;
      // 清理已被移除的系统菜单缓存，避免 pathIndex / 菜单切换误命中旧系统
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (!key) continue;

          let code = '';
          if (key.startsWith(scopedPrefix)) {
            code = key.slice(scopedPrefix.length);
          } else if (scopedPrefix !== legacyPrefix && key.startsWith(legacyPrefix)) {
            code = key.slice(legacyPrefix.length);
          } else {
            continue;
          }

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
      remoteSynced.value = true;
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
    remoteSynced.value = true;
  }

  async function loadMenus(mode?: MenuMode) {
    if (loadMenusPromise) {
      return loadMenusPromise;
    }

    loadMenusPromise = performLoadMenus(mode);

    try {
      await loadMenusPromise;
    } finally {
      loadMenusPromise = null;
    }
  }

  function reset() {
    // 清理所有系统的菜单分片缓存（不依赖当前内存态，避免遗漏旧系统残留）
    removeByScopedPrefixes([MENU_TREE_STORAGE_BASE_PREFIX], 'local');
    removeByScopedPrefixes([MENU_TREE_STORAGE_BASE_PREFIX], 'session');

    menuTrees.value = {};
    allowedPathsBySystem.value = {};
    loadedSystemFlags.value = {};

    pathIndex.value = {};
    clearStoredPathIndex();
    remoteSynced.value = false;
    loadMenusPromise = null;

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
    remoteSynced,
    allowedPaths,
    loadMenus,
    reset,
    isAllowed,
    resolveSystemByMenuKey
  };
});
