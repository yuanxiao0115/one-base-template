import type { RouteRecordRaw } from 'vue-router';

type RouteComponent = Exclude<RouteRecordRaw['component'], null | undefined>;

export interface PublicRouteDefinition {
  path: string;
  name: string;
  component: RouteComponent;
}

export interface BuildFixedRoutesOptions {
  rootPath: string;
  layoutComponent: RouteComponent;
  layoutRoutes: RouteRecordRaw[];
  defaultHomePath: string;
  publicRouteMeta: RouteRecordRaw['meta'];
  publicRoutes: PublicRouteDefinition[];
  notFoundCatchallPath: string;
  notFoundPath?: string;
}

function createPublicRoute(route: PublicRouteDefinition, meta: RouteRecordRaw['meta']): RouteRecordRaw {
  return {
    path: route.path,
    name: route.name,
    component: route.component,
    meta,
  };
}

function createNotFoundCatchallRoute(params: {
  path: string;
  notFoundPath: string;
  meta: RouteRecordRaw['meta'];
}): RouteRecordRaw {
  const { path, notFoundPath, meta } = params;

  return {
    path,
    redirect: () => ({
      path: notFoundPath,
      replace: true,
    }),
    meta,
  };
}

function resolveNotFoundPath(params: {
  publicRoutes: PublicRouteDefinition[];
  notFoundPath?: string;
}): string {
  const { publicRoutes, notFoundPath } = params;
  if (notFoundPath) {
    return notFoundPath;
  }

  const namedNotFound = publicRoutes.find((item) => item.name === 'not-found');
  if (namedNotFound) {
    return namedNotFound.path;
  }

  const pathNotFound = publicRoutes.find((item) => item.path === '/404');
  if (pathNotFound) {
    return pathNotFound.path;
  }

  throw new Error('[core/router] buildFixedRoutes 缺少 notFoundPath，且 publicRoutes 中未找到 not-found/404 路由。');
}

export function buildFixedRoutes(options: BuildFixedRoutesOptions): RouteRecordRaw[] {
  const {
    rootPath,
    layoutComponent,
    layoutRoutes,
    defaultHomePath,
    publicRouteMeta,
    publicRoutes,
    notFoundCatchallPath,
    notFoundPath,
  } = options;
  const resolvedNotFoundPath = resolveNotFoundPath({
    publicRoutes,
    notFoundPath,
  });

  return [
    {
      path: rootPath,
      component: layoutComponent,
      redirect: () => defaultHomePath,
      children: layoutRoutes,
    },
    ...publicRoutes.map((route) => createPublicRoute(route, publicRouteMeta)),
    createNotFoundCatchallRoute({
      path: notFoundCatchallPath,
      notFoundPath: resolvedNotFoundPath,
      meta: publicRouteMeta,
    }),
  ];
}
