import { parseRuntimeConfig, type RuntimeConfig } from '@one-base-template/core';

const CONFIG_URL = `${import.meta.env.BASE_URL}platform-config.json`;
const CONFIG_REQUEST_TIMEOUT_MS = 8000;
const CONFIG_MAX_RETRY = 1;
const ENABLE_LOCAL_SNAPSHOT_FALLBACK =
  import.meta.env.VITE_ENABLE_PLATFORM_CONFIG_SNAPSHOT_FALLBACK === 'true';
const LOCAL_SNAPSHOT_KEY = `${import.meta.env.BASE_URL}platform-config:snapshot:v1`;

type LocalConfigSnapshot = {
  version: 1;
  savedAt: string;
  config: RuntimeConfig;
};

export type PlatformConfigLoadErrorCode =
  | 'REQUEST_TIMEOUT'
  | 'REQUEST_FAILED'
  | 'PARSE_FAILED'
  | 'VALIDATION_FAILED'
  | 'FALLBACK_PARSE_FAILED';

export class PlatformConfigLoadError extends Error {
  readonly code: PlatformConfigLoadErrorCode;
  readonly cause: unknown;

  constructor(params: { code: PlatformConfigLoadErrorCode; message: string; cause?: unknown }) {
    super(params.message);
    this.name = 'PlatformConfigLoadError';
    this.code = params.code;
    this.cause = params.cause;
  }
}

let cachedConfig: RuntimeConfig | null = null;
let loadingPromise: Promise<RuntimeConfig> | null = null;

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

export function isPlatformConfigLoadError(error: unknown): error is PlatformConfigLoadError {
  return error instanceof PlatformConfigLoadError;
}

function getLocalStorageSafely(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function writeLocalSnapshot(config: RuntimeConfig) {
  if (!ENABLE_LOCAL_SNAPSHOT_FALLBACK) return;

  const storage = getLocalStorageSafely();
  if (!storage) return;

  const snapshot: LocalConfigSnapshot = {
    version: 1,
    savedAt: new Date().toISOString(),
    config
  };

  try {
    storage.setItem(LOCAL_SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch {
    // 兜底快照为弱保障能力，写入失败时不阻断主流程。
  }
}

function readLocalSnapshot(): RuntimeConfig | null {
  const storage = getLocalStorageSafely();
  if (!storage) return null;

  const raw = storage.getItem(LOCAL_SNAPSHOT_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return null;
    if (parsed.version !== 1) return null;
    if (!('config' in parsed)) return null;
    return parseRuntimeConfig(parsed.config);
  } catch (error) {
    throw createLoadError({
      code: 'FALLBACK_PARSE_FAILED',
      message: `[platform-config] 本地只读兜底快照不可用：${toErrorMessage(error)}`,
      cause: error
    });
  }
}

function tryResolveFallbackConfig(primaryError: PlatformConfigLoadError): RuntimeConfig | null {
  if (!ENABLE_LOCAL_SNAPSHOT_FALLBACK) return null;

  const snapshot = readLocalSnapshot();
  if (!snapshot) return null;

  console.warn(`[platform-config] 主配置加载失败，已使用本地只读兜底快照：${primaryError.message}`);
  return snapshot;
}

async function fetchConfigJsonOnce(): Promise<unknown> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => {
    controller.abort();
  }, CONFIG_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(CONFIG_URL, {
      cache: 'no-store',
      signal: controller.signal
    });

    if (!response.ok) {
      throw createLoadError({
        code: 'REQUEST_FAILED',
        message: `[platform-config] 加载失败：${response.status} ${response.statusText}`
      });
    }

    try {
      return await response.json();
    } catch (error) {
      throw createLoadError({
        code: 'PARSE_FAILED',
        message: `[platform-config] JSON 解析失败：${toErrorMessage(error)}`,
        cause: error
      });
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw createLoadError({
        code: 'REQUEST_TIMEOUT',
        message: `[platform-config] 请求超时（>${CONFIG_REQUEST_TIMEOUT_MS}ms）`,
        cause: error
      });
    }
    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

async function fetchConfigJsonWithRetry(): Promise<unknown> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= CONFIG_MAX_RETRY; attempt += 1) {
    try {
      return await fetchConfigJsonOnce();
    } catch (error) {
      lastError = error;
      if (isPlatformConfigLoadError(error) && error.code === 'PARSE_FAILED') {
        throw error;
      }
      if (attempt < CONFIG_MAX_RETRY) {
        continue;
      }
    }
  }

  if (isPlatformConfigLoadError(lastError)) {
    throw lastError;
  }

  throw createLoadError({
    code: 'REQUEST_FAILED',
    message: `[platform-config] 加载失败：${toErrorMessage(lastError)}`,
    cause: lastError
  });
}

function normalizePrimaryError(error: unknown): PlatformConfigLoadError {
  if (isPlatformConfigLoadError(error)) return error;

  const message = toErrorMessage(error);
  if (message.includes('[platform-config] 校验失败')) {
    return createLoadError({
      code: 'VALIDATION_FAILED',
      message,
      cause: error
    });
  }

  return createLoadError({
    code: 'PARSE_FAILED',
    message: `[platform-config] 解析配置失败：${message}`,
    cause: error
  });
}

export async function loadPlatformConfig(): Promise<RuntimeConfig> {
  if (cachedConfig) return cachedConfig;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const json = await fetchConfigJsonWithRetry();
      cachedConfig = parseRuntimeConfig(json);
      writeLocalSnapshot(cachedConfig);
      return cachedConfig;
    } catch (error) {
      const primaryError = normalizePrimaryError(error);
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

export function getPlatformConfig(): RuntimeConfig {
  if (!cachedConfig) {
    throw new Error('[platform-config] 尚未加载，请先调用 loadPlatformConfig()');
  }
  return cachedConfig;
}
