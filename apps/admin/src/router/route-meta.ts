type RouteMetaInput = Record<string, unknown>;

export function createAllowlistSkipMenuAuthMeta(meta: RouteMetaInput = {}): RouteMetaInput {
  return {
    ...meta,
    skipMenuAuth: true,
    skipMenuAuthLevel: "allowlist",
  };
}

export function createCompatAliasMeta(activePath?: string): RouteMetaInput {
  return {
    hideInMenu: true,
    hiddenTab: true,
    ...(activePath ? { activePath } : {}),
  };
}
