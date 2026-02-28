import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/system/position',
    name: 'SystemPositionManagement',
    component: () => import('./position/page.vue'),
    meta: {
      title: '职位管理',
      keepAlive: true
    }
  }
] satisfies RouteRecordRaw[];
