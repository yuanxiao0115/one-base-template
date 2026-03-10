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

/**
 * 在 safeRedirect 的基础上，额外处理子路径部署（baseUrl）场景：
 * - 拦截外链/协议跳转
 * - 剥离 baseUrl 前缀
 * - 保留 query/hash
 */
export function resolveAppRedirectTarget(
  raw: unknown,
  options: {
    fallback: string;
    baseUrl: string;
  }
): string {
  const target = safeRedirect(raw, options.fallback);
  const basePath = normalizeBasePath(options.baseUrl);
  return stripBasePath(target, basePath);
}
