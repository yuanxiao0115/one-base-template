import { defineRouteMeta } from '@/router/meta';
import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/system/permission',
    name: 'SystemMenuManagement',
    component: async () => import('./menu/list.vue'),
    meta: defineRouteMeta({
      title: '菜单管理',
      keepAlive: true
    })
  },
  {
    path: '/system/user',
    name: 'SystemUserManagement',
    component: async () => import('./user/list.vue'),
    meta: defineRouteMeta({
      title: '用户管理',
      keepAlive: true
    })
  },
  {
    path: '/system/org',
    name: 'SystemOrgManagement',
    component: async () => import('./org/list.vue'),
    meta: defineRouteMeta({
      title: '组织管理',
      keepAlive: true
    })
  },
  {
    path: '/system/position',
    name: 'SystemPositionManagement',
    component: async () => import('./position/list.vue'),
    meta: defineRouteMeta({
      title: '职位管理',
      keepAlive: true
    })
  },
  {
    path: '/system/role/management',
    name: 'SystemRoleManagement',
    component: async () => import('./role/list.vue'),
    meta: defineRouteMeta({
      title: '角色管理',
      keepAlive: true
    })
  },
  {
    path: '/system/role/assign',
    name: 'SystemRoleAssign',
    component: async () => import('./role-assign/list.vue'),
    meta: defineRouteMeta({
      title: '角色分配',
      keepAlive: true
    })
  },
  {
    path: '/system/tenant/info',
    name: 'SystemTenantInfoManagement',
    component: async () => import('./tenant-info/list.vue'),
    meta: defineRouteMeta({
      title: '租户信息管理',
      keepAlive: true
    })
  },
  {
    path: '/system/tenant/management',
    name: 'SystemTenantManagerManagement',
    component: async () => import('./tenant-manager/list.vue'),
    meta: defineRouteMeta({
      title: '租户管理员管理',
      keepAlive: true
    })
  },
  {
    path: '/ext/:slug(.*)*',
    name: 'SystemExternalFrameHost',
    component: async () => import('./menu/pages/ExternalFramePage.vue'),
    meta: defineRouteMeta({
      title: '内嵌外链',
      hideInMenu: true
    })
  },
  {
    path: '/micro/:slug(.*)*',
    name: 'SystemMicroAppHost',
    component: async () => import('./menu/pages/MicroAppHostPage.vue'),
    meta: defineRouteMeta({
      title: 'Micro 应用',
      hideInMenu: true
    })
  }
] satisfies RouteRecordRaw[];
