import { defineStore } from 'pinia';
import { ref } from 'vue';
import { readFromStorages, removeByPrefixes, safeSetToStorage } from '../utils/storage';

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
  /** 是否持久化到 localStorage（默认 true，仅持久化 siderCollapsed） */
  persist?: boolean;
}

const STORAGE_KEY = 'ob_layout';

type StoredLayout = {
  siderCollapsed?: boolean;
};

function readStoredLayout(): StoredLayout {
  const raw = readFromStorages(STORAGE_KEY, ['local', 'session']);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as StoredLayout;
  } catch {
    return {};
  }
}

function writeStoredLayout(next: StoredLayout) {
  safeSetToStorage(STORAGE_KEY, JSON.stringify(next), {
    primary: 'local',
    fallback: 'session',
    onPrimaryQuotaExceeded: () => {
      // 菜单缓存可重新拉取，优先清理避免影响布局/主题等关键状态的持久化
      removeByPrefixes(['ob_menu_tree:', 'ob_menu_tree', 'ob_menu_path_index'], 'local');
    }
  });
}

export const useLayoutStore = defineStore('ob-layout', () => {
  const mode = ref<LayoutMode>('side');
  const siderCollapsed = ref(false);
  const systemSwitchStyle = ref<SystemSwitchStyle>('dropdown');

  // 由 init() 注入（避免在 store 外部硬编码）
  const persistEnabled = ref(true);

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

    // mode / systemSwitchStyle 由应用代码注入，始终以代码配置为准，不从 storage 读取。
    mode.value = fallbackMode;
    systemSwitchStyle.value = fallbackSwitchStyle;

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
    persist();
  }

  return {
    mode,
    siderCollapsed,
    systemSwitchStyle,
    init,
    setMode,
    setSiderCollapsed,
    setSystemSwitchStyle,
    toggleSiderCollapsed,
    reset
  };
});
