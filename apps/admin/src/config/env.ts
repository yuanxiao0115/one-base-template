import { getPlatformConfig } from '../config/platform-config';
import type {
  EnabledModulesSetting,
  AuthMode as PlatformAuthMode,
  BackendKind as PlatformBackendKind,
  PlatformMenuMode
} from '@one-base-template/core';

/**
 * 运行时环境聚合入口（保留在 config 目录的特例文件）。
 *
 * 维护建议：
 * - 日常开发一般无需修改；
 * - 若新增运行时字段，优先先改 `platform-config` 契约，再在这里做透传；
 * - 业务模块禁止直接读取 `import.meta.env`，统一通过 `getAppEnv()` 取值。
 */

export type BackendKind = PlatformBackendKind;
export type AuthMode = PlatformAuthMode;
export type MenuMode = PlatformMenuMode;

export interface BuildEnv {
  isProd: boolean;
  baseUrl: string;
  apiBaseUrl?: string;
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
  basicHeaders?: Record<string, string>;
  clientSignatureSalt?: string;
  clientSignatureClientId?: string;
  storageNamespace: string;
  basicSystemPermissionCode?: string;
  defaultSystemCode?: string;
  systemHomeMap: Record<string, string>;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}

export function resolveBasicHeaders(params: {
  backend: BackendKind;
  authorizationType: string;
  appsource: string;
  appcode: string;
}): Record<string, string> | undefined {
  const { backend, authorizationType, appsource, appcode } = params;
  if (backend !== 'basic') {
    return undefined;
  }

  // basic 老项目请求头约定（由 platform-config.json 提供）。
  return {
    'Authorization-Type': authorizationType,
    Appsource: appsource,
    Appcode: appcode
  };
}

export function resolveApiBaseUrl(): string | undefined {
  const raw = import.meta.env.VITE_API_BASE_URL as unknown;
  return isNonEmptyString(raw) ? raw : undefined;
}

export function resolveDefaultSystemCode(params: {
  backend: BackendKind;
  defaultSystemCode?: string;
}): string | undefined {
  const { backend, defaultSystemCode } = params;
  if (isNonEmptyString(defaultSystemCode)) {
    return defaultSystemCode;
  }
  if (backend !== 'basic') {
    return undefined;
  }
  // 与旧实现保持一致：basic 默认系统为 admin_server
  return 'admin_server';
}

export function resolveBuildEnv(): BuildEnv {
  const isProd = import.meta.env.PROD;
  const baseUrl = import.meta.env.BASE_URL;
  const apiBaseUrl = resolveApiBaseUrl();

  return {
    isProd,
    baseUrl,
    apiBaseUrl
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
  const basicHeaders = resolveBasicHeaders({
    backend,
    authorizationType: runtime.authorizationType,
    appsource: runtime.appsource,
    appcode: runtime.appcode
  });
  const { clientSignatureSalt } = runtime;
  const { clientSignatureClientId } = runtime;
  const storageNamespace = runtime.storageNamespace || runtime.appcode;
  const defaultSystemCode = resolveDefaultSystemCode({
    backend,
    defaultSystemCode: runtime.defaultSystemCode
  });
  const { systemHomeMap } = runtime;

  // 菜单根 permissionCode 改由 runtime defaultSystemCode 兜底，避免继续依赖业务 env。
  const basicSystemPermissionCode = defaultSystemCode;

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
    basicHeaders,
    clientSignatureSalt,
    clientSignatureClientId,
    storageNamespace,
    basicSystemPermissionCode,
    defaultSystemCode,
    systemHomeMap
  };
}

// 构建期 env 仅保留 Vite dev/proxy 相关值；业务运行时配置统一来自 platform-config.json。
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
