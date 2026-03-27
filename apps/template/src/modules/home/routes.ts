import { createAuthRouteMeta } from '@/router/meta';
import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: 'home/index',
    name: 'TemplateHome',
    component: async () => import('./pages/HomePage.vue'),
    meta: createAuthRouteMeta({
      title: '首页',
      icon: 'ep:house',
      order: 1,
      keepAlive: true,
      affix: true
    })
  }
] as RouteRecordRaw[];
