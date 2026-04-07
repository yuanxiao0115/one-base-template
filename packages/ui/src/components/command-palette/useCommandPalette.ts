import { computed, ref, watch } from 'vue';
import type { AppMenuItem } from '@one-base-template/core';
import { getNamespacedKey } from '@one-base-template/core';
import type {
  BuildCommandPaletteItemsOptions,
  CommandPaletteItem,
  UseCommandPaletteOptions
} from './types';

const DEFAULT_HISTORY_KEY_BASE = 'ob_command_palette_history';
const DEFAULT_HISTORY_LIMIT = 8;
const DEFAULT_SUGGESTION_LIMIT = 24;

function normalizeKeyword(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '');
}

function buildSearchText(parts: string[]): string {
  return normalizeKeyword(parts.filter(Boolean).join(' '));
}

function shouldIncludeMenuItem(item: AppMenuItem, includeExternal: boolean): boolean {
  if (!item.path) {
    return false;
  }

  if (item.external) {
    return includeExternal;
  }

  return item.path.startsWith('/');
}

export function buildCommandPaletteItemsFromMenus(
  menuItems: AppMenuItem[],
  options: BuildCommandPaletteItemsOptions = {}
): CommandPaletteItem[] {
  const includeExternal = options.includeExternal ?? false;
  const excludePaths = new Set(options.excludePaths ?? []);
  const itemMap = new Map<string, CommandPaletteItem>();

  // 以深度优先遍历菜单树，保留后端返回顺序作为默认展示顺序。
  const visit = (items: AppMenuItem[], parentTitles: string[]) => {
    for (const menuItem of items) {
      const currentParents = menuItem.title ? [...parentTitles, menuItem.title] : [...parentTitles];
      const canUse = shouldIncludeMenuItem(menuItem, includeExternal);
      if (canUse && !excludePaths.has(menuItem.path) && !itemMap.has(menuItem.path)) {
        const trimmedTitle = menuItem.title?.trim() || menuItem.path;
        itemMap.set(menuItem.path, {
          id: menuItem.path,
          path: menuItem.path,
          title: trimmedTitle,
          icon: menuItem.icon,
          external: Boolean(menuItem.external),
          parentTitles,
          searchText: buildSearchText([trimmedTitle, menuItem.path, ...parentTitles])
        });
      }

      if (Array.isArray(menuItem.children) && menuItem.children.length > 0) {
        visit(menuItem.children, currentParents);
      }
    }
  };

  visit(menuItems, []);
  return Array.from(itemMap.values());
}

export function filterCommandPaletteItems(
  items: CommandPaletteItem[],
  keyword: string
): CommandPaletteItem[] {
  const normalizedKeyword = normalizeKeyword(keyword);
  if (!normalizedKeyword) {
    return items;
  }

  return items.filter((item) => item.searchText.includes(normalizedKeyword));
}

function readHistory(storageKey: string, maxHistory: number): string[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    const deduped = Array.from(
      new Set(
        parsed
          .map((item) => (typeof item === 'string' ? item.trim() : ''))
          .filter((item) => item.length > 0)
      )
    );

    return deduped.slice(0, maxHistory);
  } catch {
    return [];
  }
}

function writeHistory(storageKey: string, history: string[]) {
  try {
    if (!history.length) {
      localStorage.removeItem(storageKey);
      return;
    }
    localStorage.setItem(storageKey, JSON.stringify(history));
  } catch {
    // 本地存储不可用时忽略，不阻断主流程。
  }
}

export function useCommandPalette(
  allItems: () => CommandPaletteItem[],
  options: UseCommandPaletteOptions = {}
) {
  const maxHistory = options.maxHistory ?? DEFAULT_HISTORY_LIMIT;
  const suggestionLimit = options.suggestionLimit ?? DEFAULT_SUGGESTION_LIMIT;
  const storageKey = getNamespacedKey(options.historyKeyBase ?? DEFAULT_HISTORY_KEY_BASE);

  const visible = ref(false);
  const keyword = ref('');
  const activeIndex = ref(0);
  const historyIds = ref<string[]>(readHistory(storageKey, maxHistory));

  const itemMap = computed(() => {
    return new Map(allItems().map((item) => [item.id, item] as const));
  });

  const historyItems = computed(() => {
    return historyIds.value
      .map((id) => itemMap.value.get(id))
      .filter((item): item is CommandPaletteItem => Boolean(item));
  });

  const filteredItems = computed(() => {
    return filterCommandPaletteItems(allItems(), keyword.value);
  });

  const suggestionItems = computed(() => {
    if (keyword.value.trim()) {
      return filteredItems.value;
    }

    // 无关键字时优先展示历史，再补齐其余菜单。
    const recentIds = new Set(historyIds.value);
    const recent = historyItems.value;
    const fresh = allItems()
      .filter((item) => !recentIds.has(item.id))
      .slice(0, suggestionLimit);
    return [...recent, ...fresh].slice(0, suggestionLimit);
  });

  const activeItems = computed(() => {
    return keyword.value.trim() ? filteredItems.value : suggestionItems.value;
  });

  watch(
    () => visible.value,
    (nextVisible) => {
      if (!nextVisible) {
        keyword.value = '';
        activeIndex.value = 0;
        return;
      }
      activeIndex.value = 0;
    }
  );

  watch(
    () => activeItems.value.length,
    (nextLength) => {
      if (nextLength <= 0) {
        activeIndex.value = 0;
        return;
      }

      if (activeIndex.value >= nextLength) {
        activeIndex.value = nextLength - 1;
      }
    }
  );

  function open() {
    visible.value = true;
  }

  function close() {
    visible.value = false;
  }

  function setKeyword(nextKeyword: string) {
    keyword.value = nextKeyword;
    activeIndex.value = 0;
  }

  function setActiveIndex(nextIndex: number) {
    if (!activeItems.value.length) {
      activeIndex.value = 0;
      return;
    }

    const normalized = Math.max(0, Math.min(nextIndex, activeItems.value.length - 1));
    activeIndex.value = normalized;
  }

  function moveActive(step: 1 | -1) {
    if (!activeItems.value.length) {
      activeIndex.value = 0;
      return;
    }

    const lastIndex = activeItems.value.length - 1;
    if (step > 0) {
      activeIndex.value = activeIndex.value >= lastIndex ? 0 : activeIndex.value + 1;
      return;
    }

    activeIndex.value = activeIndex.value <= 0 ? lastIndex : activeIndex.value - 1;
  }

  function getActiveItem(): CommandPaletteItem | undefined {
    return activeItems.value[activeIndex.value];
  }

  function recordHistory(item: CommandPaletteItem) {
    if (item.external) {
      return;
    }

    historyIds.value = [item.id, ...historyIds.value.filter((id) => id !== item.id)].slice(
      0,
      maxHistory
    );
    writeHistory(storageKey, historyIds.value);
  }

  function clearHistory() {
    historyIds.value = [];
    writeHistory(storageKey, historyIds.value);
  }

  return {
    visible,
    keyword,
    activeIndex,
    historyItems,
    filteredItems,
    suggestionItems,
    activeItems,
    open,
    close,
    setKeyword,
    setActiveIndex,
    moveActive,
    getActiveItem,
    recordHistory,
    clearHistory
  };
}

export { normalizeKeyword as normalizeCommandPaletteKeyword };
