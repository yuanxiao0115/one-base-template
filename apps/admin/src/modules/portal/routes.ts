import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    // 菜单分组节点（mock/后端菜单常用 /portal 作为父节点），这里做 redirect 避免访问 404
    path: 'portal',
    redirect: '/portal/templates',
    meta: {
      title: '门户'
    }
  },
  {
    path: 'portal/templates',
    name: 'PortalTemplateList',
    component: () => import('./pages/PortalTemplateListPage.vue'),
    meta: {
      title: '门户模板',
      keepAlive: true
    }
  },
  {
    path: 'portal/designer',
    name: 'PortalDesigner',
    component: () => import('./pages/PortalTemplateSettingPage.vue'),
    meta: {
      title: '门户配置',
      fullScreen: true,
      hideTabsBar: true
    }
  },
  {
    path: 'portal/layout',
    name: 'PortalPageEditor',
    component: () => import('./pages/PortalPageEditPage.vue'),
    meta: {
      title: '页面编辑',
      fullScreen: true,
      hideTabsBar: true
    }
  }
] satisfies RouteRecordRaw[];
