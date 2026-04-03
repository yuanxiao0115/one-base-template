import { createAuthRouteMeta } from '@/router/meta';
import { collectGlobRouteModules } from '@one-base-template/core';
import type { RouteRecordRaw } from 'vue-router';

const legacyModuleRoutes = collectGlobRouteModules({
  ...import.meta.glob<RouteRecordRaw[]>('./*/router/index.ts', {
    eager: true,
    import: 'default'
  }),
  ...import.meta.glob<RouteRecordRaw[]>('./*/router.ts', {
    eager: true,
    import: 'default'
  })
});

export default [
  {
    path: '/demo/management/index',
    name: 'DemoManagementIndex',
    component: async () => import('./index.vue'),
    meta: createAuthRouteMeta({
      title: '示例管理模块',
      keepAlive: true
    })
  },
  ...legacyModuleRoutes
] satisfies RouteRecordRaw[];
