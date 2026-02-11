import { createApp } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import { ElMessage } from 'element-plus';

import 'element-plus/dist/index.css';
import './styles/index.css';

import App from './App.vue';
import { routes } from './router';

import {
  createCore,
  createObHttp,
  createStaticMenusFromRoutes,
  setupRouterGuards
} from '@one-base-template/core';
import { createDefaultAdapter } from '@one-base-template/adapters';
import { useAuthStore, useMenuStore, useTabsStore } from '@one-base-template/core';
import { setObHttpClient } from './infra/http';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
// 允许在路由守卫 / http hooks 等“组件外”场景安全使用 store
setActivePinia(pinia);

const router = createRouter({
  history: createWebHistory(),
  routes,
  strict: true
});
app.use(router);

const authMode = (import.meta.env.VITE_AUTH_MODE ?? 'cookie') as 'cookie' | 'token' | 'mixed';
const tokenKey = import.meta.env.VITE_TOKEN_KEY ?? 'ob_token';

const http = createObHttp({
  axios: {
    // 开发环境推荐使用 Vite proxy（同源），生产环境如需跨域可配置 VITE_API_BASE_URL 直连
    baseURL: import.meta.env.PROD ? (import.meta.env.VITE_API_BASE_URL || undefined) : undefined,
    withCredentials: true
  },
  auth: {
    mode: authMode,
    tokenHeader: 'Authorization',
    tokenPrefix: '',
    getToken: () => localStorage.getItem(tokenKey) || undefined
  },
  biz: {
    // 默认约定 { code, data, message } 且 code=200 成功；不稳定时可通过 app 层覆盖这些策略
    successCodes: [200]
  },
  download: {
    autoDownload: true
  },
  hooks: {
    onBizError: ({ message }) => {
      if (message) ElMessage.error(message);
    },
    onUnauthorized: () => {
      // 仅做“清状态 + 回登录页”，具体跳转/SSO 可由业务项目再扩展
      useAuthStore(pinia).reset();
      useMenuStore(pinia).reset();
      useTabsStore(pinia).reset();
      router.replace('/login');
    }
  }
});

setObHttpClient(http);

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
