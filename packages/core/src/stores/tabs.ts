import { defineStore } from 'pinia';
import { computed, nextTick, ref, watch } from 'vue';
import type { RouteLocationNormalized } from 'vue-router';
import { useSystemStore } from './system';
import { readFromStorages, removeByPrefixes, safeSetToStorage } from '../utils/storage';

export interface TabItem {
  /** 页签唯一标识：path + query + params（稳定序列化） */
  key: string;
  fullPath: string;
  path: string;
  title: string;
  name?: string;
  affix?: boolean;
  keepAlive?: boolean;
}

export const useTabsStore = defineStore('ob-tabs', () => {
  const systemStore = useSystemStore();

  const TABS_STATE_STORAGE_KEY_PREFIX = 'ob_tabs_state:';
  const TABS_STATE_VERSION = 1;

  // 多系统：每个 systemCode 维护自己的一套 tabs/active
  const tabsBySystem = ref<Record<string, TabItem[]>>({});
  const activeKeyBySystem = ref<Record<string, string>>({});
  const hydratedSystemFlags = ref<Record<string, true>>({});

  function normalizeSystemCode(systemCode?: string): string {
    return systemCode && systemCode.trim() ? systemCode.trim() : 'default';
  }

  function buildStorageKey(systemCode: string) {
    return `${TABS_STATE_STORAGE_KEY_PREFIX}${systemCode}`;
  }

  function stableStringify(value: unknown): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';

    const t = typeof value;
    if (t === 'string') return JSON.stringify(value);
    if (t === 'number' || t === 'boolean') return String(value);
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;

    if (t === 'object') {
      const obj = value as Record<string, unknown>;
      const keys = Object.keys(obj).sort();
      return `{${keys.map(k => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
    }

    return JSON.stringify(String(value));
  }

  function hashFNV1a64(input: string): string {
    // 64-bit FNV-1a，输出 16 位 hex 字符串（更适合作为 el-tabs 的 name，避免包含引号/大括号等字符）
    const FNV_OFFSET_BASIS = 14695981039346656037n;
    const FNV_PRIME = 1099511628211n;
    const MASK_64 = 0xffffffffffffffffn;

    let hash = FNV_OFFSET_BASIS;
    for (let i = 0; i < input.length; i++) {
      hash ^= BigInt(input.charCodeAt(i));
      hash = (hash * FNV_PRIME) & MASK_64;
    }
    return hash.toString(16).padStart(16, '0');
  }

  function buildTabKey(route: RouteLocationNormalized): string {
    // 关键需求：
    // - 同 path 不同 query/params 必须视为两个页签
    // - query 顺序不稳定时也不应产生“重复页签”
    const canonical = `${route.path}?q=${stableStringify(route.query ?? {})}&p=${stableStringify(route.params ?? {})}`;
    return `obtab:${hashFNV1a64(canonical)}`;
  }

  type PersistedTabItem = Pick<TabItem, 'key' | 'fullPath' | 'path' | 'title' | 'name' | 'affix' | 'keepAlive'>;
  type PersistedTabsState = {
    version: number;
    tabs: PersistedTabItem[];
    activeKey: string;
  };

  function isNonEmptyString(v: unknown): v is string {
    return typeof v === 'string' && v.length > 0;
  }

  function isValidPersistedTab(v: unknown): v is PersistedTabItem {
    if (!v || typeof v !== 'object') return false;
    const o = v as Record<string, unknown>;
    return (
      isNonEmptyString(o.key) &&
      isNonEmptyString(o.fullPath) &&
      isNonEmptyString(o.path) &&
      isNonEmptyString(o.title)
    );
  }

  function normalizeAffixOrder(list: TabItem[]) {
    // affix 固定在最前面（通常是首页），避免被插入/关闭操作打乱。
    const affix = list.filter(t => t.affix);
    const normal = list.filter(t => !t.affix);
    list.splice(0, list.length, ...affix, ...normal);
  }

  function hydrateSystem(systemCode: string) {
    if (hydratedSystemFlags.value[systemCode]) return;

    const key = buildStorageKey(systemCode);
    const raw = readFromStorages(key, ['session']);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as PersistedTabsState;
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.tabs)) {
          const list: TabItem[] = [];
          for (const item of parsed.tabs) {
            if (!isValidPersistedTab(item)) continue;
            list.push({
              key: item.key,
              fullPath: item.fullPath,
              path: item.path,
              title: item.title,
              name: typeof item.name === 'string' ? item.name : undefined,
              affix: Boolean(item.affix),
              keepAlive: Boolean(item.keepAlive)
            });
          }

          normalizeAffixOrder(list);
          tabsBySystem.value[systemCode] = list;
          activeKeyBySystem.value[systemCode] = typeof parsed.activeKey === 'string' ? parsed.activeKey : '';
        }
      } catch {
        // ignore
      }
    }

    if (!tabsBySystem.value[systemCode]) tabsBySystem.value[systemCode] = [];
    if (!activeKeyBySystem.value[systemCode]) activeKeyBySystem.value[systemCode] = '';
    hydratedSystemFlags.value[systemCode] = true;
  }

  function persistSystem(systemCode: string) {
    const list = tabsBySystem.value[systemCode] ?? [];
    const activeKey = activeKeyBySystem.value[systemCode] ?? '';

    const payload: PersistedTabsState = {
      version: TABS_STATE_VERSION,
      tabs: list.map(t => ({
        key: t.key,
        fullPath: t.fullPath,
        path: t.path,
        title: t.title,
        name: t.name,
        affix: Boolean(t.affix),
        keepAlive: Boolean(t.keepAlive)
      })),
      activeKey
    };

    // 按你的要求：关闭浏览器要清空，因此仅写 sessionStorage（不落 localStorage）
    safeSetToStorage(buildStorageKey(systemCode), JSON.stringify(payload), {
      primary: 'session',
      fallback: 'session'
    });
  }

  const currentSystemCode = computed(() => normalizeSystemCode(systemStore.currentSystemCode));

  const tabs = computed(() => {
    const code = currentSystemCode.value;
    hydrateSystem(code);
    return tabsBySystem.value[code] ?? [];
  });

  const activeKey = computed({
    get: () => {
      const code = currentSystemCode.value;
      hydrateSystem(code);
      return activeKeyBySystem.value[code] ?? '';
    },
    set: v => {
      const code = currentSystemCode.value;
      hydrateSystem(code);
      activeKeyBySystem.value[code] = v;
      persistSystem(code);
    }
  });

  /** keep-alive include：使用组件名（约定=route.name） */
  const cacheNames = computed(() => {
    const set = new Set<string>();
    for (const t of tabs.value) {
      if (t.keepAlive && t.name) set.add(t.name);
    }
    return Array.from(set);
  });

  const activeTab = computed(() => tabs.value.find(t => t.key === activeKey.value));

  function openByRoute(route: RouteLocationNormalized) {
    const meta = route.meta;
    // hiddenTab/noTag：明确不进入标签页体系
    if (meta.hiddenTab || meta.noTag) return;
    // 忽略 redirect 占位路由，避免产生“加载中/跳转中”页签
    if (route.path.startsWith('/redirect')) return;

    const code = currentSystemCode.value;
    hydrateSystem(code);

    const title =
      typeof meta.title === 'string' && meta.title
        ? meta.title
        : route.name
          ? String(route.name)
          : route.path;
    const name = route.name ? String(route.name) : undefined;
    const affix = Boolean(meta.affix);
    const keepAlive = Boolean(meta.keepAlive);

    const key = buildTabKey(route);
    const list = tabsBySystem.value[code] ?? (tabsBySystem.value[code] = []);

    const prevActiveKey = activeKeyBySystem.value[code] ?? '';
    activeKeyBySystem.value[code] = key;

    const existsIndex = list.findIndex(t => t.key === key);
    if (existsIndex !== -1) {
      const exists = list[existsIndex];
      if (exists) {
        exists.fullPath = route.fullPath;
        exists.path = route.path;
        exists.title = title;
        exists.name = name;
        exists.affix = affix;
        exists.keepAlive = keepAlive;
      }
      persistSystem(code);
      return;
    }

    const tab: TabItem = {
      key,
      fullPath: route.fullPath,
      path: route.path,
      title,
      name,
      affix,
      keepAlive
    };

    // 插入策略：新页签插在“上一个激活页签”的右侧（更符合浏览器/老项目体验）
    const insertAfterIndex = prevActiveKey ? list.findIndex(t => t.key === prevActiveKey) : -1;
    if (insertAfterIndex >= 0) {
      list.splice(insertAfterIndex + 1, 0, tab);
    } else {
      list.push(tab);
    }

    normalizeAffixOrder(list);
    persistSystem(code);
  }

  function close(tabKeyOrFullPath: string): { nextFullPath?: string } {
    const code = currentSystemCode.value;
    hydrateSystem(code);
    const list = tabsBySystem.value[code] ?? [];

    const index = list.findIndex(t => t.key === tabKeyOrFullPath || t.fullPath === tabKeyOrFullPath);
    if (index === -1) return {};

    const tab = list[index];
    if (!tab) return {};
    if (tab.affix) return {};

    const closingKey = tab.key;
    list.splice(index, 1);
    normalizeAffixOrder(list);

    // 关闭的是当前激活页签：按“右侧 -> 左侧”选择下一个激活页签
    if (activeKeyBySystem.value[code] === closingKey) {
      const next = list[index] ?? list[index - 1];
      activeKeyBySystem.value[code] = next?.key ?? '';
      persistSystem(code);
      return { nextFullPath: next?.fullPath };
    }

    persistSystem(code);
    return {};
  }

  function closeOthers(tabKeyOrFullPath: string) {
    const code = currentSystemCode.value;
    hydrateSystem(code);
    const list = tabsBySystem.value[code] ?? [];

    const target = list.find(t => t.key === tabKeyOrFullPath || t.fullPath === tabKeyOrFullPath);
    if (!target) return;

    tabsBySystem.value[code] = list.filter(t => t.affix || t.key === target.key);
    normalizeAffixOrder(tabsBySystem.value[code]);
    activeKeyBySystem.value[code] = target.key;
    persistSystem(code);
  }

  function closeLeft(tabKeyOrFullPath: string) {
    const code = currentSystemCode.value;
    hydrateSystem(code);
    const list = tabsBySystem.value[code] ?? [];

    const targetIndex = list.findIndex(t => t.key === tabKeyOrFullPath || t.fullPath === tabKeyOrFullPath);
    if (targetIndex === -1) return;

    const kept: TabItem[] = [];
    for (let i = 0; i < list.length; i++) {
      const t = list[i];
      if (!t) continue;
      if (t.affix) {
        kept.push(t);
        continue;
      }
      if (i >= targetIndex) kept.push(t);
    }

    tabsBySystem.value[code] = kept;
    normalizeAffixOrder(tabsBySystem.value[code]);
    persistSystem(code);

    // 若当前激活页签被关掉了，兜底激活目标页签
    const stillActive = tabsBySystem.value[code].some(t => t.key === activeKeyBySystem.value[code]);
    if (!stillActive) {
      const target = tabsBySystem.value[code].find(t => t.key === list[targetIndex]?.key);
      if (target) activeKeyBySystem.value[code] = target.key;
      persistSystem(code);
    }
  }

  function closeRight(tabKeyOrFullPath: string) {
    const code = currentSystemCode.value;
    hydrateSystem(code);
    const list = tabsBySystem.value[code] ?? [];

    const targetIndex = list.findIndex(t => t.key === tabKeyOrFullPath || t.fullPath === tabKeyOrFullPath);
    if (targetIndex === -1) return;

    const kept: TabItem[] = [];
    for (let i = 0; i < list.length; i++) {
      const t = list[i];
      if (!t) continue;
      if (t.affix) {
        kept.push(t);
        continue;
      }
      if (i <= targetIndex) kept.push(t);
    }

    tabsBySystem.value[code] = kept;
    normalizeAffixOrder(tabsBySystem.value[code]);
    persistSystem(code);

    const stillActive = tabsBySystem.value[code].some(t => t.key === activeKeyBySystem.value[code]);
    if (!stillActive) {
      const target = tabsBySystem.value[code].find(t => t.key === list[targetIndex]?.key);
      if (target) activeKeyBySystem.value[code] = target.key;
      persistSystem(code);
    }
  }

  function closeAll() {
    const code = currentSystemCode.value;
    hydrateSystem(code);
    const list = tabsBySystem.value[code] ?? [];

    const nextTabs = list.filter(t => t.affix);
    tabsBySystem.value[code] = nextTabs;
    normalizeAffixOrder(nextTabs);
    activeKeyBySystem.value[code] = nextTabs[0]?.key ?? '';
    persistSystem(code);

    return { nextFullPath: nextTabs[0]?.fullPath };
  }

  async function refreshActive() {
    // 注意：keep-alive 的 include 只能按组件名控制，无法精确到某个 key。
    // 这里沿用旧策略：对 activeTab 的组件名做 include toggle。
    // 若业务存在“同组件多实例（同 route.name 不同参数）且都 keepAlive”的强需求，
    // 建议在页面层通过业务刷新按钮触发数据重拉取，而不是用 keepAlive 强制销毁。
    const tab = activeTab.value;
    if (!tab?.keepAlive || !tab.name) return;

    // 用 nextTick 强制 keepAlive 清掉缓存
    const name = tab.name;
    const code = currentSystemCode.value;

    // 通过临时移除 keepAlive include：需要一个“可写”的缓存列表，这里借助 ref 包一层
    // 实现方式：把 keepAlive 列表做成“受 tabs 影响的 computed”，因此这里只能通过关闭/打开策略变更。
    // 兜底：直接整页刷新（行为与老项目一致且最稳）
    try {
      await nextTick();
      window.location.reload();
    } catch {
      // ignore
      void name;
      void code;
    }
  }

  function updateTitle(tabKeyOrFullPath: string, title: string) {
    if (!title) return;
    const code = currentSystemCode.value;
    hydrateSystem(code);
    const list = tabsBySystem.value[code] ?? [];
    const tab = list.find(t => t.key === tabKeyOrFullPath || t.fullPath === tabKeyOrFullPath);
    if (!tab) return;
    tab.title = title;
    persistSystem(code);
  }

  function reset() {
    tabsBySystem.value = {};
    activeKeyBySystem.value = {};
    hydratedSystemFlags.value = {};

    // 清理 sessionStorage 中的 tabs 缓存（按前缀）
    removeByPrefixes([TABS_STATE_STORAGE_KEY_PREFIX], 'session');
    // 兼容：若历史版本曾写入 local，也一并清理（避免更换用户后复活）
    removeByPrefixes([TABS_STATE_STORAGE_KEY_PREFIX], 'local');
  }

  // 多系统切换时，懒加载对应系统的 tabs 缓存
  watch(
    () => systemStore.currentSystemCode,
    systemCode => {
      const code = normalizeSystemCode(systemCode);
      hydrateSystem(code);
    },
    { immediate: true }
  );

  return {
    // state（当前系统视角）
    tabs,
    activeKey,
    cacheNames,
    activeTab,

    // actions
    openByRoute,
    close,
    closeOthers,
    closeLeft,
    closeRight,
    closeAll,
    refreshActive,
    updateTitle,
    reset
  };
});
