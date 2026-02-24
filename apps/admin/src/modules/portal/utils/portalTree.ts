import type { PortalTab } from '../types';

function normalizeIdLike(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

export function walkTabs(tabs: PortalTab[] | undefined, visitor: (tab: PortalTab) => void) {
  if (!Array.isArray(tabs)) return;
  for (const tab of tabs) {
    if (!tab || typeof tab !== 'object') continue;
    visitor(tab);
    if (Array.isArray(tab.children) && tab.children.length > 0) {
      walkTabs(tab.children, visitor);
    }
  }
}

export function findFirstPageTabId(tabs: PortalTab[] | undefined): string {
  if (!Array.isArray(tabs)) return '';
  for (const tab of tabs) {
    if (!tab || typeof tab !== 'object') continue;
    if (tab.tabType === 2 && typeof tab.id === 'string' && tab.id) return tab.id;
    const nested = findFirstPageTabId(tab.children);
    if (nested) return nested;
  }
  return '';
}

export function containsTabId(tabs: PortalTab[] | undefined, tabId: string): boolean {
  if (!tabId) return false;
  let found = false;
  walkTabs(tabs, (t) => {
    if (found) return;
    if (t.id === tabId) found = true;
  });
  return found;
}

export function calcNextSort(tabs: PortalTab[] | undefined, parentId: PortalTab['parentId']): number {
  const parentKey = normalizeIdLike(parentId) || '0';
  let maxSort = 0;
  walkTabs(tabs, (t) => {
    const key = normalizeIdLike(t.parentId) || '0';
    if (key !== parentKey) return;
    const raw = t.sort ?? t.tabOrder ?? t.order ?? 0;
    const val = Number(raw);
    if (Number.isFinite(val) && val > maxSort) maxSort = val;
  });
  return maxSort + 1;
}
