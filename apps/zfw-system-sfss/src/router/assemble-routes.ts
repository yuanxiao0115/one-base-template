import type { RouteRecordRaw } from 'vue-router';
import {
  buildFixedRoutes,
  createRouteAssemblyDiagnostics,
  getInitialPath,
  type EnabledModulesSetting,
  type RouteAssemblyDiagnostics
} from '@one-base-template/core';
import { AdminLayout } from '@one-base-template/ui/shell';
import { DEFAULT_FALLBACK_HOME } from '@/config/systems';
import {
  buildAliasRoutes,
  buildRoutes,
  createRouteAssemblyValidator
} from './route-assembly-builder';
import { publicRoutes } from './public-routes';
import { getEnabledModules } from './registry';
import { routePaths } from './constants';

const PUBLIC_ROUTE_META = Object.freeze({
  hiddenTab: true
});

type RouteAssemblyArtifacts = {
  standaloneRoutes: RouteRecordRaw[];
  aliasRoutes: RouteRecordRaw[];
  layoutRoutes: RouteRecordRaw[];
};

export interface AppRouteAssemblyResult {
  routes: RouteRecordRaw[];
  diagnostics: RouteAssemblyDiagnostics;
}

export interface AppRouteAssemblyOptions {
  enabledModules: EnabledModulesSetting;
  defaultSystemCode?: string;
  systemHomeMap: Record<string, string>;
  storageNamespace: string;
}

export type { RouteAssemblyDiagnostics as AppRouteAssemblyDiagnostics } from '@one-base-template/core';

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

function buildModuleRouteGroups(params: {
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

export async function buildAppRoutes(
  options: AppRouteAssemblyOptions
): Promise<AppRouteAssemblyResult> {
  const modules = await getEnabledModules(options.enabledModules);
  const validator = createRouteAssemblyValidator();

  const { standaloneRoutes, aliasRoutes, layoutRoutes } = buildModuleRouteGroups({
    modules,
    validator
  });

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
      layoutPublicRouteNames: ['forbidden', 'not-found'],
      notFoundCatchallPath: routePaths.catchall,
      notFoundCatchallMeta: {
        access: 'auth',
        hiddenTab: true
      }
    })
  ];

  const diagnostics = createRouteAssemblyDiagnostics({
    routes
  });

  return {
    routes,
    diagnostics
  };
}
