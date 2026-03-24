import type { DictOption, DictResource, DictServiceItem } from './types';

export function toSafeString(value: unknown): string {
  if (value == null) {
    return '';
  }
  return String(value);
}

export function normalizeDictCode(raw: string): string {
  const code = raw.trim();
  if (!code) {
    throw new Error('dictCode 不能为空');
  }
  return code;
}

export function resolveTtlMs(rawTtlMs: number | undefined, fallback: number): number {
  if (typeof rawTtlMs === 'number' && Number.isFinite(rawTtlMs) && rawTtlMs >= 0) {
    return Math.trunc(rawTtlMs);
  }
  return fallback;
}

export function resolveStorageNamespace(rawNamespace: string): string {
  const namespace = rawNamespace.trim();
  return namespace || 'admin';
}

export function normalizeOptions(items: DictServiceItem[]): DictOption[] {
  return items.map((item) => ({
    label: toSafeString(item.itemName),
    value: toSafeString(item.itemValue)
  }));
}

export function buildMap(list: DictOption[]): Record<string, string> {
  return Object.fromEntries(list.map((item) => [item.value, item.label]));
}

export function createResource(items: DictServiceItem[]): DictResource {
  const list = normalizeOptions(items);
  return {
    list,
    map: buildMap(list)
  };
}

export function resolveBrowserSessionStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}
