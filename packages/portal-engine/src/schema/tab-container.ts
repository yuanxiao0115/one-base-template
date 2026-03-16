export const BASE_TAB_CONTAINER_INDEX_NAME = 'base-tab-container-index';

export interface TabContainerTab<TLayoutItem = unknown> {
  id: string;
  title: string;
  layoutItems: TLayoutItem[];
  [k: string]: unknown;
}

export function normalizeTabContainerTabs<TLayoutItem = unknown>(
  value: unknown
): TabContainerTab<TLayoutItem>[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((raw, index) => {
      if (!raw || typeof raw !== 'object') {
        return null;
      }
      const item = raw as Record<string, unknown>;
      const rawId = item.id;
      const id =
        typeof rawId === 'string' && rawId.trim().length > 0
          ? rawId.trim()
          : createTabContainerTabId(index + 1);
      const title =
        typeof item.title === 'string' && item.title.trim().length > 0
          ? item.title
          : `页签${index + 1}`;
      const layoutItems = Array.isArray(item.layoutItems)
        ? (item.layoutItems as TLayoutItem[])
        : [];

      return {
        ...item,
        id,
        title,
        layoutItems
      } satisfies TabContainerTab<TLayoutItem>;
    })
    .filter(Boolean) as TabContainerTab<TLayoutItem>[];
}

export function resolveTabContainerActiveTabId<TLayoutItem = unknown>(
  tabs: TabContainerTab<TLayoutItem>[],
  rawActiveId: unknown
): string {
  const activeId = typeof rawActiveId === 'string' ? rawActiveId.trim() : '';
  if (activeId && tabs.some((tab) => tab.id === activeId)) {
    return activeId;
  }
  return tabs[0]?.id || '';
}

export function createTabContainerTabId(seed: number): string {
  return `tab-${seed}`;
}

export function createTabContainerChildItemId(): string {
  return `tab-item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
