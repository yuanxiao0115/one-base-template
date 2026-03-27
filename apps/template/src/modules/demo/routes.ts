import { createAuthRouteMeta } from '@/router/meta';
import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: 'demo/about',
    name: 'TemplateAbout',
    component: async () => import('./pages/AboutPage.vue'),
    meta: createAuthRouteMeta({
      title: '关于模板',
      icon: 'ep:info-filled',
      order: 2,
      keepAlive: false
    })
  }
] as RouteRecordRaw[];
