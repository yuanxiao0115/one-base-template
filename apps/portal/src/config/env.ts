import { getPlatformConfig } from '@/config/platform-config';
import type {
  AuthMode as PlatformAuthMode,
  BackendKind as PlatformBackendKind,
  PlatformHistoryMode,
  PlatformMenuMode
} from '@one-base-template/core';

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

function resolveApiBaseUrl(): string | undefined {
  const raw = import.meta.env.VITE_API_BASE_URL as unknown;
  return isNonEmptyString(raw) ? raw : undefined;
}

function resolveBasicHeaders(params: {
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

function resolveDefaultSystemCode(params: {
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

export function resolveBuildEnv(): BuildEnv {
  return {
    isProd: import.meta.env.PROD,
    baseUrl: import.meta.env.BASE_URL,
    apiBaseUrl: resolveApiBaseUrl()
  };
}

export function resolveAppEnv(params: { buildEnv: BuildEnv }): AppEnv {
  const { buildEnv } = params;
  const runtime = getPlatformConfig();

  const defaultSystemCode = resolveDefaultSystemCode({
    backend: runtime.backend,
    defaultSystemCode: runtime.defaultSystemCode
  });

  return {
    isProd: buildEnv.isProd,
    baseUrl: buildEnv.baseUrl,
    apiBaseUrl: buildEnv.apiBaseUrl,
    backend: runtime.backend,
    authMode: runtime.authMode,
    historyMode: runtime.historyMode,
    tokenKey: runtime.tokenKey,
    idTokenKey: runtime.idTokenKey,
    menuMode: runtime.menuMode,
    basicHeaders: resolveBasicHeaders({
      backend: runtime.backend,
      authorizationType: runtime.authorizationType,
      appsource: runtime.appsource,
      appcode: runtime.appcode
    }),
    clientSignatureSalt: runtime.clientSignatureSalt,
    clientSignatureClientId: runtime.clientSignatureClientId,
    storageNamespace: isNonEmptyString(runtime.storageNamespace)
      ? runtime.storageNamespace
      : runtime.appcode,
    basicSystemPermissionCode: defaultSystemCode,
    defaultSystemCode,
    systemHomeMap: runtime.systemHomeMap
  };
}

export const buildEnv: BuildEnv = resolveBuildEnv();
export const appEnv: AppEnv = resolveAppEnv({ buildEnv });
