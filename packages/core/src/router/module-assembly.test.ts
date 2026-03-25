import { describe, expect, it } from 'vite-plus/test';
import type { RouteRecordRaw } from 'vue-router';
import {
  buildModuleAliasRoutes,
  buildModuleRoutes,
  createModuleRouteAssemblyValidator,
  type RouteAssemblyModule
} from './module-assembly';

function createViewRoute(params: {
  path: string;
  name: string;
  meta?: Record<string, unknown>;
}): RouteRecordRaw {
  return {
    path: params.path,
    name: params.name,
    component: {} as never,
    ...(params.meta ? { meta: params.meta } : {})
  };
}

function createValidator(warnings: string[]) {
  return createModuleRouteAssemblyValidator({
    reservedRoutePaths: new Set(['/login', '/403', '/404', '/:pathMatch(.*)*']),
    reservedRouteNames: new Set(['Login', 'Forbidden', 'NotFound']),
    onWarn(message: string) {
      warnings.push(message);
    }
  });
}

describe('core/router/module-assembly', () => {
  it('应在路由构建时跳过冲突', () => {
    const warnings: string[] = [];
    const validator = createValidator(warnings);
    const modules: RouteAssemblyModule[] = [
      {
        id: 'portal',
        routes: {
          layout: [
            createViewRoute({
              path: '/portal/templates',
              name: 'PortalTemplateList'
            }),
            createViewRoute({
              path: '/portal/templates',
              name: 'PortalTemplateListDup'
            }),
            createViewRoute({
              path: '/login',
              name: 'PortalIllegalLogin'
            })
          ]
        }
      }
    ];

    const routes = buildModuleRoutes({
      modules,
      source: 'layout',
      validator,
      rootPath: '/'
    });

    expect(routes).toHaveLength(1);
    expect(warnings.some((message) => message.includes('重复 path'))).toBe(true);
    expect(warnings.some((message) => message.includes('保留 path'))).toBe(true);
  });

  it('应应用 activePathMap 并生成别名路由', () => {
    const warnings: string[] = [];
    const validator = createValidator(warnings);
    const modules: RouteAssemblyModule[] = [
      {
        id: 'portal',
        routes: {
          layout: [
            createViewRoute({
              path: '/portal/templates',
              name: 'PortalTemplateList',
              meta: {}
            })
          ]
        },
        compat: {
          activePathMap: {
            '/portal/templates': '/portal/setting',
            '/portal/setting': '/portal/setting'
          },
          routeAliases: [
            {
              from: '/portal/setting',
              to: '/portal/templates'
            }
          ]
        }
      }
    ];

    const routes = buildModuleRoutes({
      modules,
      source: 'layout',
      validator,
      rootPath: '/'
    });
    const aliases = buildModuleAliasRoutes({
      modules,
      validator,
      rootPath: '/'
    });

    expect(routes[0]).toBeDefined();
    expect((routes[0]!.meta as Record<string, unknown>).activePath).toBe('/portal/setting');
    expect(aliases).toHaveLength(1);
    expect(aliases[0]).toBeDefined();
    expect(aliases[0]!.path).toBe('/portal/setting');
    expect(aliases[0]!.redirect).toBe('/portal/templates');
    expect((aliases[0]!.meta as Record<string, unknown>).hideInMenu).toBe(true);
    expect((aliases[0]!.meta as Record<string, unknown>).hiddenTab).toBe(true);
    expect((aliases[0]!.meta as Record<string, unknown>).activePath).toBe('/portal/setting');
    expect(warnings).toHaveLength(0);
  });
});
