import { defineRouteMeta } from '@/router/meta';
import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/lawsuit-petitions/litigation-related/relatedMenu',
    name: 'SystemSfssLitigationRelated',
    redirect: '/lawsuit-petitions/litigation-related/police',
    meta: defineRouteMeta({
      title: '涉法涉诉',
      icon: 'role-permission',
      rank: 2
    })
  },
  {
    path: '/lawsuit-petitions/litigation-related/police',
    name: 'SystemSfssLitigationPolice',
    component: () => import('../police-related/index.vue'),
    meta: defineRouteMeta({
      title: '公安涉法涉诉',
      keepAlive: true
    })
  },
  {
    path: '/lawsuit-petitions/litigation-related/prosecution',
    name: 'SystemSfssLitigationProsecution',
    component: () => import('../prosecution-related/index.vue'),
    meta: defineRouteMeta({
      title: '检察涉法涉诉',
      keepAlive: true
    })
  },
  {
    path: '/lawsuit-petitions/litigation-related/court',
    name: 'SystemSfssLitigationCourt',
    component: () => import('../court-related/index.vue'),
    meta: defineRouteMeta({
      title: '法院涉法涉诉',
      keepAlive: true
    })
  }
] satisfies RouteRecordRaw[];
