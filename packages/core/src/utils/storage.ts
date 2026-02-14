export type StorageKind = 'local' | 'session';

function getStorage(kind: StorageKind): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function isQuotaExceededError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;

  // 现代浏览器的 DOMException.name：
  // - QuotaExceededError
  // - NS_ERROR_DOM_QUOTA_REACHED（Firefox）
  const name = (err as { name?: unknown }).name;
  if (name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED') return true;

  // 兼容旧实现（部分浏览器 / 老 WebView）
  const code = (err as { code?: unknown }).code;
  return code === 22 || code === 1014;
}

export function byteLength(text: string): number {
  try {
    return new TextEncoder().encode(text).length;
  } catch {
    // 兜底：在极老环境下没有 TextEncoder，退化为按字符长度估算
    return text.length;
  }
}

export function readFromStorages(key: string, kinds: StorageKind[] = ['local', 'session']): string | null {
  for (const kind of kinds) {
    const storage = getStorage(kind);
    if (!storage) continue;
    try {
      const raw = storage.getItem(key);
      if (typeof raw === 'string' && raw.length > 0) return raw;
    } catch {
      // 忽略
    }
  }
  return null;
}

export function removeFromStorages(key: string, kinds: StorageKind[] = ['local', 'session']) {
  for (const kind of kinds) {
    const storage = getStorage(kind);
    if (!storage) continue;
    try {
      storage.removeItem(key);
    } catch {
      // 忽略
    }
  }
}

export function safeSetToStorage(
  key: string,
  value: string,
  options: {
    primary?: StorageKind;
    fallback?: StorageKind;
    onPrimaryQuotaExceeded?: () => void;
  } = {}
): StorageKind | null {
  const primary = options.primary ?? 'local';
  const fallback = options.fallback ?? 'session';

  const tryWrite = (kind: StorageKind, onQuotaExceeded?: () => void): boolean => {
    const storage = getStorage(kind);
    if (!storage) return false;

    try {
      storage.setItem(key, value);
      return true;
    } catch (err) {
      if (kind === primary && onQuotaExceeded && isQuotaExceededError(err)) {
        try {
          onQuotaExceeded();
        } catch {
          // 忽略
        }
        try {
          storage.setItem(key, value);
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  };

  const clearKey = (kind: StorageKind) => {
    const storage = getStorage(kind);
    if (!storage) return;
    try {
      storage.removeItem(key);
    } catch {
      // 忽略
    }
  };

  if (tryWrite(primary, options.onPrimaryQuotaExceeded)) {
    // 避免 local/session 同时存在不同值时“读优先级”带来的状态抖动。
    if (fallback !== primary) clearKey(fallback);
    return primary;
  }

  if (fallback !== primary && tryWrite(fallback)) {
    // fallback 成功时，清理 primary 的旧值，防止刷新后又读回旧值。
    clearKey(primary);
    return fallback;
  }

  return null;
}

export function removeByPrefixes(prefixes: string[], kind: StorageKind = 'local'): number {
  const storage = getStorage(kind);
  if (!storage) return 0;

  let removed = 0;
  try {
    for (let i = storage.length - 1; i >= 0; i--) {
      const key = storage.key(i);
      if (!key) continue;
      if (prefixes.some(p => key.startsWith(p))) {
        storage.removeItem(key);
        removed++;
      }
    }
  } catch {
    // 忽略
  }

  return removed;
}
