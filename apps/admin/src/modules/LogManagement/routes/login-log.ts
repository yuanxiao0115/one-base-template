import { defineRouteMeta } from '@/router/meta';
import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/system/log/login-log',
    name: 'SystemLoginLogManagement',
    component: async () => import('../login-log/list.vue'),
    meta: defineRouteMeta({
      title: '登录日志',
      keepAlive: true
    })
  }
] satisfies RouteRecordRaw[];
