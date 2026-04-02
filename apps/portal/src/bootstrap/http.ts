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
import { message } from '@one-base-template/ui';
import type { AuthMode, BackendKind } from '@/config/env';
import { APP_LOGIN_ROUTE_PATH } from '@/router/constants';

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
            const { createClientSignature } = await import('@/config/basic/client-signature');
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
      onUnauthorized: () => {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(idTokenKey);
        useAuthStore(pinia).reset();
        useMenuStore(pinia).reset();
        useSystemStore(pinia).reset();
        router.replace(APP_LOGIN_ROUTE_PATH);
      }
    }
  });
}
