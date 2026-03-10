import type { PublicRouteDefinition } from "@one-base-template/core";
import { ForbiddenPage, NotFoundPage } from "@one-base-template/ui/shell";
import { routePaths } from "./constants";

export const publicRoutes: PublicRouteDefinition[] = [
  {
    path: routePaths.login,
    name: "login",
    component: async () => import("../pages/login/LoginPage.vue"),
  },
  {
    path: routePaths.sso,
    name: "sso",
    component: async () => import("../pages/sso/SsoCallbackPage.vue"),
  },
  {
    path: routePaths.forbidden,
    name: "forbidden",
    component: ForbiddenPage,
  },
  {
    path: routePaths.notFound,
    name: "not-found",
    component: NotFoundPage,
  },
];

export const guardPublicRoutePaths = publicRoutes.map((item) => item.path);

export const reservedRoutePaths = new Set<string>([routePaths.root, routePaths.catchall, ...publicRoutes.map((item) => item.path)]);

export const reservedRouteNames = new Set<string>(publicRoutes.map((item) => item.name));
