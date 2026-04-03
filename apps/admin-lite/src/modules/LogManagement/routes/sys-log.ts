import { defineRouteMeta } from '@/router/meta';
import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/system/log/sys-log',
    name: 'SystemSysLogManagement',
    component: async () => import('../sys-log/list.vue'),
    meta: defineRouteMeta({
      title: '操作日志',
      keepAlive: true
    })
  }
] satisfies RouteRecordRaw[];
