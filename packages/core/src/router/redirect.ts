import type {
  LocationQuery,
  LocationQueryValue,
  RouteLocationNormalized,
  RouteLocationRaw
} from 'vue-router';
import { safeRedirect } from '../auth/flow';

function normalizeBasePath(baseUrl: string): string {
  if (!baseUrl || baseUrl === '/') {
    return '';
  }

  const trimmed = baseUrl.trim();
  if (!trimmed || trimmed === '/') {
    return '';
  }

  const normalized = trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

function buildPath(pathname: string, search: string, hash: string): string {
  const safePathname = pathname || '/';
  return `${safePathname}${search}${hash}`;
}

function stripBasePath(path: string, basePath: string): string {
  if (!basePath) {
    return path;
  }

  const url = new URL(path, 'https://one-base-template.local');

  if (url.pathname === basePath) {
    return buildPath('/', url.search, url.hash);
  }

  const basePrefix = `${basePath}/`;
  if (url.pathname.startsWith(basePrefix)) {
    return buildPath(url.pathname.slice(basePath.length), url.search, url.hash);
  }

  return buildPath(url.pathname, url.search, url.hash);
}

function getQueryStringValue(
  value: LocationQueryValue | LocationQueryValue[] | undefined
): string | null {
  const list = Array.isArray(value) ? value : [value];
  for (const item of list) {
    if (typeof item !== 'string') {
      continue;
    }
    const normalized = item.trim();
    if (normalized) {
      return normalized;
    }
  }
  return null;
}

function getSearchParamStringValue(
  searchParams: Pick<URLSearchParams, 'get'>,
  key: string
): string | null {
  const value = searchParams.get(key);
  if (!value) {
    return null;
  }
  const normalized = value.trim();
  return normalized || null;
}

export interface ResolveAppRedirectTargetOptions {
  fallback: string;
  baseUrl: string;
}

export function readAuthRedirectRawFromQuery(query: LocationQuery): string | null {
  return getQueryStringValue(query.redirect) ?? getQueryStringValue(query.redirectUrl);
}

export function readAuthRedirectRawFromSearchParams(
  searchParams: Pick<URLSearchParams, 'get'>
): string | null {
  return (
    getSearchParamStringValue(searchParams, 'redirect') ??
    getSearchParamStringValue(searchParams, 'redirectUrl')
  );
}

export function resolveAuthRedirectTargetFromQuery(
  query: LocationQuery,
  options: ResolveAppRedirectTargetOptions
): string {
  return resolveAppRedirectTarget(readAuthRedirectRawFromQuery(query), options);
}

export function resolveAuthRedirectTargetFromSearchParams(
  searchParams: Pick<URLSearchParams, 'get'>,
  options: ResolveAppRedirectTargetOptions
): string {
  return resolveAppRedirectTarget(readAuthRedirectRawFromSearchParams(searchParams), options);
}

/**
 * 在 safeRedirect 的基础上，额外处理子路径部署（baseUrl）场景：
 * - 拦截外链/协议跳转
 * - 剥离 baseUrl 前缀
 * - 保留 query/hash
 */
export function resolveAppRedirectTarget(
  raw: unknown,
  options: ResolveAppRedirectTargetOptions
): string {
  const target = safeRedirect(raw, options.fallback);
  const basePath = normalizeBasePath(options.baseUrl);
  return stripBasePath(target, basePath);
}

export function buildLoginRedirectLocation(params: {
  to: Pick<RouteLocationNormalized, 'fullPath'>;
  loginRoutePath: string;
}): RouteLocationRaw {
  return {
    path: params.loginRoutePath,
    query: {
      redirect: params.to.fullPath
    }
  };
}
