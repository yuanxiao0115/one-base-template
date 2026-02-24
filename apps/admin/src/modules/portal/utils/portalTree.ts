import type { PortalTab } from '../types';

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

