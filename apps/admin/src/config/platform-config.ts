import { parseRuntimeConfig, type RuntimeConfig } from '@one-base-template/core';

const CONFIG_URL = `${import.meta.env.BASE_URL}platform-config.json`;

let cachedConfig: RuntimeConfig | null = null;

export async function loadPlatformConfig(): Promise<RuntimeConfig> {
  if (cachedConfig) return cachedConfig;

  const response = await fetch(CONFIG_URL, {
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error(`[platform-config] 加载失败：${response.status} ${response.statusText}`);
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误';
    throw new Error(`[platform-config] 解析 JSON 失败：${message}`);
  }

  cachedConfig = parseRuntimeConfig(json);
  return cachedConfig;
}

export function getPlatformConfig(): RuntimeConfig {
  if (!cachedConfig) {
    throw new Error('[platform-config] 尚未加载，请先调用 loadPlatformConfig()');
  }
  return cachedConfig;
}
