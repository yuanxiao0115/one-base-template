import { addCollection } from '@iconify/vue/dist/offline';
import type { IconifyJSON } from '@iconify/types';

export type MenuIconifyPrefix = 'ep' | 'ri';

const ICONIFY_PREFIX_SET = new Set<MenuIconifyPrefix>(['ep', 'ri']);

const ICONIFY_COLLECTION_LOADERS: Record<MenuIconifyPrefix, () => Promise<IconifyJSON>> = {
  ep: async () => (await import('@iconify-json/ep/icons.json')).default as IconifyJSON,
  ri: async () => (await import('@iconify-json/ri/icons.json')).default as IconifyJSON
};

const iconifyCollectionCache = new Map<MenuIconifyPrefix, IconifyJSON>();
const iconifyCollectionTaskCache = new Map<MenuIconifyPrefix, Promise<IconifyJSON>>();

function normalizeIconValue(value: string | undefined): string {
  return (value ?? '').trim();
}

function parseMenuIconifyValue(value: string | undefined) {
  const normalized = normalizeIconValue(value);
  const separatorIndex = normalized.indexOf(':');
  if (separatorIndex <= 0) {
    return undefined;
  }

  const prefix = normalized.slice(0, separatorIndex) as MenuIconifyPrefix;
  const name = normalized.slice(separatorIndex + 1);
  if (!ICONIFY_PREFIX_SET.has(prefix) || !name) {
    return undefined;
  }

  return {
    normalized,
    prefix,
    name
  };
}

function resolvePrefixes(prefix?: MenuIconifyPrefix | MenuIconifyPrefix[]): MenuIconifyPrefix[] {
  if (!prefix) {
    return ['ep', 'ri'];
  }

  return Array.isArray(prefix) ? prefix : [prefix];
}

async function loadMenuIconifyCollection(prefix: MenuIconifyPrefix): Promise<IconifyJSON> {
  const loader = ICONIFY_COLLECTION_LOADERS[prefix];
  if (!loader) {
    throw new Error(`[menu-iconify] 不支持的图标前缀：${prefix}`);
  }

  const cached = iconifyCollectionCache.get(prefix);
  if (cached) {
    return cached;
  }

  const pending = iconifyCollectionTaskCache.get(prefix);
  if (pending) {
    return pending;
  }

  const task = loader()
    .then((collection) => {
      addCollection(collection);
      iconifyCollectionCache.set(prefix, collection);
      return collection;
    })
    .finally(() => {
      iconifyCollectionTaskCache.delete(prefix);
    });

  iconifyCollectionTaskCache.set(prefix, task);
  return task;
}

export function isMenuIconifyValue(value: string | undefined): value is `${MenuIconifyPrefix}:${string}` {
  return Boolean(parseMenuIconifyValue(value));
}

export function getMenuIconifyPrefix(value: string | undefined): MenuIconifyPrefix | undefined {
  return parseMenuIconifyValue(value)?.prefix;
}

export async function ensureMenuIconifyCollectionsRegistered(
  prefix?: MenuIconifyPrefix | MenuIconifyPrefix[]
): Promise<void> {
  await Promise.all(resolvePrefixes(prefix).map(item => loadMenuIconifyCollection(item)));
}

export async function ensureMenuIconifyIconRegistered(value: string | undefined): Promise<void> {
  const prefix = getMenuIconifyPrefix(value);
  if (!prefix) {
    return;
  }

  await ensureMenuIconifyCollectionsRegistered(prefix);
}

export async function getMenuIconifyNames(prefix: MenuIconifyPrefix): Promise<string[]> {
  const collection = await loadMenuIconifyCollection(prefix);
  return Object.keys(collection.icons ?? {});
}
