import { getPlatformConfig } from '@/config/platform-config';
import type {
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
}

export interface AppEnv {
  isProd: boolean;
  baseUrl: string;
  backend: BackendKind;
  authMode: AuthMode;
  tokenKey: string;
  idTokenKey: string;
  menuMode: MenuMode;
  storageNamespace: string;
  defaultSystemCode?: string;
  systemHomeMap: Record<string, string>;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}

export function resolveBuildEnv(): BuildEnv {
  return {
    isProd: import.meta.env.PROD,
    baseUrl: import.meta.env.BASE_URL
  };
}

export function resolveAppEnv(params: { buildEnv: BuildEnv }): AppEnv {
  const { buildEnv } = params;
  const runtime = getPlatformConfig();

  return {
    isProd: buildEnv.isProd,
    baseUrl: buildEnv.baseUrl,
    backend: runtime.backend,
    authMode: runtime.authMode,
    tokenKey: runtime.tokenKey,
    idTokenKey: runtime.idTokenKey,
    menuMode: runtime.menuMode,
    storageNamespace: isNonEmptyString(runtime.storageNamespace)
      ? runtime.storageNamespace
      : runtime.appcode,
    defaultSystemCode: runtime.defaultSystemCode,
    systemHomeMap: runtime.systemHomeMap
  };
}

export const buildEnv: BuildEnv = resolveBuildEnv();
export const appEnv: AppEnv = resolveAppEnv({ buildEnv });
