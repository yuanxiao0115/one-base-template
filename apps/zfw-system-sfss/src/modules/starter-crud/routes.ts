import { createAuthRouteMeta } from '@/router/meta';
import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: 'starter/crud',
    name: 'StarterCrudPage',
    component: async () => import('./list.vue'),
    meta: createAuthRouteMeta({
      title: 'Starter CRUD',
      icon: 'ep:edit-pen',
      order: 30,
      keepAlive: false
    })
  }
] as RouteRecordRaw[];
