import type { MenuMode } from "../infra/env";

import type { BootstrapMode } from "./runtime";

const APP_ROOT_PATH = "/";
const APP_LOGIN_ROUTE_PATH = "/login";
const APP_SSO_ROUTE_PATH = "/sso";
const PUBLIC_BOOTSTRAP_PATHS = new Set<string>([APP_LOGIN_ROUTE_PATH, APP_SSO_ROUTE_PATH]);

function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim();
  if (!trimmed || trimmed === APP_ROOT_PATH) {
    return APP_ROOT_PATH;
  }

  const withLeadingSlash = trimmed.startsWith(APP_ROOT_PATH) ? trimmed : `${APP_ROOT_PATH}${trimmed}`;
  return withLeadingSlash.endsWith(APP_ROOT_PATH) ? withLeadingSlash.slice(0, -1) : withLeadingSlash;
}

function normalizePathname(pathname: string): string {
  if (!pathname) {
    return APP_ROOT_PATH;
  }

  const withLeadingSlash = pathname.startsWith(APP_ROOT_PATH) ? pathname : `${APP_ROOT_PATH}${pathname}`;
  const normalized = withLeadingSlash.replace(/\/{2,}/g, APP_ROOT_PATH);
  return normalized || APP_ROOT_PATH;
}

export function stripBaseUrl(pathname: string, baseUrl: string): string {
  const normalizedPathname = normalizePathname(pathname);
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  if (normalizedBaseUrl === APP_ROOT_PATH) {
    return normalizedPathname;
  }

  if (normalizedPathname === normalizedBaseUrl) {
    return APP_ROOT_PATH;
  }

  const baseUrlPrefix = `${normalizedBaseUrl}${APP_ROOT_PATH}`;
  if (normalizedPathname.startsWith(baseUrlPrefix)) {
    return normalizedPathname.slice(normalizedBaseUrl.length) || APP_ROOT_PATH;
  }

  return normalizedPathname;
}

export function resolveBootstrapMode(params: {
  pathname: string;
  baseUrl: string;
  menuMode: MenuMode;
}): BootstrapMode {
  if (params.menuMode !== "remote") {
    return "admin";
  }

  const appPath = stripBaseUrl(params.pathname, params.baseUrl);
  return PUBLIC_BOOTSTRAP_PATHS.has(appPath) ? "public" : "admin";
}
