import type { PortalTab } from '@one-base-template/portal-engine';

export function findFirstPageTabId(tabs: PortalTab[] | undefined): string {
  if (!Array.isArray(tabs)) {
    return '';
  }

  for (const tab of tabs) {
    if (!tab || typeof tab !== 'object') {
      continue;
    }
    if (tab.tabType === 2 && typeof tab.id === 'string' && tab.id) {
      return tab.id;
    }

    const nested = findFirstPageTabId(tab.children);
    if (nested) {
      return nested;
    }
  }

  return '';
}
