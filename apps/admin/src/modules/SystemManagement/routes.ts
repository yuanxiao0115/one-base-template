import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/system/dict',
    name: 'SystemDictManagement',
    component: async () => import('./dict/list.vue'),
    meta: {
      title: '字典管理',
      keepAlive: true
    }
  }
] satisfies RouteRecordRaw[];
