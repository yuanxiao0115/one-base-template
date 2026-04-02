import { getPlatformConfig } from '../config/platform-config';
import type {
  EnabledModulesSetting,
  AuthMode as PlatformAuthMode,
  BackendKind as PlatformBackendKind,
  PlatformHistoryMode,
  PlatformMenuMode
} from '@one-base-template/core';

/**
 * 应用环境聚合入口（构建期 env + 代码静态平台配置）。
 *
 * 维护建议：
 * - 日常开发一般无需修改；
 * - 若新增业务字段，优先先改 `platform-config.ts` 中的静态配置契约，再在这里做透传；
 * - 业务模块禁止直接读取 `import.meta.env`，统一通过 `getAppEnv()` 取值。
 */

export type BackendKind = PlatformBackendKind;
export type AuthMode = PlatformAuthMode;
export type HistoryMode = PlatformHistoryMode;
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
  historyMode: HistoryMode;
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

  // basic 老项目请求头约定（由代码静态平台配置提供）。
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
  const platformConfig = getPlatformConfig();

  const { backend } = platformConfig;
  const { authMode } = platformConfig;
  const { historyMode } = platformConfig;
  const { tokenKey } = platformConfig;
  const { idTokenKey } = platformConfig;
  const { menuMode } = platformConfig;
  const { enabledModules } = platformConfig;
  const basicHeaders = resolveBasicHeaders({
    backend,
    authorizationType: platformConfig.authorizationType,
    appsource: platformConfig.appsource,
    appcode: platformConfig.appcode
  });
  const { clientSignatureSalt } = platformConfig;
  const { clientSignatureClientId } = platformConfig;
  const storageNamespace = platformConfig.storageNamespace || platformConfig.appcode;
  const defaultSystemCode = resolveDefaultSystemCode({
    backend,
    defaultSystemCode: platformConfig.defaultSystemCode
  });
  const { systemHomeMap } = platformConfig;

  // 菜单根 permissionCode 改由 defaultSystemCode 兜底，避免继续依赖业务 env。
  const basicSystemPermissionCode = defaultSystemCode;

  return {
    isProd: buildEnv.isProd,
    baseUrl: buildEnv.baseUrl,
    apiBaseUrl: buildEnv.apiBaseUrl,
    backend,
    authMode,
    historyMode,
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

// 构建期 env 仅保留 Vite dev/proxy 相关值；业务平台配置统一来自代码静态配置。
export const buildEnv: BuildEnv = resolveBuildEnv();

let cachedAppEnv: AppEnv | null = null;

// AppEnv 采用按需懒加载并缓存，避免模块初始化时重复解析。
export function getAppEnv(): AppEnv {
  if (cachedAppEnv) {
    return cachedAppEnv;
  }

  cachedAppEnv = resolveAppEnv({ buildEnv });
  return cachedAppEnv;
}
