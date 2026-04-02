import { defineRouteMeta } from '@/router/meta';
import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/system/dict',
    name: 'SystemDictManagement',
    component: async () => import('./dict/list.vue'),
    meta: defineRouteMeta({
      title: '字典管理',
      keepAlive: true
    })
  }
] satisfies RouteRecordRaw[];
