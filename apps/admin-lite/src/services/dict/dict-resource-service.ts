import { getAppEnv } from '@/config/env';
import {
  buildMap,
  createResource,
  normalizeDictCode,
  resolveBrowserSessionStorage,
  resolveStorageNamespace,
  resolveTtlMs,
  toSafeString
} from './dict-resource-utils';
import { fetchDictItems } from './dict-resource-fetcher';
import type { DictLoadOptions, DictOption, DictResource, DictServiceDeps } from './types';

const STORAGE_KEY_PREFIX = 'ob_dict_resource:';
export const DEFAULT_DICT_CACHE_TTL_MS = 5 * 60 * 1000;

interface MemoryCacheEntry {
  resource: DictResource;
  expiresAt: number;
}

interface StoredCacheEntry {
  expiresAt: number;
  list: DictOption[];
}

export function createDictService(deps: DictServiceDeps = {}) {
  const memoryCache = new Map<string, MemoryCacheEntry>();
  const pendingRequests = new Map<string, Promise<DictResource>>();

  const fetchItems = deps.fetchItems ?? fetchDictItems;
  const getStorageNamespace = deps.getStorageNamespace ?? (() => getAppEnv().storageNamespace);
  const now = deps.now ?? (() => Date.now());
  const defaultTtlMs = resolveTtlMs(deps.defaultTtlMs, DEFAULT_DICT_CACHE_TTL_MS);

  function getSessionStorage(): Storage | null {
    if (deps.sessionStorage !== undefined) {
      return deps.sessionStorage;
    }
    return resolveBrowserSessionStorage();
  }

  function getStoragePrefix(): string {
    const namespace = resolveStorageNamespace(getStorageNamespace());
    return `${namespace}:${STORAGE_KEY_PREFIX}`;
  }

  function getStorageKey(dictCode: string): string {
    return `${getStoragePrefix()}${dictCode}`;
  }

  function setMemoryCache(
    dictCode: string,
    resource: DictResource,
    ttlMs: number
  ): MemoryCacheEntry {
    const entry: MemoryCacheEntry = {
      resource,
      expiresAt: now() + ttlMs
    };
    memoryCache.set(dictCode, entry);
    return entry;
  }

  function setSessionCache(dictCode: string, entry: MemoryCacheEntry) {
    const storage = getSessionStorage();
    if (!storage) {
      return;
    }

    const payload: StoredCacheEntry = {
      expiresAt: entry.expiresAt,
      list: entry.resource.list
    };

    try {
      storage.setItem(getStorageKey(dictCode), JSON.stringify(payload));
    } catch {
      storage.removeItem(getStorageKey(dictCode));
    }
  }

  function getMemoryCache(dictCode: string): DictResource | null {
    const entry = memoryCache.get(dictCode);
    if (!entry) {
      return null;
    }

    if (entry.expiresAt <= now()) {
      memoryCache.delete(dictCode);
      return null;
    }

    return entry.resource;
  }

  function removeSessionCache(dictCode: string) {
    const storage = getSessionStorage();
    if (!storage) {
      return;
    }

    storage.removeItem(getStorageKey(dictCode));
  }

  function getSessionCache(dictCode: string): DictResource | null {
    const storage = getSessionStorage();
    if (!storage) {
      return null;
    }

    const raw = storage.getItem(getStorageKey(dictCode));
    if (!raw) {
      return null;
    }

    try {
      const payload = JSON.parse(raw) as StoredCacheEntry;
      if (!payload || !Array.isArray(payload.list) || typeof payload.expiresAt !== 'number') {
        removeSessionCache(dictCode);
        return null;
      }

      if (payload.expiresAt <= now()) {
        removeSessionCache(dictCode);
        return null;
      }

      const list = payload.list.map((item) => ({
        label: toSafeString(item.label),
        value: toSafeString(item.value)
      }));

      return {
        list,
        map: buildMap(list)
      };
    } catch {
      removeSessionCache(dictCode);
      return null;
    }
  }

  async function loadDictResource(rawDictCode: string, options: DictLoadOptions = {}) {
    const dictCode = normalizeDictCode(rawDictCode);
    const ttlMs = resolveTtlMs(options.ttlMs, defaultTtlMs);

    if (!options.force) {
      const memoryHit = getMemoryCache(dictCode);
      if (memoryHit) {
        return memoryHit;
      }

      const sessionHit = getSessionCache(dictCode);
      if (sessionHit) {
        setMemoryCache(dictCode, sessionHit, ttlMs);
        return sessionHit;
      }
    }

    const pending = pendingRequests.get(dictCode);
    if (pending) {
      return pending;
    }

    const request = fetchItems(dictCode)
      .then((items) => {
        const resource = createResource(items);
        const entry = setMemoryCache(dictCode, resource, ttlMs);
        setSessionCache(dictCode, entry);
        return resource;
      })
      .finally(() => {
        pendingRequests.delete(dictCode);
      });

    pendingRequests.set(dictCode, request);
    return request;
  }

  function clearDictCache(rawDictCode?: string) {
    if (typeof rawDictCode === 'string') {
      const dictCode = rawDictCode.trim();
      if (!dictCode) {
        return;
      }
      memoryCache.delete(dictCode);
      removeSessionCache(dictCode);
      return;
    }

    memoryCache.clear();
    pendingRequests.clear();

    const storage = getSessionStorage();
    if (!storage) {
      return;
    }

    const prefix = getStoragePrefix();
    for (let index = storage.length - 1; index >= 0; index -= 1) {
      const key = storage.key(index);
      if (!key || !key.startsWith(prefix)) {
        continue;
      }
      storage.removeItem(key);
    }
  }

  return {
    loadDictResource,
    clearDictCache
  };
}

const dictService = createDictService();
export const loadDictResource = dictService.loadDictResource;
export const clearDictCache = dictService.clearDictCache;
