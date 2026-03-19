import type { RouteRecordRaw } from 'vue-router';
import {
  type EnabledModulesSetting,
  buildFixedRoutes,
  getInitialPath
} from '@one-base-template/core';
import { AdminLayout } from '@one-base-template/ui/shell';
import { DEFAULT_FALLBACK_HOME } from '../config/systems';
import {
  buildAliasRoutes,
  buildRoutes,
  createRouteAssemblyValidator
} from './route-assembly-builder';
import { publicRoutes } from './public-routes';

import { getEnabledModules } from './registry';
import { routePaths } from './constants';

const PUBLIC_ROUTE_META = Object.freeze({
  public: true,
  hiddenTab: true
});
type RouteAssemblyArtifacts = {
  standaloneRoutes: RouteRecordRaw[];
  aliasRoutes: RouteRecordRaw[];
  layoutRoutes: RouteRecordRaw[];
};

export interface AppRouteAssemblyResult {
  routes: RouteRecordRaw[];
  skipMenuAuthRouteNames: string[];
}

export interface AppRouteAssemblyOptions {
  enabledModules: EnabledModulesSetting;
  defaultSystemCode?: string;
  systemHomeMap: Record<string, string>;
  storageNamespace: string;
}

function getDefaultHomePath(
  options: Pick<AppRouteAssemblyOptions, 'defaultSystemCode' | 'systemHomeMap' | 'storageNamespace'>
): string {
  const { defaultSystemCode, systemHomeMap, storageNamespace } = options;
  return getInitialPath({
    defaultSystemCode,
    systemHomeMap,
    storageNamespace,
    fallbackHome: DEFAULT_FALLBACK_HOME
  });
}

/**
 * 模块路由分三组收集：
 * 1) standalone：不走 AdminLayout 的顶层路由（例如全屏页面）
 * 2) compatAlias：历史路径别名（redirect）
 * 3) layout：挂在 AdminLayout 下的业务路由
 */
function collectModuleRoutes(params: {
  modules: Awaited<ReturnType<typeof getEnabledModules>>;
  validator: ReturnType<typeof createRouteAssemblyValidator>;
}): RouteAssemblyArtifacts {
  const { modules, validator } = params;
  return {
    standaloneRoutes: buildRoutes({
      modules,
      source: 'standalone',
      validator
    }),
    aliasRoutes: buildAliasRoutes({
      modules,
      validator
    }),
    layoutRoutes: buildRoutes({
      modules,
      source: 'layout',
      validator
    })
  };
}

export async function assembleRoutes(
  options: AppRouteAssemblyOptions
): Promise<AppRouteAssemblyResult> {
  const modules = await getEnabledModules(options.enabledModules);
  const validator = createRouteAssemblyValidator();

  const { standaloneRoutes, aliasRoutes, layoutRoutes } = collectModuleRoutes({
    modules,
    validator
  });

  // 路由顺序保持“模块 standalone -> 历史 alias -> 固定公共路由”，与守卫白名单生成保持一致。
  const routes: RouteRecordRaw[] = [
    ...standaloneRoutes,
    ...aliasRoutes,
    ...buildFixedRoutes({
      rootPath: routePaths.root,
      layoutComponent: AdminLayout,
      layoutRoutes,
      defaultHomePath: getDefaultHomePath(options),
      publicRouteMeta: PUBLIC_ROUTE_META,
      publicRoutes,
      // 通配 404 使用 replace，避免无效地址回退后再次命中通配造成历史栈污染。
      notFoundCatchallPath: routePaths.catchall
    })
  ];

  const skipMenuAuthRouteNames = validator.listSkipAuthRouteNames();

  return {
    routes,
    skipMenuAuthRouteNames
  };
}
