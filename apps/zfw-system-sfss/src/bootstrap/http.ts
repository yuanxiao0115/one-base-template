import type { Pinia } from 'pinia';
import type { Router } from 'vue-router';
import {
  buildLoginRedirectLocation,
  createBasicClientSignatureBeforeRequest,
  createObHttp,
  getRouteAccess,
  type ObHttp,
  useAuthStore,
  useMenuStore,
  useSystemStore
} from '@one-base-template/core';
import { message } from '@one-base-template/ui';
import type { AuthMode, BackendKind } from '@/config/env';
import { routePaths } from '@/router/constants';

function isBizError(error: unknown): boolean {
  return error instanceof Error && error.name === 'ObBizError';
}

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
  void import('@one-base-template/tag/store').then(({ useTagStoreHook }) => {
    useTagStoreHook().handleTags('equal', []);
  });
}

function getUnauthorizedRedirect(router: Router) {
  const currentRoute = router.currentRoute?.value;
  if (!currentRoute || currentRoute.path === routePaths.login) {
    return routePaths.login;
  }

  if (getRouteAccess(currentRoute.meta) === 'open') {
    return routePaths.login;
  }

  return buildLoginRedirectLocation({
    to: currentRoute,
    loginRoutePath: routePaths.login
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
          loadCreateClientSignature: async () => {
            const { createClientSignature } = await import('@/services/security/client-signature');
            return createClientSignature;
          }
        })
      : undefined;

  return createObHttp({
    axios: {
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
      successCodes: [0, 200]
    },
    beforeRequestCallback,
    download: {
      autoDownload: true
    },
    hooks: {
      onBizError: ({ message: errorMessage }) => {
        if (errorMessage) {
          void message.error(errorMessage);
        }
      },
      onNetworkError: (error) => {
        if (isBizError(error)) {
          return;
        }
        const errorMessage = resolveNetworkErrorMessage(error);
        if (errorMessage) {
          void message.error(errorMessage);
        }
      },
      onUnauthorized: () => {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(idTokenKey);
        useAuthStore(pinia).reset();
        useMenuStore(pinia).reset();
        useSystemStore(pinia).reset();
        resetTagStore();
        router.replace(getUnauthorizedRedirect(router));
      }
    }
  });
}
