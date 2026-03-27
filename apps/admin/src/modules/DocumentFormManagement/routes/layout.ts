import { defineRouteMeta } from '@/router/meta';
import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: 'document-form',
    redirect: '/document-form/setting',
    meta: defineRouteMeta({
      title: '公文表单'
    })
  },
  {
    path: 'document-form/setting',
    name: 'DocumentFormTemplateList',
    component: async () => import('../list.vue'),
    meta: defineRouteMeta({
      title: '公文表单',
      keepAlive: true,
      activePath: '/document-form/setting'
    })
  }
] satisfies RouteRecordRaw[];
