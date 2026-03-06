import { ElMessage } from "element-plus";
import type { Pinia } from "pinia";
import type { Router } from "vue-router";
import { createObHttp, type ObHttp, useAuthStore, useMenuStore, useSystemStore } from "@one-base-template/core";
import { createClientSignature } from "@/infra/sczfw/crypto";
import type { AuthMode, BackendKind } from "@/infra/env";

export function createAppHttp(params: {
  backend: BackendKind;
  isProd: boolean;
  apiBaseUrl?: string;
  authMode: AuthMode;
  tokenKey: string;
  idTokenKey: string;
  sczfwHeaders?: Record<string, string>;
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
    sczfwHeaders,
    clientSignatureSalt,
    clientSignatureClientId,
    pinia,
    router,
  } = params;

  return createObHttp({
    axios: {
      baseURL: isProd ? apiBaseUrl || undefined : undefined,
      withCredentials: authMode !== "token",
      timeout: backend === "sczfw" ? 100_000 : 30_000,
      ...(sczfwHeaders ? { headers: sczfwHeaders } : {}),
    },
    auth: {
      mode: authMode,
      tokenHeader: "Authorization",
      tokenPrefix: "",
      getToken: () => localStorage.getItem(tokenKey) || undefined,
    },
    biz: {
      successCodes: [0, 200],
    },
    beforeRequestCallback:
      backend === "sczfw"
        ? (config) => {
            const signature = createClientSignature({
              salt: clientSignatureSalt,
              clientId: clientSignatureClientId,
            });

            const prev =
              config.headers && typeof config.headers === "object"
                ? (config.headers as Record<string, unknown>)
                : {};

            config.headers = {
              ...prev,
              ...(sczfwHeaders ?? {}),
              "Client-Signature": signature,
            };
          }
        : undefined,
    download: {
      autoDownload: true,
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
        router.replace("/login");
      },
    },
  });
}
