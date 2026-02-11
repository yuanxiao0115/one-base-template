import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: 'home',
    name: 'Home',
    component: () => import('./pages/HomePage.vue'),
    meta: {
      title: '首页',
      keepAlive: true,
      affix: true
    }
  }
] satisfies RouteRecordRaw[];
