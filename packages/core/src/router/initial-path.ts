import { readFromStorages } from '../utils/storage';
import { getWithLegacy, getNamespacedPrefix } from '../storage/namespace';

export interface GetInitialPathOptions {
  defaultSystemCode?: string;
  systemHomeMap?: Record<string, string>;
  fallbackHome?: string;
  storageNamespace?: string;
}

type StoredMenuItem = {
  path?: unknown;
  external?: unknown;
  children?: unknown;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}

function isHttpUrl(path: string): boolean {
  return /^https?:\/\//i.test(path);
}

function getStoredSystemCode(storageNamespace?: string): string {
  const hit = getWithLegacy('ob_system_current', ['local', 'session'], storageNamespace);
  return isNonEmptyString(hit?.value) ? hit.value : '';
}

function getStoredMenuTree(systemCode: string, storageNamespace?: string): unknown[] | null {
  const scopedPrefix = getNamespacedPrefix('ob_menu_tree:', storageNamespace);
  const scopedKey = `${scopedPrefix}${systemCode}`;
  const legacyKey = `ob_menu_tree:${systemCode}`;

  const raw =
    readFromStorages(scopedKey, ['local', 'session']) ??
    (scopedKey !== legacyKey ? readFromStorages(legacyKey, ['local', 'session']) : null);

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function getFirstLeafPath(list: unknown[]): string | undefined {
  const walk = (items: unknown[]): string | undefined => {
    for (const item of items) {
      if (!item || typeof item !== 'object') continue;
      const node = item as StoredMenuItem;

      const rawPath = node.path;
      const path = isNonEmptyString(rawPath) ? rawPath : '';
      const external = typeof node.external === 'boolean' ? node.external : isHttpUrl(path);

      const rawChildren = node.children;
      const children = Array.isArray(rawChildren) ? rawChildren : [];
      if (children.length) {
        const leaf = walk(children);
        if (leaf) return leaf;
        continue;
      }

      // 仅叶子节点可作为首页兜底，避免命中目录节点。
      if (!external && path.startsWith('/')) return path;
    }
    return undefined;
  };

  return walk(list);
}

export function getInitialPath(options: GetInitialPathOptions = {}): string {
  const fallbackHome = options.fallbackHome && options.fallbackHome.startsWith('/') ? options.fallbackHome : '/home/index';

  const currentSystemCode = getStoredSystemCode(options.storageNamespace);
  const code = currentSystemCode || options.defaultSystemCode || '';

  const mapped = code ? options.systemHomeMap?.[code] : undefined;
  if (isNonEmptyString(mapped) && mapped.startsWith('/')) {
    return mapped;
  }

  if (code) {
    const cachedTree = getStoredMenuTree(code, options.storageNamespace);
    if (cachedTree?.length) {
      const leaf = getFirstLeafPath(cachedTree);
      if (leaf) return leaf;
    }
  }

  return fallbackHome;
}
