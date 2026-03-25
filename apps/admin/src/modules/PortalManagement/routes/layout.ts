import { defineRouteMeta } from '@/router/meta';
import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    // 菜单分组节点（后端菜单常用 /portal 作为父节点），这里做 redirect 避免访问 404
    path: 'portal',
    redirect: '/portal/setting',
    meta: defineRouteMeta({
      title: '门户'
    })
  },
  {
    path: 'portal/setting',
    name: 'PortalTemplateList',
    component: async () => import('../templatePage/list.vue'),
    meta: defineRouteMeta({
      title: '门户配置',
      keepAlive: true,
      // 不要求后端改菜单：用老路径做权限归属（menuStore.allowedPaths 里通常是 /portal/setting）
      activePath: '/portal/setting'
    })
  },
  {
    path: 'material/index',
    name: 'PortalMaterialManagement',
    component: async () => import('../materialManagement/list.vue'),
    meta: defineRouteMeta({
      title: '素材管理',
      keepAlive: true,
      activePath: '/material/index'
    })
  }
] satisfies RouteRecordRaw[];
