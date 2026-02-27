import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    // 门户预览页：必须是顶层路由，避免被 AdminLayout（侧栏/顶栏）包裹
    path: '/portal/preview/:tabId?',
    name: 'PortalPreview',
    component: () => import('../pages/PortalPreviewRenderPage.vue'),
    meta: { public: true, hiddenTab: true }
  },
  {
    // 门户设计器：全局全屏页，必须是顶层路由，避免被 AdminLayout（侧栏/顶栏）包裹
    path: '/portal/designer',
    name: 'PortalDesigner',
    component: () => import('../pages/PortalTemplateSettingPage.vue'),
    meta: {
      title: '门户配置',
      fullScreen: true,
      hideTabsBar: true,
      hiddenTab: true,
      activePath: '/portal/setting',
      skipMenuAuth: true
    }
  },
  {
    // 门户页面编辑器：全局全屏页
    path: '/portal/layout',
    name: 'PortalPageEditor',
    component: () => import('../pages/PortalPageEditPage.vue'),
    meta: {
      title: '页面编辑',
      fullScreen: true,
      hideTabsBar: true,
      hiddenTab: true,
      activePath: '/portal/setting',
      skipMenuAuth: true
    }
  }
] satisfies RouteRecordRaw[];
