import { getPlatformConfig } from "../config/platform-config";
import type {
  EnabledModulesSetting,
  AuthMode as PlatformAuthMode,
  BackendKind as PlatformBackendKind,
  PlatformMenuMode,
} from "@one-base-template/core";

export type BackendKind = PlatformBackendKind;
export type AuthMode = PlatformAuthMode;
export type MenuMode = PlatformMenuMode;

export interface BuildEnv {
  isProd: boolean;
  baseUrl: string;
  apiBaseUrl?: string;
  useMock: boolean;
  sczfwSystemPermissionCode?: string;
}

export interface AppEnv {
  isProd: boolean;
  baseUrl: string;
  apiBaseUrl?: string;
  backend: BackendKind;
  authMode: AuthMode;
  tokenKey: string;
  idTokenKey: string;
  menuMode: MenuMode;
  enabledModules: EnabledModulesSetting;
  skipMenuAuthProductionAllowList: string[];
  sczfwHeaders?: Record<string, string>;
  clientSignatureSalt?: string;
  clientSignatureClientId?: string;
  storageNamespace: string;
  sczfwSystemPermissionCode?: string;
  defaultSystemCode?: string;
  systemHomeMap: Record<string, string>;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}

export function resolveSczfwHeaders(params: {
  backend: BackendKind;
  authorizationType: string;
  appsource: string;
  appcode: string;
}): Record<string, string> | undefined {
  const { backend, authorizationType, appsource, appcode } = params;
  if (backend !== "sczfw") {
    return undefined;
  }

  // sczfw 老项目请求头约定（由 platform-config.json 提供）。
  return {
    "Authorization-Type": authorizationType,
    Appsource: appsource,
    Appcode: appcode,
  };
}

export function resolveApiBaseUrl(): string | undefined {
  const raw = import.meta.env.VITE_API_BASE_URL as unknown;
  return isNonEmptyString(raw) ? raw : undefined;
}

export function resolveSczfwSystemPermissionCode(): string | undefined {
  const raw = import.meta.env.VITE_SCZFW_SYSTEM_PERMISSION_CODE as unknown;
  return isNonEmptyString(raw) ? raw : undefined;
}

export function resolveUseMock(): boolean {
  const raw = import.meta.env.VITE_USE_MOCK as unknown;
  return raw === "true";
}

export function resolveDefaultSystemCode(params: {
  backend: BackendKind;
  defaultSystemCode?: string;
}): string | undefined {
  const { backend, defaultSystemCode } = params;
  if (isNonEmptyString(defaultSystemCode)) {
    return defaultSystemCode;
  }
  if (backend !== "sczfw") {
    return undefined;
  }
  // 与旧实现保持一致：sczfw 默认系统为 admin_server
  return "admin_server";
}

export function resolveBuildEnv(): BuildEnv {
  const isProd = import.meta.env.PROD;
  const baseUrl = import.meta.env.BASE_URL;
  const apiBaseUrl = resolveApiBaseUrl();
  const useMock = resolveUseMock();
  const sczfwSystemPermissionCode = resolveSczfwSystemPermissionCode();

  return {
    isProd,
    baseUrl,
    apiBaseUrl,
    useMock,
    sczfwSystemPermissionCode,
  };
}

export function resolveAppEnv(params: { buildEnv: BuildEnv }): AppEnv {
  const { buildEnv } = params;
  const runtime = getPlatformConfig();

  const { backend } = runtime;
  const { authMode } = runtime;
  const { tokenKey } = runtime;
  const { idTokenKey } = runtime;
  const { menuMode } = runtime;
  const { enabledModules } = runtime;
  const skipMenuAuthProductionAllowList = runtime.skipMenuAuthProductionAllowList ?? [];
  const sczfwHeaders = resolveSczfwHeaders({
    backend,
    authorizationType: runtime.authorizationType,
    appsource: runtime.appsource,
    appcode: runtime.appcode,
  });
  const { clientSignatureSalt } = runtime;
  const { clientSignatureClientId } = runtime;
  const storageNamespace = runtime.storageNamespace || runtime.appcode;
  const defaultSystemCode = resolveDefaultSystemCode({
    backend,
    defaultSystemCode: runtime.defaultSystemCode,
  });
  const { systemHomeMap } = runtime;

  // 菜单根 permissionCode 改由 runtime defaultSystemCode 兜底，避免继续依赖业务 env。
  const sczfwSystemPermissionCode = defaultSystemCode;

  return {
    isProd: buildEnv.isProd,
    baseUrl: buildEnv.baseUrl,
    apiBaseUrl: buildEnv.apiBaseUrl,
    backend,
    authMode,
    tokenKey,
    idTokenKey,
    menuMode,
    enabledModules,
    skipMenuAuthProductionAllowList,
    sczfwHeaders,
    clientSignatureSalt,
    clientSignatureClientId,
    storageNamespace,
    sczfwSystemPermissionCode,
    defaultSystemCode,
    systemHomeMap,
  };
}

// 构建期 env 仅保留 Vite dev/proxy/mock 相关值；业务运行时配置统一来自 platform-config.json。
export const buildEnv: BuildEnv = resolveBuildEnv();

let cachedAppEnv: AppEnv | null = null;

// 运行时配置必须在 loadPlatformConfig() 完成后才能安全读取，这里改为按需懒加载并缓存。
export function getAppEnv(): AppEnv {
  if (cachedAppEnv) {
    return cachedAppEnv;
  }

  cachedAppEnv = resolveAppEnv({ buildEnv });
  return cachedAppEnv;
}
