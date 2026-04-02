import { defineRouteMeta } from '@/router/meta';
import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/law-supervison/petition-query',
    name: 'SystemSfssPetitionQuery',
    redirect: '/law-supervison/petition-query/query-statistics',
    meta: defineRouteMeta({
      title: '信访件查询',
      icon: 'application',
      rank: 56
    })
  },
  {
    path: '/law-supervison/petition-query/query-statistics',
    name: 'SystemSfssPetitionQueryStatistics',
    component: () => import('../pages/query-statistics/index.vue'),
    meta: defineRouteMeta({
      title: '查询统计',
      keepAlive: true
    })
  }
] satisfies RouteRecordRaw[];
