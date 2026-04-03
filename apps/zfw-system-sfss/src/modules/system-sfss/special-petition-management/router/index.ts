import { defineRouteMeta } from '@/router/meta';
import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/law-supervison/special-petition-management',
    name: 'SystemSfssSpecialPetitionManagement',
    redirect: '/law-supervison/special-petition-management/judicial-assistance',
    meta: defineRouteMeta({
      title: '特殊信访件管理',
      icon: 'application',
      rank: 55
    })
  },
  {
    path: '/law-supervison/special-petition-management/judicial-assistance',
    name: 'SystemSfssSpecialPetitionJudicialAssistance',
    component: () => import('../pages/judicial-assistance/index.vue'),
    meta: defineRouteMeta({
      title: '司法救助',
      keepAlive: true
    })
  },
  {
    path: '/law-supervison/special-petition-management/case-closure-management',
    name: 'SystemSfssSpecialPetitionCaseClosure',
    component: () => import('../pages/case-closure-management/index.vue'),
    meta: defineRouteMeta({
      title: '终结案件管理',
      keepAlive: true
    })
  }
] satisfies RouteRecordRaw[];
