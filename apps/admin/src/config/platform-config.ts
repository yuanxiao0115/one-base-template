import { parseRuntimeConfig, type RuntimeConfig } from '@one-base-template/core';
import {
  PlatformConfigLoadError,
  createRuntimeConfigLoader,
  type PlatformConfigLoadErrorCode
} from '@one-base-template/app-starter';

/**
 * 运行时配置加载入口（保留在 config 目录的特例文件）。
 *
 * 维护建议：
 * - 日常开发仅需关注 `public/platform-config.json`；
 * - 这里主要维护加载策略（超时、重试、快照兜底），非必要不要改。
 */

const CONFIG_URL = `${import.meta.env.BASE_URL}platform-config.json`;
const ENABLE_LOCAL_SNAPSHOT_FALLBACK =
  import.meta.env.VITE_ENABLE_PLATFORM_CONFIG_SNAPSHOT_FALLBACK === 'true';
const LOCAL_SNAPSHOT_KEY = `${import.meta.env.BASE_URL}platform-config:snapshot:v1`;

const runtimeConfigLoader = createRuntimeConfigLoader<RuntimeConfig>({
  configUrl: CONFIG_URL,
  parseConfig: parseRuntimeConfig,
  requestTimeoutMs: 8000,
  maxRetry: 1,
  enableLocalSnapshotFallback: ENABLE_LOCAL_SNAPSHOT_FALLBACK,
  localSnapshotKey: LOCAL_SNAPSHOT_KEY,
  onWarn(message) {
    console.warn(message);
  }
});

export { PlatformConfigLoadError };
export type { PlatformConfigLoadErrorCode };

export function isPlatformConfigLoadError(error: unknown): error is PlatformConfigLoadError {
  return runtimeConfigLoader.isLoadError(error);
}

export async function loadPlatformConfig(): Promise<RuntimeConfig> {
  return runtimeConfigLoader.loadConfig();
}

export function getPlatformConfig(): RuntimeConfig {
  return runtimeConfigLoader.getConfig();
}
