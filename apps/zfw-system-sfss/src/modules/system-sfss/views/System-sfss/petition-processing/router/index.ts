import { defineRouteMeta } from '@/router/meta';
import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/law-supervison/petition-processing',
    name: 'SystemSfssPetitionProcessing',
    redirect: '/law-supervison/petition-processing/petition-evaluation',
    meta: defineRouteMeta({
      title: '信访件处理',
      icon: 'application',
      rank: 54
    })
  },
  {
    path: '/law-supervison/petition-processing/petition-evaluation',
    name: 'SystemSfssPetitionProcessingEvaluation',
    component: () => import('../pages/petition-evaluation/index.vue'),
    meta: defineRouteMeta({
      title: '信访件评估',
      keepAlive: true
    })
  },
  {
    path: '/law-supervison/petition-processing/petition-urge',
    name: 'SystemSfssPetitionProcessingUrge',
    component: () => import('../pages/petition-urge/index.vue'),
    meta: defineRouteMeta({
      title: '信访件督办',
      keepAlive: true
    })
  },
  {
    path: '/law-supervison/petition-processing/petition-transfer',
    name: 'SystemSfssPetitionProcessingTransfer',
    component: () => import('../pages/petition-transfer/index.vue'),
    meta: defineRouteMeta({
      title: '信访件转办交办',
      keepAlive: true
    })
  },
  {
    path: '/law-supervison/petition-processing/petition-assist',
    name: 'SystemSfssPetitionProcessingAssist',
    component: () => import('../pages/petition-assist/index.vue'),
    meta: defineRouteMeta({
      title: '信访件协办',
      keepAlive: true
    })
  },
  {
    path: '/law-supervison/petition-processing/petition-feedback',
    name: 'SystemSfssPetitionProcessingFeedback',
    component: () => import('../pages/petition-feedback/index.vue'),
    meta: defineRouteMeta({
      title: '信访件反馈',
      keepAlive: true
    })
  },
  {
    path: '/law-supervison/petition-processing/petition-close',
    name: 'SystemSfssPetitionProcessingClose',
    component: () => import('../pages/petition-close/index.vue'),
    meta: defineRouteMeta({
      title: '信访件终结',
      keepAlive: true
    })
  },
  {
    path: '/law-supervison/petition-processing/petition-archive',
    name: 'SystemSfssPetitionProcessingArchive',
    component: () => import('../pages/petition-archive/index.vue'),
    meta: defineRouteMeta({
      title: '信访件归档',
      keepAlive: true
    })
  }
] satisfies RouteRecordRaw[];
