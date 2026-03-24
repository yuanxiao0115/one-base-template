interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export interface MemoryCache<T> {
  get: (key: string) => T | null;
  set: (key: string, value: T) => void;
  clear: (prefix?: string) => void;
}

interface CreateMemoryCacheOptions {
  ttlMs: number;
  now?: () => number;
}

export function createMemoryCache<T>(options: CreateMemoryCacheOptions): MemoryCache<T> {
  const entries = new Map<string, CacheEntry<T>>();
  const now = options.now ?? (() => Date.now());

  function get(key: string): T | null {
    const entry = entries.get(key);
    if (!entry) {
      return null;
    }

    if (entry.expiresAt <= now()) {
      entries.delete(key);
      return null;
    }

    return entry.value;
  }

  function set(key: string, value: T): void {
    entries.set(key, {
      value,
      expiresAt: now() + options.ttlMs
    });
  }

  function clear(prefix?: string): void {
    if (!prefix) {
      entries.clear();
      return;
    }

    for (const key of entries.keys()) {
      if (key.startsWith(prefix)) {
        entries.delete(key);
      }
    }
  }

  return {
    get,
    set,
    clear
  };
}
