import { createRouter, createWebHistory } from 'vue-router';
import { appEnv } from '@/infra/env';
import { portalRoutes } from './routes';

export function createAppRouter() {
  return createRouter({
    history: createWebHistory(appEnv.baseUrl),
    routes: portalRoutes,
    strict: true
  });
}
