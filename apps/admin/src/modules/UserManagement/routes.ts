import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/system/user',
    name: 'SystemUserManagement',
    component: () => import('./user/page.vue'),
    meta: {
      title: '用户管理',
      keepAlive: true
    }
  },
  {
    path: '/system/org',
    name: 'SystemOrgManagement',
    component: () => import('./org/page.vue'),
    meta: {
      title: '组织管理',
      keepAlive: true
    }
  },
  {
    path: '/system/position',
    name: 'SystemPositionManagement',
    component: () => import('./position/page.vue'),
    meta: {
      title: '职位管理',
      keepAlive: true
    }
  },
  {
    path: '/system/role/management',
    name: 'SystemRoleManagement',
    component: () => import('./role/page.vue'),
    meta: {
      title: '角色管理',
      keepAlive: true
    }
  },
  {
    path: '/system/role/assign',
    name: 'SystemRoleAssign',
    component: () => import('./role-assign/page.vue'),
    meta: {
      title: '角色分配',
      keepAlive: true
    }
  }
] satisfies RouteRecordRaw[];
