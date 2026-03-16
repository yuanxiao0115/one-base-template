import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/system/permission',
    name: 'SystemMenuManagement',
    component: async () => import('./menu/list.vue'),
    meta: {
      title: '菜单管理',
      keepAlive: true
    }
  },
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
