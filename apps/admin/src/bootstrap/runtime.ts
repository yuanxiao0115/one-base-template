import type { Router } from "vue-router";

export type BootstrapMode = "admin" | "public";
const APP_ROOT_PATH = "/";

export type AuthNavigationTarget =
  | {
      type: "reload";
      href: string;
    }
  | {
      type: "router";
      target: string;
    };

let currentBootstrapMode: BootstrapMode = "admin";

function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim();
  if (!trimmed || trimmed === APP_ROOT_PATH) {
    return APP_ROOT_PATH;
  }

  const withLeadingSlash = trimmed.startsWith(APP_ROOT_PATH) ? trimmed : `${APP_ROOT_PATH}${trimmed}`;
  return withLeadingSlash.endsWith(APP_ROOT_PATH) ? withLeadingSlash.slice(0, -1) : withLeadingSlash;
}

function normalizeTarget(target: string): string {
  if (!target) {
    return APP_ROOT_PATH;
  }

  return target.startsWith(APP_ROOT_PATH) ? target : `${APP_ROOT_PATH}${target}`;
}

export function setBootstrapMode(mode: BootstrapMode) {
  currentBootstrapMode = mode;
}

export function getBootstrapMode(): BootstrapMode {
  return currentBootstrapMode;
}

export function resolveAppHref(target: string, baseUrl: string): string {
  const normalizedTarget = normalizeTarget(target);
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  if (normalizedBaseUrl === APP_ROOT_PATH) {
    return normalizedTarget;
  }

  if (normalizedTarget === normalizedBaseUrl || normalizedTarget.startsWith(`${normalizedBaseUrl}${APP_ROOT_PATH}`)) {
    return normalizedTarget;
  }

  if (normalizedTarget === APP_ROOT_PATH) {
    return `${normalizedBaseUrl}${APP_ROOT_PATH}`;
  }

  return `${normalizedBaseUrl}${normalizedTarget}`;
}

export function resolveAuthNavigationTarget(params: {
  mode: BootstrapMode;
  target: string;
  baseUrl: string;
}): AuthNavigationTarget {
  if (params.mode === "public") {
    return {
      type: "reload",
      href: resolveAppHref(params.target, params.baseUrl),
    };
  }

  return {
    type: "router",
    target: params.target,
  };
}

export async function navigateAfterAuth(params: {
  router: Pick<Router, "replace">;
  target: string;
  baseUrl: string;
  locationReplace?: (href: string) => void;
}) {
  const target = resolveAuthNavigationTarget({
    mode: getBootstrapMode(),
    target: params.target,
    baseUrl: params.baseUrl,
  });

  if (target.type === "reload") {
    const locationReplace = params.locationReplace ?? ((href: string) => window.location.replace(href));
    locationReplace(target.href);
    return;
  }

  await params.router.replace(target.target);
}
