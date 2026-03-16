import { createRouter, createWebHistory } from 'vue-router';
import { appEnv } from '@/infra/env';
import { templateRoutes } from './routes';

export function createAppRouter() {
  return createRouter({
    history: createWebHistory(appEnv.baseUrl),
    routes: templateRoutes,
    strict: true
  });
}
