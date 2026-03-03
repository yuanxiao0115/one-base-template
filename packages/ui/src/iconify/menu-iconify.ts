import { addCollection } from '@iconify/vue/dist/offline';
import type { IconifyJSON } from '@iconify/types';
import epCollectionRaw from '@iconify-json/ep/icons.json';
import riCollectionRaw from '@iconify-json/ri/icons.json';

export type MenuIconifyPrefix = 'ep' | 'ri';

const EP_COLLECTION = epCollectionRaw as IconifyJSON;
const RI_COLLECTION = riCollectionRaw as IconifyJSON;
const ICONIFY_PREFIX_SET = new Set<MenuIconifyPrefix>(['ep', 'ri']);

const ICONIFY_COLLECTIONS: Record<MenuIconifyPrefix, IconifyJSON> = {
  ep: EP_COLLECTION,
  ri: RI_COLLECTION
};

const ICONIFY_NAMES: Record<MenuIconifyPrefix, string[]> = {
  ep: Object.keys(EP_COLLECTION.icons ?? {}),
  ri: Object.keys(RI_COLLECTION.icons ?? {})
};

let menuIconifyRegistered = false;

function normalizeIconValue(value: string | undefined): string {
  return (value ?? '').trim();
}

export function isMenuIconifyValue(value: string | undefined): value is `${MenuIconifyPrefix}:${string}` {
  const normalized = normalizeIconValue(value);
  const separatorIndex = normalized.indexOf(':');
  if (separatorIndex <= 0) return false;

  const prefix = normalized.slice(0, separatorIndex) as MenuIconifyPrefix;
  const name = normalized.slice(separatorIndex + 1);
  return ICONIFY_PREFIX_SET.has(prefix) && Boolean(name);
}

export function ensureMenuIconifyCollectionsRegistered(): void {
  if (menuIconifyRegistered) return;

  addCollection(ICONIFY_COLLECTIONS.ep);
  addCollection(ICONIFY_COLLECTIONS.ri);
  menuIconifyRegistered = true;
}

export function getMenuIconifyNames(prefix: MenuIconifyPrefix): string[] {
  return ICONIFY_NAMES[prefix];
}
