import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getCoreOptions } from '../context';

type GetImageUrlOptions = {
  /** 强制从后端重新拉取（同时覆盖本地持久化缓存） */
  forceRefresh?: boolean;
};

const DB_NAME = 'ob_asset_cache';
const DB_VERSION = 1;
const STORE_NAME = 'images';

const MAX_JSON_PROBE_SIZE = 1024 * 1024;

let dbPromise: Promise<IDBDatabase | null> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

async function tryReadBizErrorMessageFromBlob(blob: Blob): Promise<string | undefined> {
  if (blob.size <= 0) return undefined;
  if (blob.size > MAX_JSON_PROBE_SIZE) return undefined;

  // icon 应该返回图片二进制；如果返回 JSON，大概率是后端报错（未登录/无权限/不存在等）
  const type = (blob.type || '').toLowerCase();
  const shouldProbe =
    !type ||
    type.includes('application/json') ||
    type.includes('text/json') ||
    type.includes('text/plain') ||
    type.includes('application/problem+json') ||
    type.includes('application/octet-stream');

  if (!shouldProbe) return undefined;

  try {
    const text = await blob.text();
    const parsed = JSON.parse(text) as unknown;
    if (!isRecord(parsed)) return undefined;

    // 兼容常见业务码结构：{ code, data, message }
    if (!('code' in parsed)) return undefined;

    const message = parsed.message;
    if (typeof message === 'string' && message) return message;

    return '后端返回业务错误';
  } catch {
    return undefined;
  }
}

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise(resolve => {
    if (typeof indexedDB === 'undefined') return resolve(null);

    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });

  return dbPromise;
}

async function idbGetBlob(key: string): Promise<Blob | undefined> {
  const db = await openDb();
  if (!db) return undefined;

  return await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(key);

    req.onsuccess = () => resolve(req.result as Blob | undefined);
    req.onerror = () => reject(req.error);
  });
}

async function idbSetBlob(key: string, blob: Blob): Promise<void> {
  const db = await openDb();
  if (!db) return;

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(blob, key);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * 资源缓存（含持久化）：
 * - 用于“minio id -> 图片 Blob -> objectURL”的转换
 * - IndexedDB 持久化 blob，避免刷新后重复拉取
 */
export const useAssetStore = defineStore('ob-assets', () => {
  const errors = ref<Record<string, string>>({});

  // 仅缓存本次会话的 objectURL，避免重复 createObjectURL
  const urlCache = new Map<string, string>();
  const pending = new Map<string, Promise<string | undefined>>();

  async function fetchImageBlobFromAdapter(id: string): Promise<Blob | undefined> {
    const adapter = getCoreOptions().adapter;
    const api = adapter.assets?.fetchImageBlob;
    if (!api) return undefined;

    const blob = await api({ id });
    if (!(blob instanceof Blob)) return undefined;
    return blob;
  }

  async function getImageUrl(id: string, options: GetImageUrlOptions = {}): Promise<string | undefined> {
    const key = id.trim();
    if (!key) return undefined;

    if (!options.forceRefresh) {
      const inMemory = urlCache.get(key);
      if (inMemory) return inMemory;
    }

    const inflight = pending.get(key);
    if (inflight) return inflight;

    const task = (async () => {
      try {
        if (!options.forceRefresh) {
          const cachedBlob = await idbGetBlob(key);
          if (cachedBlob instanceof Blob) {
            const bizError = await tryReadBizErrorMessageFromBlob(cachedBlob);
            if (!bizError) {
              const url = URL.createObjectURL(cachedBlob);
              urlCache.set(key, url);
              return url;
            }
          }
        }

        const fresh = await fetchImageBlobFromAdapter(key);
        if (!fresh) return undefined;

        const bizError = await tryReadBizErrorMessageFromBlob(fresh);
        if (bizError) {
          throw new Error(bizError);
        }

        // 写入持久化缓存（忽略写失败：不影响本次渲染）
        try {
          await idbSetBlob(key, fresh);
        } catch {
          // ignore
        }

        const url = URL.createObjectURL(fresh);
        urlCache.set(key, url);
        return url;
      } catch (e: unknown) {
        const message = e instanceof Error && e.message ? e.message : 'load asset failed';
        errors.value = { ...errors.value, [key]: message };
        return undefined;
      } finally {
        pending.delete(key);
      }
    })();

    pending.set(key, task);
    return task;
  }

  function revokeImageUrl(id: string) {
    const key = id.trim();
    if (!key) return;

    const url = urlCache.get(key);
    if (url) {
      URL.revokeObjectURL(url);
      urlCache.delete(key);
    }
  }

  function clearMemoryCache() {
    for (const url of urlCache.values()) {
      URL.revokeObjectURL(url);
    }
    urlCache.clear();
  }

  return {
    errors,
    getImageUrl,
    revokeImageUrl,
    clearMemoryCache
  };
});
