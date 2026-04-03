import { defineRouteMeta } from '@/router/meta';
import { collectGlobRouteModules } from '@one-base-template/core';
import type { RouteRecordRaw } from 'vue-router';

const logChildRoutes = collectGlobRouteModules(
  import.meta.glob<RouteRecordRaw[]>('./routes/*.ts', {
    eager: true,
    import: 'default'
  })
);

export default [
  {
    path: '/system/log',
    name: 'SystemLogManagement',
    redirect: '/system/log/login-log',
    meta: defineRouteMeta({
      title: '日志管理'
    })
  },
  ...logChildRoutes
] satisfies RouteRecordRaw[];
