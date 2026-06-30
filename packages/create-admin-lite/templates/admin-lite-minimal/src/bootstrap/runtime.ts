import { getApp } from '@/config/app';
import type {
  AuthMode as PlatformAuthMode,
  BackendKind as PlatformBackendKind,
  EnabledModulesSetting,
  PlatformHistoryMode,
  PlatformMenuMode,
  RuntimeSystemConfig
} from '@one-base-template/core';

export type BackendKind = PlatformBackendKind;
export type AuthMode = PlatformAuthMode;
export type HistoryMode = PlatformHistoryMode;
export type MenuMode = PlatformMenuMode;

export interface BuildRuntime {
  isProd: boolean;
  baseUrl: string;
  apiBaseUrl?: string;
}

export interface Runtime {
  isProd: boolean;
  baseUrl: string;
  apiBaseUrl?: string;
  backend: BackendKind;
  authMode: AuthMode;
  historyMode: HistoryMode;
  tokenKey: string;
  idTokenKey: string;
  menuMode: MenuMode;
  systemConfig: RuntimeSystemConfig;
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
  return 'admin_server';
}

export function resolveBuildRuntime(): BuildRuntime {
  return {
    isProd: import.meta.env.PROD,
    baseUrl: import.meta.env.BASE_URL,
    apiBaseUrl: resolveApiBaseUrl()
  };
}

export function resolveRuntime(params: { buildEnv: BuildRuntime }): Runtime {
  const { buildEnv } = params;
  const appConfig = getApp();
  const defaultSystemCode = resolveDefaultSystemCode({
    backend: appConfig.backend,
    defaultSystemCode: appConfig.defaultSystemCode
  });

  return {
    isProd: buildEnv.isProd,
    baseUrl: buildEnv.baseUrl,
    apiBaseUrl: buildEnv.apiBaseUrl,
    backend: appConfig.backend,
    authMode: appConfig.authMode,
    historyMode: appConfig.historyMode,
    tokenKey: appConfig.tokenKey,
    idTokenKey: appConfig.idTokenKey,
    menuMode: appConfig.menuMode,
    systemConfig: appConfig.systemConfig,
    enabledModules: appConfig.enabledModules,
    basicHeaders: resolveBasicHeaders({
      backend: appConfig.backend,
      authorizationType: appConfig.authorizationType,
      appsource: appConfig.appsource,
      appcode: appConfig.appcode
    }),
    clientSignatureSalt: appConfig.clientSignatureSalt,
    clientSignatureClientId: appConfig.clientSignatureClientId,
    storageNamespace: appConfig.storageNamespace || appConfig.appcode,
    basicSystemPermissionCode: defaultSystemCode,
    defaultSystemCode,
    systemHomeMap: appConfig.systemHomeMap
  };
}

export const buildRuntime: BuildRuntime = resolveBuildRuntime();

let cachedRuntime: Runtime | null = null;

export function getRuntime(): Runtime {
  if (cachedRuntime) {
    return cachedRuntime;
  }

  cachedRuntime = resolveRuntime({ buildEnv: buildRuntime });
  return cachedRuntime;
}
