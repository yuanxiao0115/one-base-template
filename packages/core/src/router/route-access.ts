import type { RouteMeta } from 'vue-router';

export type RouteAccess = 'open' | 'auth' | 'menu';

export function isRouteAccess(value: unknown): value is RouteAccess {
  return value === 'open' || value === 'auth' || value === 'menu';
}

export function getRouteAccess(
  meta: RouteMeta | undefined,
  defaultAccess: RouteAccess = 'menu'
): RouteAccess {
  return isRouteAccess(meta?.access) ? meta.access : defaultAccess;
}
