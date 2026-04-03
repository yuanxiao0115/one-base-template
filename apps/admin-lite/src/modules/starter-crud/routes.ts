import { createAuthRouteMeta } from '@/router/meta';
import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: 'starter/crud',
    name: 'StarterCrudPage',
    component: async () => import('./list.vue'),
    meta: createAuthRouteMeta({
      title: 'CRUD 示例',
      icon: 'ep:edit-pen',
      order: 120,
      keepAlive: true
    })
  }
] satisfies RouteRecordRaw[];
