import { createFullscreenAuthRouteMeta } from '@/router/meta';
import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/document-form/design',
    name: 'DocumentFormDesigner',
    component: async () => import('../designPage/DocumentFormDesignerPage.vue'),
    meta: createFullscreenAuthRouteMeta({
      title: '公文表单设计',
      activePath: '/document-form/setting'
    })
  },
  {
    path: '/document-form/preview',
    name: 'DocumentFormPreview',
    component: async () => import('../designPage/DocumentFormPreviewPage.vue'),
    meta: createFullscreenAuthRouteMeta({
      title: '公文表单预览',
      activePath: '/document-form/setting'
    })
  }
] satisfies RouteRecordRaw[];
