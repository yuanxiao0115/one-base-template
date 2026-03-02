import type { Router } from 'vue-router';
import { setupRouterGuards } from '@one-base-template/core';

import {
  APP_FORBIDDEN_ROUTE_PATH,
  APP_GUARD_PUBLIC_ROUTE_PATHS,
  APP_LOGIN_ROUTE_PATH
} from '../router/constants';

export function installAppRouterGuards(params: {
  router: Router;
  skipMenuAuthRouteNames: string[];
  onNavigationStart: () => void | Promise<void>;
}) {
  const { router, skipMenuAuthRouteNames, onNavigationStart } = params;

  setupRouterGuards(router, {
    publicRoutePaths: [...APP_GUARD_PUBLIC_ROUTE_PATHS],
    loginRoutePath: APP_LOGIN_ROUTE_PATH,
    forbiddenRoutePath: APP_FORBIDDEN_ROUTE_PATH,
    // 路由白名单由“已装配路由 + meta.skipMenuAuth”自动生成，避免手工常量与模块启停漂移。
    allowedSkipMenuAuthRouteNames: skipMenuAuthRouteNames,
    onNavigationStart
  });
}
