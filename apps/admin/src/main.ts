import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

import 'element-plus/dist/index.css';
import './styles/index.css';

import App from './App.vue';
import { routes } from './router';

import {
  createCore,
  createHttpClient,
  createStaticMenusFromRoutes,
  setupRouterGuards
} from '@one-base-template/core';
import { createDefaultAdapter } from '@one-base-template/adapters';

const app = createApp(App);
app.use(createPinia());

const router = createRouter({
  history: createWebHistory(),
  routes,
  strict: true
});
app.use(router);

const http = createHttpClient({
  // 开发环境推荐使用 Vite proxy（同源），生产环境如需跨域可配置 VITE_API_BASE_URL 直连
  baseURL: import.meta.env.PROD ? (import.meta.env.VITE_API_BASE_URL || undefined) : undefined,
  withCredentials: true
});

const adapter = createDefaultAdapter(http);

const menuMode = (import.meta.env.VITE_MENU_MODE ?? 'remote') as 'remote' | 'static';

const staticMenus =
  menuMode === 'static'
    ? createStaticMenusFromRoutes(routes, { rootPath: '/' })
    : undefined;

app.use(
  createCore({
    adapter,
    menuMode,
    staticMenus,
    sso: {
      enabled: true,
      routePath: '/sso',
      strategies: [
        { type: 'token', paramNames: ['token', 'access_token'], exchange: 'adapter' },
        { type: 'ticket', paramNames: ['ticket'], serviceUrlParam: 'serviceUrl' },
        { type: 'oauth', codeParam: 'code', stateParam: 'state', redirectUri: undefined }
      ]
    },
    theme: {
      defaultTheme: 'blue',
      themes: {
        blue: { primary: '#1677ff' },
        green: { primary: '#16a34a' },
        orange: { primary: '#f97316' }
      }
    }
  })
);

setupRouterGuards(router);

router.isReady().then(() => {
  app.mount('#app');
});
