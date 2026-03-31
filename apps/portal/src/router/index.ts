import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';
import { appEnv } from '@/config/env';
import { portalRoutes } from './routes';

function createRouterHistory(historyMode: 'history' | 'hash', baseUrl: string) {
  return historyMode === 'hash' ? createWebHashHistory(baseUrl) : createWebHistory(baseUrl);
}

export function createAppRouter() {
  return createRouter({
    history: createRouterHistory(appEnv.historyMode, appEnv.baseUrl),
    routes: portalRoutes,
    strict: true
  });
}
