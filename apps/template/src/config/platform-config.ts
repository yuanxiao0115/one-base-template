import { parseRuntimeConfig, type RuntimeConfig } from '@one-base-template/core';
import {
  PlatformConfigLoadError,
  createRuntimeConfigLoader,
  type PlatformConfigLoadErrorCode,
} from '@one-base-template/app-starter';

const CONFIG_URL = `${import.meta.env.BASE_URL}platform-config.json`;

const runtimeConfigLoader = createRuntimeConfigLoader<RuntimeConfig>({
  configUrl: CONFIG_URL,
  parseConfig: parseRuntimeConfig,
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
