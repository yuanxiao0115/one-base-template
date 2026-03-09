import { safeRedirect } from "@one-base-template/core";

function normalizeBasePath(baseUrl: string): string {
  if (!baseUrl || baseUrl === "/") {
    return "";
  }

  const trimmed = baseUrl.trim();
  if (!trimmed || trimmed === "/") {
    return "";
  }

  const normalized = trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function joinPath(pathname: string, search: string, hash: string): string {
  const safePathname = pathname || "/";
  return `${safePathname}${search}${hash}`;
}

function stripBasePath(path: string, basePath: string): string {
  if (!basePath) {
    return path;
  }

  const url = new URL(path, "https://one-base-template.local");

  if (url.pathname === basePath) {
    return joinPath("/", url.search, url.hash);
  }

  const basePrefix = `${basePath}/`;
  if (url.pathname.startsWith(basePrefix)) {
    return joinPath(url.pathname.slice(basePath.length), url.search, url.hash);
  }

  return joinPath(url.pathname, url.search, url.hash);
}

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
