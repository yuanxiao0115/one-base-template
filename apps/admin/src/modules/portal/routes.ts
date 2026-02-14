import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: 'portal/setting',
    name: 'PortalTemplateListPage',
    component: () => import('./pages/PortalTemplateListPage.vue'),
    meta: {
      title: '门户模板',
      keepAlive: true
    }
  },
  {
    path: 'resource/portal/setting',
    name: 'PortalTemplateSettingPage',
    component: () => import('./pages/PortalTemplateSettingPage.vue'),
    meta: {
      title: '门户配置',
      fullScreen: true,
      hideTabsBar: true
    }
  },
  {
    path: 'portal/page/edit',
    name: 'PortalPageEditPage',
    component: () => import('./pages/PortalPageEditPage.vue'),
    meta: {
      title: '页面编辑',
      fullScreen: true,
      hideTabsBar: true
    }
  }
] satisfies RouteRecordRaw[];

