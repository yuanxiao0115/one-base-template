import type { RouteRecordRaw } from 'vue-router';
import { createAuthRouteMeta, defineRouteMeta } from '@/router/meta';

export default [
  {
    path: '/portal/login-page',
    name: 'PortalLoginPageManagement',
    component: async () => import('./login-page/list.vue'),
    meta: defineRouteMeta({
      title: '登录页管理',
      keepAlive: true,
      activePath: '/portal/login-page'
    })
  },
  {
    path: '/portal/login-notice',
    name: 'PortalLoginNoticeManagement',
    component: async () => import('./login-notice/list.vue'),
    meta: defineRouteMeta({
      title: '弹窗通知',
      keepAlive: true,
      activePath: '/portal/login-notice'
    })
  },
  {
    path: '/portal/login-page/preview/:id',
    name: 'PortalLoginPagePreview',
    component: async () => import('./login-page/preview.vue'),
    meta: createAuthRouteMeta({
      title: '登录页预览',
      hideInMenu: true,
      hiddenTab: true,
      activePath: '/portal/login-page'
    })
  }
] satisfies RouteRecordRaw[];
