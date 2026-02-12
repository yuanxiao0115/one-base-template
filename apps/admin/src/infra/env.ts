import type { LayoutMode } from '@one-base-template/core';

export type BackendKind = 'default' | 'sczfw';
export type AuthMode = 'cookie' | 'token' | 'mixed';
export type MenuMode = 'remote' | 'static';

export type AppEnv = {
  isProd: boolean;
  apiBaseUrl?: string;
  backend: BackendKind;
  authMode: AuthMode;
  tokenKey: string;
  idTokenKey: string;
  menuMode: MenuMode;
  layoutMode: LayoutMode;
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

export function resolveBackendKind(): BackendKind {
  const raw = import.meta.env.VITE_BACKEND as unknown;
  if (raw === 'sczfw' || raw === 'default') return raw;

  // 默认策略：配置了真实后端地址 -> 使用 sczfw 适配器；否则保持模板默认（mock + /api）
  const apiBaseUrl = resolveApiBaseUrl();
  return isNonEmptyString(apiBaseUrl) ? 'sczfw' : 'default';
}

export function resolveAuthMode(backend: BackendKind): AuthMode {
  const raw = import.meta.env.VITE_AUTH_MODE as unknown;
  if (raw === 'cookie' || raw === 'token' || raw === 'mixed') return raw;
  return backend === 'sczfw' ? 'token' : 'cookie';
}

export function resolveTokenKey(backend: BackendKind): string {
  const raw = import.meta.env.VITE_TOKEN_KEY as unknown;
  if (isNonEmptyString(raw)) return raw;
  // 兼容老项目：默认 token 存储键名为 token
  return backend === 'sczfw' ? 'token' : 'ob_token';
}

export function resolveIdTokenKey(): string {
  const raw = import.meta.env.VITE_ID_TOKEN_KEY as unknown;
  return isNonEmptyString(raw) ? raw : 'idToken';
}

export function resolveSczfwHeaders(backend: BackendKind): Record<string, string> | undefined {
  if (backend !== 'sczfw') return undefined;

  const authorizationType = import.meta.env.VITE_AUTHORIZATION_TYPE as unknown;
  const appsource = import.meta.env.VITE_APPSOURCE as unknown;
  const appcode = import.meta.env.VITE_APPCODE as unknown;

  // sczfw 老项目请求头约定（可用 env 覆盖）
  return {
    'Authorization-Type': isNonEmptyString(authorizationType) ? authorizationType : 'ADMIN',
    Appsource: isNonEmptyString(appsource) ? appsource : 'frame',
    Appcode: isNonEmptyString(appcode) ? appcode : 'od'
  };
}

export function resolveApiBaseUrl(): string | undefined {
  const raw = import.meta.env.VITE_API_BASE_URL as unknown;
  return isNonEmptyString(raw) ? raw : undefined;
}

export function resolveClientSignatureSecret(): string | undefined {
  const raw = import.meta.env.VITE_CLIENT_SIGNATURE_SECRET as unknown;
  return isNonEmptyString(raw) ? raw : undefined;
}

export function resolveClientSignatureClientId(): string | undefined {
  const raw = import.meta.env.VITE_CLIENT_SIGNATURE_CLIENT_ID as unknown;
  return isNonEmptyString(raw) ? raw : undefined;
}

export function resolveSczfwSystemPermissionCode(): string | undefined {
  const raw = import.meta.env.VITE_SCZFW_SYSTEM_PERMISSION_CODE as unknown;
  return isNonEmptyString(raw) ? raw : undefined;
}

export function resolveMenuMode(): MenuMode {
  const raw = import.meta.env.VITE_MENU_MODE as unknown;
  return raw === 'static' || raw === 'remote' ? raw : 'remote';
}

export function resolveLayoutMode(raw: unknown): LayoutMode {
  return raw === 'top' || raw === 'top-side' || raw === 'side' ? raw : 'side';
}

export function parseSystemHomeMap(raw: unknown): Record<string, string> {
  if (typeof raw !== 'string' || !raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === 'string' && v.startsWith('/')) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export function resolveSystemHomeMap(): Record<string, string> {
  return parseSystemHomeMap(import.meta.env.VITE_SYSTEM_HOME_MAP);
}

export function resolveDefaultSystemCode(backend: BackendKind): string | undefined {
  const raw = import.meta.env.VITE_DEFAULT_SYSTEM_CODE as unknown;
  if (isNonEmptyString(raw)) return raw;
  if (backend !== 'sczfw') return undefined;
  return resolveSczfwSystemPermissionCode();
}

export function resolveAppEnv(): AppEnv {
  const isProd = import.meta.env.PROD;
  const apiBaseUrl = resolveApiBaseUrl();
  const backend = resolveBackendKind();
  const authMode = resolveAuthMode(backend);
  const tokenKey = resolveTokenKey(backend);
  const idTokenKey = resolveIdTokenKey();
  const menuMode = resolveMenuMode();
  const layoutMode = resolveLayoutMode(import.meta.env.VITE_LAYOUT_MODE);
  const sczfwHeaders = resolveSczfwHeaders(backend);
  const clientSignatureSecret = resolveClientSignatureSecret();
  const clientSignatureClientId = resolveClientSignatureClientId();
  const sczfwSystemPermissionCode = resolveSczfwSystemPermissionCode();
  const defaultSystemCode = resolveDefaultSystemCode(backend);
  const systemHomeMap = resolveSystemHomeMap();

  return {
    isProd,
    apiBaseUrl,
    backend,
    authMode,
    tokenKey,
    idTokenKey,
    menuMode,
    layoutMode,
    sczfwHeaders,
    clientSignatureSecret,
    clientSignatureClientId,
    sczfwSystemPermissionCode,
    defaultSystemCode,
    systemHomeMap
  };
}

// 入口启动与页面逻辑都可能用到 env 解析结果，集中在一个模块里避免重复实现。
export const appEnv: AppEnv = resolveAppEnv();
