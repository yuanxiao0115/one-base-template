import { defineRouteMeta } from '@/router/meta';
import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/law-supervison/sunshine-petition',
    name: 'SystemSfssSunshinePetition',
    redirect: '/law-supervison/sunshine-petition/shi',
    meta: defineRouteMeta({
      title: '阳光信访',
      icon: 'system',
      rank: 52
    })
  },
  {
    path: '/law-supervison/sunshine-petition/shi',
    name: 'SystemSfssSunshinePetitionCity',
    component: () => import('../pages/visit-city/index.vue'),
    meta: defineRouteMeta({
      title: '到市访',
      keepAlive: true
    })
  },
  {
    path: '/law-supervison/sunshine-petition/sheng',
    name: 'SystemSfssSunshinePetitionProvince',
    component: () => import('../pages/visit-province/index.vue'),
    meta: defineRouteMeta({
      title: '赴省访',
      keepAlive: true
    })
  },
  {
    path: '/law-supervison/sunshine-petition/jing',
    name: 'SystemSfssSunshinePetitionCapital',
    component: () => import('../pages/visit-capital/index.vue'),
    meta: defineRouteMeta({
      title: '进京访',
      keepAlive: true
    })
  }
] satisfies RouteRecordRaw[];
