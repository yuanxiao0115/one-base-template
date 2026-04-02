import { createAuthRouteMeta } from '@/router/meta';
import type { RouteRecordRaw } from 'vue-router';
import sunshinePetitionRoutes from './views/System-sfss/sunshine-petition/router';
import petitionSupervisionRoutes from './views/System-sfss/petition-supervision/router';
import petitionProcessingRoutes from './views/System-sfss/petition-processing/router';
import specialPetitionManagementRoutes from './views/System-sfss/special-petition-management/router';
import petitionQueryRoutes from './views/System-sfss/petition-query/router';
import litigationRelatedRoutes from './views/System-sfss/litigation-related/router';

const legacyModuleRoutes: RouteRecordRaw[] = [
  ...sunshinePetitionRoutes,
  ...petitionSupervisionRoutes,
  ...petitionProcessingRoutes,
  ...specialPetitionManagementRoutes,
  ...petitionQueryRoutes,
  ...litigationRelatedRoutes
];

export default [
  {
    path: '/system-sfss/index',
    name: 'SystemSfssIndex',
    component: () => import('./pages/SystemSfssIndexPage.vue'),
    meta: createAuthRouteMeta({
      title: '涉法涉诉系统',
      hideInMenu: true,
      keepAlive: true
    })
  },
  ...legacyModuleRoutes
] satisfies RouteRecordRaw[];
