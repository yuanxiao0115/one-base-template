import type { Router } from "vue-router";
import { setupRouterGuards } from "@one-base-template/core";

import { routePaths } from "../router/constants";
import { guardPublicRoutePaths } from "../router/public-routes";

export function installAppRouterGuards(params: {
  router: Router;
  skipMenuAuthRouteNames: string[];
  onNavigationStart: () => Promise<void> | void;
}) {
  const { router, skipMenuAuthRouteNames, onNavigationStart } = params;

  setupRouterGuards(router, {
    publicRoutePaths: [...guardPublicRoutePaths],
    loginRoutePath: routePaths.login,
    forbiddenRoutePath: routePaths.forbidden,
    // 路由白名单由“已装配路由 + meta.skipMenuAuth”自动生成，避免手工常量与模块启停漂移。
    allowedSkipMenuAuthRouteNames: skipMenuAuthRouteNames,
    onNavigationStart,
  });
}
