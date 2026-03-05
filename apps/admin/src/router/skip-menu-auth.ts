import type { RouteRecordRaw } from 'vue-router';

export function toRouteNameKey (name: RouteRecordRaw['name']): string | null {
  if (typeof name === 'string') {
    return name;
  }
  if (typeof name === 'symbol') {
    return name.toString();
  }
  return null;
}

export function isSkipMenuAuthRoute (route: RouteRecordRaw): boolean {
  const meta = route.meta as Record<string, unknown> | undefined;
  return meta?.skipMenuAuth === true;
}

export function getSkipMenuAuthRouteName (route: RouteRecordRaw): string | null {
  if (!isSkipMenuAuthRoute(route)) {
    return null;
  }
  return toRouteNameKey(route.name);
}
