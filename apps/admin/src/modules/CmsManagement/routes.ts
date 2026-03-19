import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/publicity/column',
    name: 'PublicityColumn',
    component: async () => import('./column/list.vue'),
    meta: {
      title: '栏目管理',
      keepAlive: true,
      rank: 100,
      skipMenuAuth: true
    }
  },
  {
    path: '/publicity/content',
    name: 'PublicityContent',
    component: async () => import('./content/list.vue'),
    meta: {
      title: '宣传内容管理',
      keepAlive: true,
      rank: 200,
      skipMenuAuth: true
    }
  },
  {
    path: '/publicity/article-list/:categoryId',
    name: 'ArticleList',
    component: async () => import('./content/list.vue'),
    meta: {
      title: '文章列表',
      keepAlive: true,
      hideInMenu: true,
      activePath: '/publicity/content',
      skipMenuAuth: true
    }
  },
  {
    path: '/publicity/audit',
    name: 'PublicityAudit',
    component: async () => import('./audit/list.vue'),
    meta: {
      title: '审核管理',
      keepAlive: true,
      rank: 300,
      skipMenuAuth: true
    }
  }
] satisfies RouteRecordRaw[];
