import type { LayoutMode, SystemSwitchStyle } from '@one-base-template/core';
import { getPlatformConfig } from '../config/platform-config';

export type BackendKind = 'default' | 'sczfw';
export type AuthMode = 'cookie' | 'token' | 'mixed';
export type MenuMode = 'remote' | 'static';

export type BuildEnv = {
  isProd: boolean;
  apiBaseUrl?: string;
  useMock: boolean;
  sczfwSystemPermissionCode?: string;
};

export type AppEnv = {
  isProd: boolean;
  apiBaseUrl?: string;
  backend: BackendKind;
  authMode: AuthMode;
  tokenKey: string;
  idTokenKey: string;
  menuMode: MenuMode;
  layoutMode: LayoutMode;
  systemSwitchStyle: SystemSwitchStyle;
  sczfwHeaders?: Record<string, string>;
  clientSignatureSecret?: string;
  clientSignatureClientId?: string;
  sczfwSystemPermissionCode?: string;
  defaultSystemCode?: string;
  systemHomeMap: Record<string, string>;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}

export function resolveSczfwHeaders(params: {
  backend: BackendKind;
  authorizationType: string;
  appsource: string;
  appcode: string;
}): Record<string, string> | undefined {
  const { backend, authorizationType, appsource, appcode } = params;
  if (backend !== 'sczfw') return undefined;

  // sczfw 老项目请求头约定（由 platform-config.json 提供）。
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

export function resolveSczfwSystemPermissionCode(): string | undefined {
  const raw = import.meta.env.VITE_SCZFW_SYSTEM_PERMISSION_CODE as unknown;
  return isNonEmptyString(raw) ? raw : undefined;
}

export function resolveUseMock(): boolean {
  const raw = import.meta.env.VITE_USE_MOCK as unknown;
  return raw === 'true';
}

export function resolveDefaultSystemCode(params: {
  backend: BackendKind;
  defaultSystemCode?: string;
}): string | undefined {
  const { backend, defaultSystemCode } = params;
  if (isNonEmptyString(defaultSystemCode)) return defaultSystemCode;
  if (backend !== 'sczfw') return undefined;
  // 与旧实现保持一致：sczfw 默认系统为 admin_server
  return 'admin_server';
}

export function resolveBuildEnv(): BuildEnv {
  const isProd = import.meta.env.PROD;
  const apiBaseUrl = resolveApiBaseUrl();
  const useMock = resolveUseMock();
  const sczfwSystemPermissionCode = resolveSczfwSystemPermissionCode();

  return {
    isProd,
    apiBaseUrl,
    useMock,
    sczfwSystemPermissionCode
  };
}

export function resolveAppEnv(params: { buildEnv: BuildEnv }): AppEnv {
  const { buildEnv } = params;
  const runtime = getPlatformConfig();

  const backend = runtime.backend;
  const authMode = runtime.authMode;
  const tokenKey = runtime.tokenKey;
  const idTokenKey = runtime.idTokenKey;
  const menuMode = runtime.menuMode;
  const layoutMode = runtime.layoutMode as LayoutMode;
  const systemSwitchStyle = runtime.systemSwitchStyle as SystemSwitchStyle;
  const sczfwHeaders = resolveSczfwHeaders({
    backend,
    authorizationType: runtime.authorizationType,
    appsource: runtime.appsource,
    appcode: runtime.appcode
  });
  const clientSignatureSecret = runtime.clientSignatureSecret;
  const clientSignatureClientId = runtime.clientSignatureClientId;
  const defaultSystemCode = resolveDefaultSystemCode({
    backend,
    defaultSystemCode: runtime.defaultSystemCode
  });
  const systemHomeMap = runtime.systemHomeMap;

  // 菜单根 permissionCode 改由 runtime defaultSystemCode 兜底，避免继续依赖业务 env。
  const sczfwSystemPermissionCode = defaultSystemCode;

  return {
    isProd: buildEnv.isProd,
    apiBaseUrl: buildEnv.apiBaseUrl,
    backend,
    authMode,
    tokenKey,
    idTokenKey,
    menuMode,
    layoutMode,
    systemSwitchStyle,
    sczfwHeaders,
    clientSignatureSecret,
    clientSignatureClientId,
    sczfwSystemPermissionCode,
    defaultSystemCode,
    systemHomeMap
  };
}

// 构建期 env 仅保留 Vite dev/proxy/mock 相关值；业务运行时配置统一来自 platform-config.json。
export const buildEnv: BuildEnv = resolveBuildEnv();

// 入口启动与页面逻辑都可能用到 env 聚合结果，集中在一个模块里避免重复实现。
export const appEnv: AppEnv = resolveAppEnv({ buildEnv });
