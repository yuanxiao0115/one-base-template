export type PlatformConfigLoadErrorCode =
  | 'FALLBACK_PARSE_FAILED'
  | 'PARSE_FAILED'
  | 'REQUEST_FAILED'
  | 'REQUEST_TIMEOUT'
  | 'VALIDATION_FAILED';

export class PlatformConfigLoadError extends Error {
  readonly code: PlatformConfigLoadErrorCode;

  readonly cause: unknown;

  constructor(params: {
    code: PlatformConfigLoadErrorCode;
    message: string;
    cause?: unknown;
  }) {
    super(params.message);
    this.name = 'PlatformConfigLoadError';
    this.code = params.code;
    this.cause = params.cause;
  }
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface RuntimeConfigSnapshot<TConfig> {
  version: 1;
  savedAt: string;
  config: TConfig;
}

export interface RuntimeConfigLoaderOptions<TConfig> {
  configUrl: string;
  parseConfig: (input: unknown) => TConfig;
  requestTimeoutMs?: number;
  maxRetry?: number;
  enableLocalSnapshotFallback?: boolean;
  localSnapshotKey?: string;
  fetcher?: typeof fetch;
  storage?: StorageLike;
  onWarn?: (message: string) => void;
}

export interface RuntimeConfigLoader<TConfig> {
  loadConfig(): Promise<TConfig>;
  getConfig(): TConfig;
  resetCache(): void;
  isLoadError(error: unknown): error is PlatformConfigLoadError;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '未知错误';
}

function createLoadError(params: {
  code: PlatformConfigLoadErrorCode;
  message: string;
  cause?: unknown;
}): PlatformConfigLoadError {
  return new PlatformConfigLoadError(params);
}

function normalizeLoadError(error: unknown): PlatformConfigLoadError {
  if (error instanceof PlatformConfigLoadError) {
    return error;
  }

  const message = toErrorMessage(error);
  if (message.includes('[platform-config] 校验失败')) {
    return createLoadError({
      code: 'VALIDATION_FAILED',
      message,
      cause: error,
    });
  }

  return createLoadError({
    code: 'PARSE_FAILED',
    message: `[platform-config] 解析配置失败：${message}`,
    cause: error,
  });
}

function getDefaultStorage(): StorageLike | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readSnapshot<TConfig>(params: {
  storage: StorageLike | null;
  localSnapshotKey: string;
  parseConfig: (input: unknown) => TConfig;
}): TConfig | null {
  const { storage, localSnapshotKey, parseConfig } = params;
  if (!storage) {
    return null;
  }

  const raw = storage.getItem(localSnapshotKey);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) {
      return null;
    }
    if (parsed.version !== 1 || !('config' in parsed)) {
      return null;
    }
    return parseConfig(parsed.config);
  } catch (error) {
    throw createLoadError({
      code: 'FALLBACK_PARSE_FAILED',
      message: `[platform-config] 本地只读兜底快照不可用：${toErrorMessage(error)}`,
      cause: error,
    });
  }
}

function writeSnapshot<TConfig>(params: {
  storage: StorageLike | null;
  localSnapshotKey: string;
  config: TConfig;
}): void {
  const { storage, localSnapshotKey, config } = params;
  if (!storage) {
    return;
  }

  const snapshot: RuntimeConfigSnapshot<TConfig> = {
    version: 1,
    savedAt: new Date().toISOString(),
    config,
  };

  try {
    storage.setItem(localSnapshotKey, JSON.stringify(snapshot));
  } catch {
    // 兜底快照是弱保障能力，写入失败不阻断主流程。
  }
}

export function createRuntimeConfigLoader<TConfig>(
  options: RuntimeConfigLoaderOptions<TConfig>
): RuntimeConfigLoader<TConfig> {
  const {
    configUrl,
    parseConfig,
    requestTimeoutMs,
    maxRetry = 0,
    enableLocalSnapshotFallback = false,
    localSnapshotKey = `${configUrl}:snapshot:v1`,
    fetcher = fetch,
    storage = getDefaultStorage(),
    onWarn,
  } = options;

  let cachedConfig: TConfig | null = null;
  let loadingPromise: Promise<TConfig> | null = null;

  async function fetchConfigJsonOnce(): Promise<unknown> {
    const hasTimeout = typeof requestTimeoutMs === 'number' && requestTimeoutMs > 0;
    const controller = hasTimeout ? new AbortController() : null;
    const timeout = hasTimeout
      ? globalThis.setTimeout(() => {
          controller?.abort();
        }, requestTimeoutMs)
      : null;

    try {
      const response = await fetcher(configUrl, {
        cache: 'no-store',
        signal: controller?.signal,
      });

      if (!response.ok) {
        throw createLoadError({
          code: 'REQUEST_FAILED',
          message: `[platform-config] 加载失败：${response.status} ${response.statusText}`,
        });
      }

      try {
        return await response.json();
      } catch (error) {
        throw createLoadError({
          code: 'PARSE_FAILED',
          message: `[platform-config] JSON 解析失败：${toErrorMessage(error)}`,
          cause: error,
        });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw createLoadError({
          code: 'REQUEST_TIMEOUT',
          message: `[platform-config] 请求超时（>${requestTimeoutMs}ms）`,
          cause: error,
        });
      }
      throw error;
    } finally {
      if (timeout !== null) {
        globalThis.clearTimeout(timeout);
      }
    }
  }

  async function fetchConfigJsonWithRetry(): Promise<unknown> {
    let lastError: unknown = null;

    for (let attempt = 0; attempt <= maxRetry; attempt += 1) {
      try {
        return await fetchConfigJsonOnce();
      } catch (error) {
        lastError = error;
        if (error instanceof PlatformConfigLoadError && error.code === 'PARSE_FAILED') {
          throw error;
        }
      }
    }

    if (lastError instanceof PlatformConfigLoadError) {
      throw lastError;
    }

    throw createLoadError({
      code: 'REQUEST_FAILED',
      message: `[platform-config] 加载失败：${toErrorMessage(lastError)}`,
      cause: lastError,
    });
  }

  function tryResolveFallbackConfig(primaryError: PlatformConfigLoadError): TConfig | null {
    if (!enableLocalSnapshotFallback) {
      return null;
    }

    const snapshot = readSnapshot({
      storage,
      localSnapshotKey,
      parseConfig,
    });
    if (!snapshot) {
      return null;
    }

    onWarn?.(`[platform-config] 主配置加载失败，已使用本地只读兜底快照：${primaryError.message}`);
    return snapshot;
  }

  async function loadConfig(): Promise<TConfig> {
    if (cachedConfig) {
      return cachedConfig;
    }
    if (loadingPromise) {
      return loadingPromise;
    }

    loadingPromise = (async () => {
      try {
        const json = await fetchConfigJsonWithRetry();
        cachedConfig = parseConfig(json);
        if (enableLocalSnapshotFallback) {
          writeSnapshot({
            storage,
            localSnapshotKey,
            config: cachedConfig,
          });
        }
        return cachedConfig;
      } catch (error) {
        const primaryError = normalizeLoadError(error);
        const fallbackConfig = tryResolveFallbackConfig(primaryError);
        if (fallbackConfig) {
          cachedConfig = fallbackConfig;
          return fallbackConfig;
        }
        throw primaryError;
      }
    })().finally(() => {
      loadingPromise = null;
    });

    return loadingPromise;
  }

  function getConfig(): TConfig {
    if (!cachedConfig) {
      throw new Error('[platform-config] 尚未加载，请先调用 loadConfig()');
    }

    return cachedConfig;
  }

  return {
    loadConfig,
    getConfig,
    resetCache() {
      cachedConfig = null;
      loadingPromise = null;
    },
    isLoadError(error: unknown): error is PlatformConfigLoadError {
      return error instanceof PlatformConfigLoadError;
    },
  };
}
