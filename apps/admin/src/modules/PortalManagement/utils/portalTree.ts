import {
  calcPortalTabNextSort,
  containsPortalTabId,
  findFirstPortalPageTabId,
  findPortalTabById,
  isPortalTabEditable,
  normalizePortalParentId,
  normalizePortalTabId,
  normalizePortalTabName,
  walkPortalTabs,
} from "@one-base-template/portal-engine";

import type { PortalTab } from "../types";

export { isPortalTabEditable };

export function normalizeIdLike(value: unknown): string {
  return normalizePortalTabId(value);
}

export function walkTabs(tabs: PortalTab[] | undefined, visitor: (tab: PortalTab) => void) {
  walkPortalTabs(tabs, visitor);
}

export function normalizeParentId(parent: PortalTab | null | undefined): number | string {
  return normalizePortalParentId(parent);
}

export function normalizeTabName(value: unknown, fallback: string): string {
  return normalizePortalTabName(value, fallback);
}

export function findTabById(tabs: PortalTab[] | undefined, tabId: string): PortalTab | null {
  return findPortalTabById(tabs, tabId);
}

export function findFirstPageTabId(tabs: PortalTab[] | undefined): string {
  return findFirstPortalPageTabId(tabs);
}

export function containsTabId(tabs: PortalTab[] | undefined, tabId: string): boolean {
  return containsPortalTabId(tabs, tabId);
}

export function calcNextSort(tabs: PortalTab[] | undefined, parentId: PortalTab["parentId"]): number {
  return calcPortalTabNextSort(tabs, parentId);
}
