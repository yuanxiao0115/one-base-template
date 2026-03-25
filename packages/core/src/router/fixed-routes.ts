import type { RouteRecordRaw } from 'vue-router';

type RouteComponent = Exclude<RouteRecordRaw['component'], null | undefined>;

export interface PublicRouteDefinition {
  path: string;
  name: string;
  component: RouteComponent;
  meta?: RouteRecordRaw['meta'];
}

export interface BuildFixedRoutesOptions {
  rootPath: string;
  layoutComponent: RouteComponent;
  layoutRoutes: RouteRecordRaw[];
  defaultHomePath: string;
  publicRouteMeta: RouteRecordRaw['meta'];
  publicRoutes: PublicRouteDefinition[];
  layoutPublicRouteNames?: string[];
  notFoundCatchallPath: string;
  notFoundPath?: string;
  notFoundCatchallMeta?: RouteRecordRaw['meta'];
}

function createPublicRoute(
  route: PublicRouteDefinition,
  meta: RouteRecordRaw['meta']
): RouteRecordRaw {
  return {
    path: route.path,
    name: route.name,
    component: route.component,
    meta: {
      ...meta,
      ...route.meta
    }
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
    redirect: (to) => ({
      path: notFoundPath,
      query: {
        from: to.fullPath
      }
    }),
    meta
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

  throw new Error(
    '[core/router] buildFixedRoutes 缺少 notFoundPath，且 publicRoutes 中未找到 not-found/404 路由。'
  );
}

export function buildFixedRoutes(options: BuildFixedRoutesOptions): RouteRecordRaw[] {
  const {
    rootPath,
    layoutComponent,
    layoutRoutes,
    defaultHomePath,
    publicRouteMeta,
    publicRoutes,
    layoutPublicRouteNames,
    notFoundCatchallPath,
    notFoundPath,
    notFoundCatchallMeta
  } = options;
  const resolvedNotFoundPath = resolveNotFoundPath({
    publicRoutes,
    notFoundPath
  });
  const layoutPublicRouteNameSet = new Set(layoutPublicRouteNames ?? []);
  const layoutPublicRoutes: RouteRecordRaw[] = [];
  const standalonePublicRoutes: RouteRecordRaw[] = [];

  for (const route of publicRoutes) {
    const normalized = createPublicRoute(route, publicRouteMeta);
    if (layoutPublicRouteNameSet.has(route.name)) {
      layoutPublicRoutes.push(normalized);
      continue;
    }
    standalonePublicRoutes.push(normalized);
  }

  return [
    {
      path: rootPath,
      component: layoutComponent,
      redirect: () => defaultHomePath,
      children: [...layoutRoutes, ...layoutPublicRoutes]
    },
    ...standalonePublicRoutes,
    createNotFoundCatchallRoute({
      path: notFoundCatchallPath,
      notFoundPath: resolvedNotFoundPath,
      meta: notFoundCatchallMeta ?? publicRouteMeta
    })
  ];
}
