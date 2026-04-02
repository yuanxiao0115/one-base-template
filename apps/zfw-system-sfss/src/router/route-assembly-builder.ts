import type { RouteRecordRaw } from 'vue-router';
import {
  type AppModuleManifest,
  buildModuleAliasRoutes,
  buildModuleRoutes,
  createModuleRouteAssemblyValidator,
  type RouteAssemblyValidator,
  type RouteCollectContext,
  type RouteSource
} from '@one-base-template/core';
import { createAppLogger } from '@/utils/logger';
import { routePaths } from './constants';
import { reservedRouteNames, reservedRoutePaths } from './public-routes';

export type { RouteAssemblyValidator, RouteCollectContext, RouteSource };

export function createRouteAssemblyValidator(): RouteAssemblyValidator {
  const logger = createAppLogger('router/assemble');
  return createModuleRouteAssemblyValidator({
    reservedRoutePaths,
    reservedRouteNames,
    onWarn(message: string) {
      logger.warn(message);
    }
  });
}

export function buildRoutes(params: {
  modules: AppModuleManifest[];
  source: RouteSource;
  validator: RouteAssemblyValidator;
}): RouteRecordRaw[] {
  return buildModuleRoutes({
    modules: params.modules,
    source: params.source,
    validator: params.validator,
    rootPath: routePaths.root
  });
}

export function buildAliasRoutes(params: {
  modules: AppModuleManifest[];
  validator: RouteAssemblyValidator;
}): RouteRecordRaw[] {
  return buildModuleAliasRoutes({
    modules: params.modules,
    validator: params.validator,
    rootPath: routePaths.root
  });
}
