import { ElMessage } from 'element-plus';
import type { Pinia } from 'pinia';
import type { Router } from 'vue-router';
import {
  createBasicClientSignatureBeforeRequest,
  createObHttp,
  type ObHttp,
  useAuthStore,
  useMenuStore,
  useSystemStore
} from '@one-base-template/core';

import type { AuthMode, BackendKind } from '../config/env';
import { routePaths } from '../router/constants';

function resolveNetworkErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return '网络异常，请稍后重试';
  }

  const code = 'code' in error ? String(error.code ?? '') : '';
  const response =
    'response' in error ? (error.response as { status?: number } | undefined) : undefined;
  const status = typeof response?.status === 'number' ? response.status : 0;

  if (status === 401) {
    return '';
  }

  if (code === 'ECONNABORTED' || /timeout/i.test(error.message)) {
    return '请求超时，请稍后重试';
  }

  if (!status) {
    return '网络连接异常，请检查网络后重试';
  }

  if (status >= 500) {
    return '服务异常，请稍后重试';
  }

  return error.message || '请求失败，请稍后重试';
}

function resetTagStore() {
  // 统一走单启动链路后，未授权时始终清空 tags，避免残留上一个会话的页签状态。
  void import('@one-base-template/tag/store').then(({ useTagStoreHook }) => {
    useTagStoreHook().handleTags('equal', []);
  });
}

export function createAppHttp(params: {
  backend: BackendKind;
  isProd: boolean;
  apiBaseUrl?: string;
  authMode: AuthMode;
  tokenKey: string;
  idTokenKey: string;
  basicHeaders?: Record<string, string>;
  clientSignatureSalt?: string;
  clientSignatureClientId?: string;
  pinia: Pinia;
  router: Router;
}): ObHttp {
  const {
    backend,
    isProd,
    apiBaseUrl,
    authMode,
    tokenKey,
    idTokenKey,
    basicHeaders,
    clientSignatureSalt,
    clientSignatureClientId,
    pinia,
    router
  } = params;

  const beforeRequestCallback =
    backend === 'basic'
      ? createBasicClientSignatureBeforeRequest({
          basicHeaders,
          clientSignatureSalt,
          clientSignatureClientId,
          // 仅在请求真正发出前再按需加载 gm-crypto，避免把签名依赖拉进 admin 冷启动链。
          loadCreateClientSignature: async () => {
            const { createClientSignature } = await import('../services/security/client-signature');
            return createClientSignature;
          }
        })
      : undefined;

  return createObHttp({
    axios: {
      // 开发环境推荐使用 Vite proxy（同源），生产环境如需跨域可配置 VITE_API_BASE_URL 直连
      baseURL: isProd ? apiBaseUrl || undefined : undefined,
      withCredentials: authMode !== 'token',
      timeout: backend === 'basic' ? 100_000 : 30_000,
      ...(basicHeaders ? { headers: basicHeaders } : {})
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
    beforeRequestCallback,
    download: {
      autoDownload: true
    },
    hooks: {
      onBizError: ({ message }) => {
        if (message) {
          ElMessage.error(message);
        }
      },
      onNetworkError: (error) => {
        const message = resolveNetworkErrorMessage(error);
        if (message) {
          ElMessage.error(message);
        }
      },
      onUnauthorized: () => {
        // 仅做“清状态 + 回登录页”，具体跳转/SSO 可由业务项目再扩展
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(idTokenKey);
        useAuthStore(pinia).reset();
        useMenuStore(pinia).reset();
        useSystemStore(pinia).reset();
        resetTagStore();
        router.replace(routePaths.login);
      }
    }
  });
}
