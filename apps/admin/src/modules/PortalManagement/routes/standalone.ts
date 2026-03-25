import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    // 门户预览页：必须是顶层路由，避免被 AdminLayout（侧栏/顶栏）包裹
    path: '/portal/preview',
    name: 'PortalPreview',
    component: async () => import('../designPage/PortalPreviewRenderPage.vue'),
    meta: {
      public: true,
      hiddenTab: true
    }
  },
  {
    // 门户设计器：全局全屏页，必须是顶层路由，避免被 AdminLayout（侧栏/顶栏）包裹
    path: '/portal/design',
    name: 'PortalDesigner',
    component: async () => import('../designPage/PortalTemplateSettingPage.vue'),
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
    path: '/portal/page/edit',
    name: 'PortalPageEditor',
    component: async () => import('../designPage/PortalPageEditPage.vue'),
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
