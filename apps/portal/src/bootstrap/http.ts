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
import type { AuthMode, BackendKind } from '@/config/env';

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
      onBizError: ({ message }) => {
        if (message) {
          ElMessage.error(message);
        }
      },
      onUnauthorized: () => {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(idTokenKey);
        useAuthStore(pinia).reset();
        useMenuStore(pinia).reset();
        useSystemStore(pinia).reset();
        router.replace('/login');
      }
    }
  });
}
