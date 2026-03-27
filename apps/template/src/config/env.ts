import { getPlatformConfig } from '../config/platform-config';
import type {
  EnabledModulesSetting,
  AuthMode as PlatformAuthMode,
  BackendKind as PlatformBackendKind,
  PlatformMenuMode
} from '@one-base-template/core';

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

export const buildEnv: BuildEnv = resolveBuildEnv();

let cachedAppEnv: AppEnv | null = null;

export function getAppEnv(): AppEnv {
  if (cachedAppEnv) {
    return cachedAppEnv;
  }

  cachedAppEnv = resolveAppEnv({ buildEnv });
  return cachedAppEnv;
}
