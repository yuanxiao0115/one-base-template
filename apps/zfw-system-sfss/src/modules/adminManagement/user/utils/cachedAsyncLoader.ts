export interface CachedAsyncLoaderLoadOptions {
  force?: boolean;
}

export interface CachedAsyncLoaderOptions {
  ttlMs?: number;
}

interface CachedValue<T> {
  value: T;
  createdAt: number;
}

function isFiniteNonNegative(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function createCachedAsyncLoader<T>(
  fetcher: () => Promise<T>,
  options: CachedAsyncLoaderOptions = {}
) {
  const ttlMs = isFiniteNonNegative(options.ttlMs) ? Math.trunc(options.ttlMs) : null;
  let cache: CachedValue<T> | null = null;
  let pending: Promise<T> | null = null;

  function isCacheValid(now: number): boolean {
    if (!cache) {
      return false;
    }

    if (ttlMs === null) {
      return true;
    }

    return now - cache.createdAt <= ttlMs;
  }

  function setCache(value: T) {
    cache = {
      value,
      createdAt: Date.now()
    };
  }

  async function load(loadOptions: CachedAsyncLoaderLoadOptions = {}): Promise<T> {
    const force = Boolean(loadOptions.force);

    if (!force) {
      const now = Date.now();
      if (isCacheValid(now) && cache) {
        return cache.value;
      }
      if (pending) {
        return pending;
      }
    }

    pending = fetcher()
      .then((value) => {
        setCache(value);
        return value;
      })
      .finally(() => {
        pending = null;
      });

    return pending;
  }

  function clear() {
    cache = null;
  }

  function peek(): T | null {
    if (!cache) {
      return null;
    }
    return cache.value;
  }

  return {
    load,
    clear,
    peek
  };
}
