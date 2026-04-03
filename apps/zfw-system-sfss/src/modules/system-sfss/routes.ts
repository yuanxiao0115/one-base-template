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
    path: '/system-sfss/index',
    name: 'SystemSfssIndex',
    redirect: '/law-supervison/sunshine-petition/shi',
    meta: createAuthRouteMeta({
      title: '涉法涉诉系统',
      hideInMenu: true
    })
  },
  ...legacyModuleRoutes
] satisfies RouteRecordRaw[];
