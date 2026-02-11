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
import { createDefaultAdapter, createSczfwAdapter } from '@one-base-template/adapters';
import { useAuthStore, useMenuStore, useTabsStore } from '@one-base-template/core';
import { setObHttpClient } from './infra/http';
import { createClientSignature } from './infra/sczfw/crypto';

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

type BackendKind = 'default' | 'sczfw';
const backend = ((import.meta.env.VITE_BACKEND as string | undefined) ??
  (import.meta.env.VITE_API_BASE_URL ? 'sczfw' : 'default')) as BackendKind;

const authMode = (import.meta.env.VITE_AUTH_MODE ?? (backend === 'sczfw' ? 'token' : 'cookie')) as
  | 'cookie'
  | 'token'
  | 'mixed';
const tokenKey = import.meta.env.VITE_TOKEN_KEY ?? (backend === 'sczfw' ? 'token' : 'ob_token');

// sczfw 老项目请求头约定（可用 env 覆盖）
const sczfwHeaders =
  backend === 'sczfw'
    ? {
        'Authorization-Type': import.meta.env.VITE_AUTHORIZATION_TYPE ?? 'ADMIN',
        Appsource: import.meta.env.VITE_APPSOURCE ?? 'frame',
        Appcode: import.meta.env.VITE_APPCODE ?? 'od'
      }
    : undefined;

const http = createObHttp({
  axios: {
    // 开发环境推荐使用 Vite proxy（同源），生产环境如需跨域可配置 VITE_API_BASE_URL 直连
    baseURL: import.meta.env.PROD ? (import.meta.env.VITE_API_BASE_URL || undefined) : undefined,
    withCredentials: authMode !== 'token',
    timeout: backend === 'sczfw' ? 100_000 : 30_000,
    ...(sczfwHeaders ? { headers: sczfwHeaders } : {})
  },
  auth: {
    mode: authMode,
    tokenHeader: 'Authorization',
    tokenPrefix: '',
    getToken: () => localStorage.getItem(tokenKey) || undefined
  },
  biz: {
    // 默认约定 { code, data, message } 且 code=0/200 成功；不稳定时可通过 app 层覆盖这些策略
    successCodes: [0, 200]
  },
  beforeRequestCallback: backend === 'sczfw'
    ? config => {
        const secret = import.meta.env.VITE_CLIENT_SIGNATURE_SECRET || undefined;
        const clientId = import.meta.env.VITE_CLIENT_SIGNATURE_CLIENT_ID || undefined;

        const signature = createClientSignature({
          secret,
          clientId
        });

        const prev =
          config.headers && typeof config.headers === 'object'
            ? (config.headers as Record<string, unknown>)
            : {};

        config.headers = {
          ...prev,
          ...(sczfwHeaders ?? {}),
          'Client-Signature': signature
        };
      }
    : undefined,
  download: {
    autoDownload: true
  },
  hooks: {
    onBizError: ({ message }) => {
      if (message) ElMessage.error(message);
    },
    onUnauthorized: () => {
      // 仅做“清状态 + 回登录页”，具体跳转/SSO 可由业务项目再扩展
      localStorage.removeItem(tokenKey);
      useAuthStore(pinia).reset();
      useMenuStore(pinia).reset();
      useTabsStore(pinia).reset();
      router.replace('/login');
    }
  }
});

setObHttpClient(http);

const adapter =
  backend === 'sczfw'
    ? createSczfwAdapter(http, {
        tokenKey,
        systemPermissionCode: import.meta.env.VITE_SCZFW_SYSTEM_PERMISSION_CODE || 'admin_server'
      })
    : createDefaultAdapter(http);

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
