import { createAuthRouteMeta } from '@/router/meta';
import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/demo/management/user',
    name: 'DemoManagementUserPage',
    component: async () => import('../list.vue'),
    meta: createAuthRouteMeta({
      title: '示例用户管理',
      keepAlive: true
    })
  }
] satisfies RouteRecordRaw[];
