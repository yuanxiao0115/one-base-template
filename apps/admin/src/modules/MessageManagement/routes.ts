import type { RouteRecordRaw } from 'vue-router';
import { createAuthRouteMeta } from '@/router/meta';

export default [
  {
    path: '/system/message',
    name: 'MessageManagementRoot',
    redirect: '/system/message/receive',
    meta: createAuthRouteMeta({
      title: '消息管理',
      hideInMenu: true
    })
  },
  {
    path: '/system/message/send',
    name: 'MessageManagementSend',
    component: async () => import('./send/list.vue'),
    meta: createAuthRouteMeta({
      title: '消息发送',
      keepAlive: true
    })
  },
  {
    path: '/system/message/receive',
    name: 'MessageManagementReceive',
    component: async () => import('./receive/list.vue'),
    meta: createAuthRouteMeta({
      title: '消息接收',
      keepAlive: true
    })
  },
  {
    path: '/system/message/history',
    name: 'MessageManagementHistory',
    component: async () => import('./history/list.vue'),
    meta: createAuthRouteMeta({
      title: '发件箱',
      keepAlive: true
    })
  },
  {
    path: '/system/message/template',
    name: 'MessageManagementTemplate',
    component: async () => import('./template/list.vue'),
    meta: createAuthRouteMeta({
      title: '消息模板',
      keepAlive: true,
      access: 'menu'
    })
  },
  {
    path: '/system/message/category',
    name: 'MessageManagementCategory',
    component: async () => import('./category/list.vue'),
    meta: createAuthRouteMeta({
      title: '消息分类',
      keepAlive: true
    })
  }
] satisfies RouteRecordRaw[];
