import { createAuthRouteMeta } from '@/router/meta';
import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/publicity/column',
    name: 'PublicityColumn',
    component: async () => import('./column/list.vue'),
    meta: createAuthRouteMeta({
      title: '栏目管理',
      keepAlive: true,
      rank: 100
    })
  },
  {
    path: '/publicity/content',
    name: 'PublicityContent',
    component: async () => import('./content/list.vue'),
    meta: createAuthRouteMeta({
      title: '宣传内容管理',
      keepAlive: true,
      rank: 200
    })
  },
  {
    path: '/publicity/article-list/:categoryId',
    name: 'ArticleList',
    component: async () => import('./content/list.vue'),
    meta: createAuthRouteMeta({
      title: '文章列表',
      keepAlive: true,
      hideInMenu: true,
      activePath: '/publicity/content'
    })
  },
  {
    path: '/publicity/audit',
    name: 'PublicityAudit',
    component: async () => import('./audit/list.vue'),
    meta: createAuthRouteMeta({
      title: '审核管理',
      keepAlive: true,
      rank: 300
    })
  }
] satisfies RouteRecordRaw[];
