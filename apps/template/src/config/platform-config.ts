import { parseRuntimeConfig, type RuntimeConfig } from "@one-base-template/core";

const CONFIG_URL = `${import.meta.env.BASE_URL}platform-config.json`;

export type PlatformConfigLoadErrorCode = "REQUEST_FAILED" | "PARSE_FAILED" | "VALIDATION_FAILED";

export class PlatformConfigLoadError extends Error {
  readonly code: PlatformConfigLoadErrorCode;

  constructor(code: PlatformConfigLoadErrorCode, message: string) {
    super(message);
    this.name = "PlatformConfigLoadError";
    this.code = code;
  }
}

let cachedConfig: RuntimeConfig | null = null;
let loadingPromise: Promise<RuntimeConfig> | null = null;

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "未知错误";
}

function normalizeLoadError(error: unknown): PlatformConfigLoadError {
  if (error instanceof PlatformConfigLoadError) {
    return error;
  }

  const message = toErrorMessage(error);
  if (message.includes("[platform-config] 校验失败")) {
    return new PlatformConfigLoadError("VALIDATION_FAILED", message);
  }

  return new PlatformConfigLoadError("PARSE_FAILED", `[platform-config] 解析失败：${message}`);
}

export function isPlatformConfigLoadError(error: unknown): error is PlatformConfigLoadError {
  return error instanceof PlatformConfigLoadError;
}

export async function loadPlatformConfig(): Promise<RuntimeConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }
  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    try {
      const response = await fetch(CONFIG_URL, { cache: "no-store" });
      if (!response.ok) {
        throw new PlatformConfigLoadError(
          "REQUEST_FAILED",
          `[platform-config] 加载失败：${response.status} ${response.statusText}`
        );
      }

      let json: unknown;
      try {
        json = await response.json();
      } catch (error) {
        throw new PlatformConfigLoadError("PARSE_FAILED", `[platform-config] JSON 解析失败：${toErrorMessage(error)}`);
      }

      cachedConfig = parseRuntimeConfig(json);
      return cachedConfig;
    } catch (error) {
      throw normalizeLoadError(error);
    }
  })().finally(() => {
    loadingPromise = null;
  });

  return loadingPromise;
}

export function getPlatformConfig(): RuntimeConfig {
  if (!cachedConfig) {
    throw new Error("[platform-config] 尚未加载，请先调用 loadPlatformConfig()");
  }
  return cachedConfig;
}
