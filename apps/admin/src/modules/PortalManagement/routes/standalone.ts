import { createOpenRouteMeta, defineRouteMeta } from '@/router/meta';
import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    // 门户预览页：必须是顶层路由，避免被 AdminLayout（侧栏/顶栏）包裹
    path: '/portal/preview',
    name: 'PortalPreview',
    component: async () => import('../designPage/PortalPreviewRenderPage.vue'),
    meta: createOpenRouteMeta()
  },
  {
    // 门户设计器：全局全屏页，必须是顶层路由，避免被 AdminLayout（侧栏/顶栏）包裹
    path: '/portal/design',
    name: 'PortalDesigner',
    component: async () => import('../designPage/PortalTemplateSettingPage.vue'),
    meta: defineRouteMeta({
      title: '门户配置',
      fullScreen: true,
      hideTabsBar: true,
      hiddenTab: true,
      activePath: '/portal/setting'
      // 不要求后端改菜单：用老路径做权限归属（menuStore.allowedPaths 里通常是 /portal/setting）
    })
  },
  {
    // 门户页面编辑器：全局全屏页
    path: '/portal/page/edit',
    name: 'PortalPageEditor',
    component: async () => import('../designPage/PortalPageEditPage.vue'),
    meta: defineRouteMeta({
      title: '页面编辑',
      fullScreen: true,
      hideTabsBar: true,
      hiddenTab: true,
      activePath: '/portal/setting'
    })
  }
] satisfies RouteRecordRaw[];
