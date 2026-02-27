import { defineStore } from 'pinia';
import { ref } from 'vue';
import { removeFromStorages, safeSetToStorage } from '../utils/storage';
import { getWithLegacy, clearByPrefixes, getNamespacedKey } from '../storage/namespace';

/**
 * 布局模式：
 * - side: 传统左侧菜单
 * - top: 顶部横向菜单
 */
export type LayoutMode = 'side' | 'top';
export type SystemSwitchStyle = 'dropdown' | 'menu';

export interface LayoutOptions {
  /** 默认布局模式（未命中缓存时生效） */
  defaultMode?: LayoutMode;
  /** 顶栏系统切换样式 */
  systemSwitchStyle?: SystemSwitchStyle;
  /** 顶部栏高度（例如 64px） */
  topbarHeight?: string | number;
  /** 侧边栏展开宽度（例如 256px） */
  sidebarWidth?: string | number;
  /** 侧边栏折叠宽度（例如 64px） */
  sidebarCollapsedWidth?: string | number;
  /** 是否持久化到 localStorage（默认 true，仅持久化 siderCollapsed） */
  persist?: boolean;
}

const STORAGE_BASE_KEY = 'ob_layout';
export const DEFAULT_LAYOUT_TOPBAR_HEIGHT = '64px';
export const DEFAULT_LAYOUT_SIDEBAR_WIDTH = '256px';
export const DEFAULT_LAYOUT_SIDEBAR_COLLAPSED_WIDTH = '64px';

type StoredLayout = {
  siderCollapsed?: boolean;
};

function readStoredLayout(): StoredLayout {
  const hit = getWithLegacy(STORAGE_BASE_KEY, ['local', 'session']);
  if (!hit?.value) return {};

  try {
    const parsed = JSON.parse(hit.value) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as StoredLayout;
  } catch {
    return {};
  }
}

function writeStoredLayout(next: StoredLayout) {
  const key = getNamespacedKey(STORAGE_BASE_KEY);

  safeSetToStorage(key, JSON.stringify(next), {
    primary: 'local',
    fallback: 'session',
    onPrimaryQuotaExceeded: () => {
      // 菜单缓存可重新拉取，优先清理避免影响布局/主题等关键状态的持久化
      clearByPrefixes(['ob_menu_tree:', 'ob_menu_tree', 'ob_menu_path_index'], 'local');
    }
  });

  if (key !== STORAGE_BASE_KEY) {
    removeFromStorages(STORAGE_BASE_KEY, ['local', 'session']);
  }
}

export const useLayoutStore = defineStore('ob-layout', () => {
  const mode = ref<LayoutMode>('side');
  const siderCollapsed = ref(false);
  const systemSwitchStyle = ref<SystemSwitchStyle>('dropdown');
  const topbarHeight = ref(DEFAULT_LAYOUT_TOPBAR_HEIGHT);
  const sidebarWidth = ref(DEFAULT_LAYOUT_SIDEBAR_WIDTH);
  const sidebarCollapsedWidth = ref(DEFAULT_LAYOUT_SIDEBAR_COLLAPSED_WIDTH);

  // 由 init() 注入（避免在 store 外部硬编码）
  const persistEnabled = ref(true);

  function normalizeSize(value: string | number | undefined, fallback: string): string {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return `${value}px`;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length > 0) return trimmed;
    }
    return fallback;
  }

  function persist() {
    if (!persistEnabled.value) return;
    writeStoredLayout({
      siderCollapsed: siderCollapsed.value
    });
  }

  function init(options: LayoutOptions = {}) {
    persistEnabled.value = options.persist ?? true;
    const fallbackMode: LayoutMode = options.defaultMode ?? 'side';
    const fallbackSwitchStyle: SystemSwitchStyle = options.systemSwitchStyle ?? 'dropdown';
    const fallbackTopbarHeight = normalizeSize(options.topbarHeight, DEFAULT_LAYOUT_TOPBAR_HEIGHT);
    const fallbackSidebarWidth = normalizeSize(options.sidebarWidth, DEFAULT_LAYOUT_SIDEBAR_WIDTH);
    const fallbackSidebarCollapsedWidth = normalizeSize(
      options.sidebarCollapsedWidth,
      DEFAULT_LAYOUT_SIDEBAR_COLLAPSED_WIDTH
    );

    // mode / systemSwitchStyle 由应用代码注入，始终以代码配置为准，不从 storage 读取。
    mode.value = fallbackMode;
    systemSwitchStyle.value = fallbackSwitchStyle;
    topbarHeight.value = fallbackTopbarHeight;
    sidebarWidth.value = fallbackSidebarWidth;
    sidebarCollapsedWidth.value = fallbackSidebarCollapsedWidth;

    if (!persistEnabled.value) {
      siderCollapsed.value = false;
      return;
    }

    const saved = readStoredLayout();
    siderCollapsed.value = saved.siderCollapsed ?? false;
  }

  function setMode(next: LayoutMode) {
    mode.value = next;
    persist();
  }

  function setSiderCollapsed(v: boolean) {
    siderCollapsed.value = v;
    persist();
  }

  function setSystemSwitchStyle(next: SystemSwitchStyle) {
    systemSwitchStyle.value = next;
    persist();
  }

  function toggleSiderCollapsed() {
    setSiderCollapsed(!siderCollapsed.value);
  }

  function reset() {
    mode.value = 'side';
    siderCollapsed.value = false;
    systemSwitchStyle.value = 'dropdown';
    topbarHeight.value = DEFAULT_LAYOUT_TOPBAR_HEIGHT;
    sidebarWidth.value = DEFAULT_LAYOUT_SIDEBAR_WIDTH;
    sidebarCollapsedWidth.value = DEFAULT_LAYOUT_SIDEBAR_COLLAPSED_WIDTH;
    persist();
  }

  return {
    mode,
    siderCollapsed,
    systemSwitchStyle,
    topbarHeight,
    sidebarWidth,
    sidebarCollapsedWidth,
    init,
    setMode,
    setSiderCollapsed,
    setSystemSwitchStyle,
    toggleSiderCollapsed,
    reset
  };
});
