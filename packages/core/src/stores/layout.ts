import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * 布局模式：
 * - side: 传统左侧菜单
 * - top: 顶部横向菜单
 * - top-side: 顶部“系统”切换，左侧展示当前系统菜单
 */
export type LayoutMode = 'side' | 'top' | 'top-side';

export interface LayoutOptions {
  /** 默认布局模式（未命中缓存时生效） */
  defaultMode?: LayoutMode;
  /** 是否持久化到 localStorage（默认 true） */
  persist?: boolean;
}

const STORAGE_KEY = 'ob_layout';

type StoredLayout = {
  mode?: LayoutMode;
  siderCollapsed?: boolean;
};

function readStoredLayout(): StoredLayout {
  const raw = localStorage.getItem(STORAGE_KEY);
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function normalizeLayoutMode(raw: unknown): LayoutMode | undefined {
  return raw === 'side' || raw === 'top' || raw === 'top-side' ? raw : undefined;
}

export const useLayoutStore = defineStore('ob-layout', () => {
  const mode = ref<LayoutMode>('side');
  const siderCollapsed = ref(false);

  // 由 init() 注入（避免在 store 外部硬编码）
  const persistEnabled = ref(true);

  function persist() {
    if (!persistEnabled.value) return;
    writeStoredLayout({
      mode: mode.value,
      siderCollapsed: siderCollapsed.value
    });
  }

  function init(options: LayoutOptions = {}) {
    persistEnabled.value = options.persist ?? true;
    const fallbackMode: LayoutMode = options.defaultMode ?? 'side';

    if (!persistEnabled.value) {
      mode.value = fallbackMode;
      siderCollapsed.value = false;
      return;
    }

    const saved = readStoredLayout();
    mode.value = normalizeLayoutMode(saved.mode) ?? fallbackMode;
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

  function toggleSiderCollapsed() {
    setSiderCollapsed(!siderCollapsed.value);
  }

  function reset() {
    mode.value = 'side';
    siderCollapsed.value = false;
    persist();
  }

  return {
    mode,
    siderCollapsed,
    init,
    setMode,
    setSiderCollapsed,
    toggleSiderCollapsed,
    reset
  };
});
