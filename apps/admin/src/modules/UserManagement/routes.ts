import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/system/user',
    name: 'SystemUserManagement',
    component: async () => import('./user/list.vue'),
    meta: {
      title: '用户管理',
      keepAlive: true
    }
  },
  {
    path: '/system/org',
    name: 'SystemOrgManagement',
    component: async () => import('./org/list.vue'),
    meta: {
      title: '组织管理',
      keepAlive: true
    }
  },
  {
    path: '/system/position',
    name: 'SystemPositionManagement',
    component: async () => import('./position/list.vue'),
    meta: {
      title: '职位管理',
      keepAlive: true
    }
  },
  {
    path: '/system/role/management',
    name: 'SystemRoleManagement',
    component: async () => import('./role/list.vue'),
    meta: {
      title: '角色管理',
      keepAlive: true
    }
  },
  {
    path: '/system/role/assign',
    name: 'SystemRoleAssign',
    component: async () => import('./role-assign/list.vue'),
    meta: {
      title: '角色分配',
      keepAlive: true
    }
  }
] satisfies RouteRecordRaw[];
