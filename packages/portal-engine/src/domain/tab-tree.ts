export interface PortalTabTreeNode {
  id?: unknown;
  parentId?: unknown;
  tabType?: unknown;
  sort?: unknown;
  tabOrder?: unknown;
  order?: unknown;
  tabName?: unknown;
  children?: PortalTabTreeNode[];
}

export function isPortalTabEditable(tabType: unknown): boolean {
  return Number(tabType) === 2;
}

export function normalizePortalTabId(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return '';
}

export function normalizePortalTabName(value: unknown, fallback: string): string {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  return fallback;
}

export function walkPortalTabs<T extends PortalTabTreeNode>(tabs: T[] | undefined, visitor: (tab: T) => void) {
  if (!Array.isArray(tabs)) {
    return;
  }
  for (const tab of tabs) {
    if (!tab || typeof tab !== 'object') {
      continue;
    }
    visitor(tab);
    if (Array.isArray(tab.children) && tab.children.length > 0) {
      walkPortalTabs(tab.children as T[], visitor);
    }
  }
}

export function normalizePortalParentId(parent: PortalTabTreeNode | null | undefined): number | string {
  const id = normalizePortalTabId(parent?.id);
  return id || 0;
}

export function findPortalTabById<T extends PortalTabTreeNode>(tabs: T[] | undefined, tabId: string): T | null {
  if (!(tabId && Array.isArray(tabs))) {
    return null;
  }

  for (const tab of tabs) {
    const id = normalizePortalTabId(tab?.id);
    if (id === tabId) {
      return tab;
    }
    const child = findPortalTabById(tab?.children as T[] | undefined, tabId);
    if (child) {
      return child;
    }
  }

  return null;
}

export function findFirstPortalPageTabId<T extends PortalTabTreeNode>(tabs: T[] | undefined): string {
  if (!Array.isArray(tabs)) {
    return '';
  }
  for (const tab of tabs) {
    if (!tab || typeof tab !== 'object') {
      continue;
    }
    const id = normalizePortalTabId(tab.id);
    if (isPortalTabEditable(tab.tabType) && id) {
      return id;
    }
    const nested = findFirstPortalPageTabId(tab.children as T[] | undefined);
    if (nested) {
      return nested;
    }
  }
  return '';
}

export function containsPortalTabId<T extends PortalTabTreeNode>(tabs: T[] | undefined, tabId: string): boolean {
  if (!tabId) {
    return false;
  }
  let found = false;
  walkPortalTabs(tabs, (tab) => {
    if (found) {
      return;
    }
    if (normalizePortalTabId(tab.id) === tabId) {
      found = true;
    }
  });
  return found;
}

export function calcPortalTabNextSort<T extends PortalTabTreeNode>(tabs: T[] | undefined, parentId: unknown): number {
  const parentKey = normalizePortalTabId(parentId) || '0';
  let maxSort = 0;
  walkPortalTabs(tabs, (tab) => {
    const key = normalizePortalTabId(tab.parentId) || '0';
    if (key !== parentKey) {
      return;
    }
    const raw = tab.sort ?? tab.tabOrder ?? tab.order ?? 0;
    const value = Number(raw);
    if (Number.isFinite(value) && value > maxSort) {
      maxSort = value;
    }
  });
  return maxSort + 1;
}
