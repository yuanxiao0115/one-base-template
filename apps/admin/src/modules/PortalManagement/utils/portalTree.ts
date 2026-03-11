import type { PortalTab } from "../types";

export function normalizeIdLike(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return "";
}

export function walkTabs(tabs: PortalTab[] | undefined, visitor: (tab: PortalTab) => void) {
  if (!Array.isArray(tabs)) {
    return;
  }
  for (const tab of tabs) {
    if (!tab || typeof tab !== "object") {
      continue;
    }
    visitor(tab);
    if (Array.isArray(tab.children) && tab.children.length > 0) {
      walkTabs(tab.children, visitor);
    }
  }
}

export function normalizeParentId(parent: PortalTab | null | undefined): number | string {
  const id = normalizeIdLike(parent?.id);
  return id || 0;
}

export function normalizeTabName(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return fallback;
}

export function findTabById(tabs: PortalTab[] | undefined, tabId: string): PortalTab | null {
  if (!tabId || !Array.isArray(tabs)) {
    return null;
  }
  for (const tab of tabs) {
    const id = normalizeIdLike(tab?.id);
    if (id === tabId) {
      return tab;
    }
    const child = findTabById(tab?.children, tabId);
    if (child) {
      return child;
    }
  }
  return null;
}

export function findFirstPageTabId(tabs: PortalTab[] | undefined): string {
  if (!Array.isArray(tabs)) {
    return "";
  }
  for (const tab of tabs) {
    if (!tab || typeof tab !== "object") {
      continue;
    }
    const id = normalizeIdLike(tab.id);
    if (tab.tabType === 2 && id) {
      return id;
    }
    const nested = findFirstPageTabId(tab.children);
    if (nested) {
      return nested;
    }
  }
  return "";
}

export function containsTabId(tabs: PortalTab[] | undefined, tabId: string): boolean {
  if (!tabId) {
    return false;
  }
  let found = false;
  walkTabs(tabs, (t) => {
    if (found) {
      return;
    }
    if (normalizeIdLike(t.id) === tabId) {
      found = true;
    }
  });
  return found;
}

export function calcNextSort(tabs: PortalTab[] | undefined, parentId: PortalTab["parentId"]): number {
  const parentKey = normalizeIdLike(parentId) || "0";
  let maxSort = 0;
  walkTabs(tabs, (t) => {
    const key = normalizeIdLike(t.parentId) || "0";
    if (key !== parentKey) {
      return;
    }
    const raw = t.sort ?? t.tabOrder ?? t.order ?? 0;
    const val = Number(raw);
    if (Number.isFinite(val) && val > maxSort) {
      maxSort = val;
    }
  });
  return maxSort + 1;
}
