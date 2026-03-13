import { ElMessage } from "element-plus";
import type { Pinia } from "pinia";
import type { Router } from "vue-router";
import { createObHttp, type ObHttp, useAuthStore, useMenuStore, useSystemStore } from "@one-base-template/core";

import type { AuthMode, BackendKind } from "../infra/env";
import { routePaths } from "../router/constants";

function resetTagStore() {
  // 统一走单启动链路后，未授权时始终清空 tags，避免残留上一个会话的页签状态。
  void import("@one-base-template/tag/store").then(({ useTagStoreHook }) => {
    useTagStoreHook().handleTags("equal", []);
  });
}

async function appendSczfwClientSignature(
  config: Record<string, unknown>,
  params: {
    sczfwHeaders?: Record<string, string>;
    clientSignatureSalt?: string;
    clientSignatureClientId?: string;
  }
) {
  // 仅在请求真正发出前再按需加载 gm-crypto，避免把签名依赖拉进 admin 冷启动链。
  const { createClientSignature } = await import("../infra/sczfw/client-signature");
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
      // 开发环境推荐使用 Vite proxy（同源），生产环境如需跨域可配置 VITE_API_BASE_URL 直连
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
      // 默认约定 { code, data, message } 且 code=0/200 成功；不稳定时可通过 app 层覆盖这些策略
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
        // 仅做“清状态 + 回登录页”，具体跳转/SSO 可由业务项目再扩展
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(idTokenKey);
        useAuthStore(pinia).reset();
        useMenuStore(pinia).reset();
        useSystemStore(pinia).reset();
        resetTagStore();
        router.replace(routePaths.login);
      },
    },
  });
}
