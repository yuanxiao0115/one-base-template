import { defineRouteMeta } from '@/router/meta';
import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/law-supervison/petition-supervision',
    name: 'SystemSfssPetitionSupervision',
    redirect: '/law-supervison/petition-supervision/collaboration-statistics',
    meta: defineRouteMeta({
      title: '信访督查',
      icon: 'application',
      rank: 53
    })
  },
  {
    path: '/law-supervison/petition-supervision/collaboration-statistics',
    name: 'SystemSfssPetitionSupervisionCollaboration',
    component: () => import('../pages/collaboration-statistics/index.vue'),
    meta: defineRouteMeta({
      title: '协同信访指标统计',
      keepAlive: true
    })
  },
  {
    path: '/law-supervison/petition-supervision/petition-topic-contrast',
    name: 'SystemSfssPetitionSupervisionTopicContrast',
    component: () => import('../pages/petition-topic-contrast/index.vue'),
    meta: defineRouteMeta({
      title: '信访专题对比',
      keepAlive: true
    })
  },
  {
    path: '/law-supervison/petition-supervision/dispute-type-contrast',
    name: 'SystemSfssPetitionSupervisionDisputeContrast',
    component: () => import('../pages/dispute-type-contrast/index.vue'),
    meta: defineRouteMeta({
      title: '纠纷类型对比',
      keepAlive: true
    })
  }
] satisfies RouteRecordRaw[];
