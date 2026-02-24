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
    // 兼容老项目/后端菜单的历史路径：/portal/setting
    // - 只做跳转，不在静态菜单中展示（避免出现重复菜单项）
    // - 权限校验通过 meta.activePath 归属到该菜单路径
    path: 'portal/setting',
    redirect: '/portal/templates',
    meta: {
      hideInMenu: true,
      activePath: '/portal/setting'
    }
  },
  {
    path: 'portal/templates',
    name: 'PortalTemplateList',
    component: () => import('./pages/PortalTemplateListPage.vue'),
    meta: {
      title: '门户模板',
      keepAlive: true,
      // 不要求后端改菜单：用老路径做权限归属（menuStore.allowedPaths 里通常是 /portal/setting）
      activePath: '/portal/setting'
    }
  },
  {
    path: 'portal/designer',
    name: 'PortalDesigner',
    component: () => import('./pages/PortalTemplateSettingPage.vue'),
    meta: {
      title: '门户配置',
      fullScreen: true,
      hideTabsBar: true,
      activePath: '/portal/setting'
    }
  },
  {
    path: 'portal/layout',
    name: 'PortalPageEditor',
    component: () => import('./pages/PortalPageEditPage.vue'),
    meta: {
      title: '页面编辑',
      fullScreen: true,
      hideTabsBar: true,
      activePath: '/portal/setting'
    }
  }
] satisfies RouteRecordRaw[];
