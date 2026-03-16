import type { PortalLayoutItem } from '../stores/pageLayout';

export interface LayoutUpdateItem {
  i: number | string;
  x: number;
  y: number;
  w: number;
  h: number;
  component?: PortalLayoutItem['component'];
  [k: string]: unknown;
}

function normalizeId(value: number | string): string {
  return String(value);
}

export function mergeLayoutItems(
  prevItems: PortalLayoutItem[],
  nextItems: LayoutUpdateItem[]
): PortalLayoutItem[] {
  const prevMap = new Map(prevItems.map((item) => [item.i, item]));

  return nextItems.map((raw) => {
    const id = normalizeId(raw.i);
    const prev = prevMap.get(id);
    return {
      ...prev,
      ...raw,
      i: id,
      component: raw.component ?? prev?.component
    } as PortalLayoutItem;
  });
}

export function hasLayoutGeometryChanged(
  prevItems: PortalLayoutItem[],
  nextItems: PortalLayoutItem[]
): boolean {
  if (prevItems.length !== nextItems.length) {
    return true;
  }

  for (let index = 0; index < prevItems.length; index += 1) {
    const prev = prevItems[index];
    const next = nextItems[index];
    if (!(prev && next)) {
      return true;
    }
    if (
      prev.i !== next.i ||
      prev.x !== next.x ||
      prev.y !== next.y ||
      prev.w !== next.w ||
      prev.h !== next.h
    ) {
      return true;
    }
  }

  return false;
}
