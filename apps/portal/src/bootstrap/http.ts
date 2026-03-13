import { ElMessage } from "element-plus";
import type { Pinia } from "pinia";
import type { Router } from "vue-router";
import { createObHttp, type ObHttp, useAuthStore, useMenuStore, useSystemStore } from "@one-base-template/core";
import type { AuthMode, BackendKind } from "@/infra/env";

async function appendSczfwClientSignature(
  config: Record<string, unknown>,
  params: {
    sczfwHeaders?: Record<string, string>;
    clientSignatureSalt?: string;
    clientSignatureClientId?: string;
  }
) {
  const { createClientSignature } = await import("@/infra/sczfw/client-signature");
  const signature = createClientSignature({
    salt: params.clientSignatureSalt,
    clientId: params.clientSignatureClientId,
  });

  const prev =
    config.headers && typeof config.headers === "object" ? (config.headers as Record<string, unknown>) : {};

  config.headers = {
    ...prev,
    ...(params.sczfwHeaders ?? {}),
    "Client-Signature": signature,
  };
}

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
        ? async (config) => {
            await appendSczfwClientSignature(config as Record<string, unknown>, {
              sczfwHeaders,
              clientSignatureSalt,
              clientSignatureClientId,
            });
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
