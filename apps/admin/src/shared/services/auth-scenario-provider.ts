import { DEFAULT_FALLBACK_HOME } from "@/config/systems";
import type { BackendKind } from "@/infra/env";
import { getAppRedirectTarget } from "@/router/redirect";
import {
  loginByDesktop,
  loginByExternal,
  loginByTicket,
  loginByYdbg,
  loginByZhxt,
} from "@/shared/services/auth-remote-service";
import { executeSsoCallbackStrategy } from "@/shared/services/sso-callback-strategy";

interface RouteQueryLike {
  token?: unknown;
}

interface StorageLike {
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

interface LocationLike {
  origin: string;
  href: string;
}

export interface LoginScenario {
  useVerifyLogin: boolean;
  shouldLoadLoginPageConfig: boolean;
  fallback: string;
  directLoginToken: string | null;
}

export interface ResolveLoginScenarioOptions {
  backend: BackendKind;
  routeQuery: RouteQueryLike;
}

export interface ExecuteSsoScenarioOptions {
  backend: BackendKind;
  baseUrl: string;
  tokenKey: string;
  idTokenKey: string;
  searchParams: URLSearchParams;
  onDefaultSsoCallback: () => Promise<{ redirect: string }>;
  onAuthenticatedRedirect: (redirect: string) => Promise<void>;
  onFinalizeAuthSession: () => Promise<void>;
  storage?: StorageLike;
  locationLike?: LocationLike;
}

function pickDirectLoginToken(routeQuery: RouteQueryLike, enabled: boolean) {
  if (!enabled) {
    return null;
  }

  return typeof routeQuery.token === "string" && routeQuery.token ? routeQuery.token : null;
}

function resolveLoginFallback(backend: BackendKind) {
  return backend === "sczfw" ? DEFAULT_FALLBACK_HOME : "/";
}

export function resolveLoginScenario(options: ResolveLoginScenarioOptions): LoginScenario {
  const { backend, routeQuery } = options;
  const useSczfwScenario = backend === "sczfw";

  return {
    useVerifyLogin: useSczfwScenario,
    shouldLoadLoginPageConfig: useSczfwScenario,
    fallback: resolveLoginFallback(backend),
    directLoginToken: pickDirectLoginToken(routeQuery, useSczfwScenario),
  };
}

export async function executeSsoScenario(options: ExecuteSsoScenarioOptions) {
  const {
    backend,
    baseUrl,
    tokenKey,
    idTokenKey,
    searchParams,
    onDefaultSsoCallback,
    onAuthenticatedRedirect,
    onFinalizeAuthSession,
  } = options;

  const storage = options.storage ?? localStorage;
  const locationLike = options.locationLike ?? window.location;

  if (backend !== "sczfw") {
    const { redirect } = await onDefaultSsoCallback();
    const target = getAppRedirectTarget(redirect, {
      fallback: DEFAULT_FALLBACK_HOME,
      baseUrl,
    });
    await onAuthenticatedRedirect(target);
    return;
  }

  const redirectUrlRaw = searchParams.get("redirectUrl") ?? searchParams.get("redirect");
  const redirect = getAppRedirectTarget(redirectUrlRaw, {
    fallback: DEFAULT_FALLBACK_HOME,
    baseUrl,
  });

  async function setTokenAndBootstrap(token: string) {
    storage.setItem(tokenKey, token);
    await onFinalizeAuthSession();
    await onAuthenticatedRedirect(redirect);
  }

  async function handleZhxt(token: string) {
    const res = await loginByZhxt(token);
    const authToken = res.data?.authToken;
    if (!authToken) {
      throw new Error(res.message || "智慧协同单点登录失败");
    }
    await setTokenAndBootstrap(authToken);
  }

  async function handleYdbg(token: string) {
    const res = await loginByYdbg(token);
    const authToken = res.data?.authToken;
    if (!authToken) {
      throw new Error(res.message || "移动办公单点登录失败");
    }
    await setTokenAndBootstrap(authToken);
  }

  async function handleTicket(ticket: string, ticketRedirectUrlRaw: string | null) {
    const serviceUrl = ticketRedirectUrlRaw ? `${locationLike.origin}/${ticketRedirectUrlRaw}` : locationLike.href;

    const res = await loginByTicket({
      ticket,
      serviceUrl,
    });

    const authToken = res.data?.authToken;
    if (!authToken) {
      throw new Error(res.message || "票据验证失败");
    }
    await setTokenAndBootstrap(authToken);
  }

  async function handleExternalSso(params: { from: "om" | "portal"; token: string }) {
    const res = await loginByExternal({
      from: params.from,
      token: params.token,
    });

    const authToken = res.data?.token ?? res.data?.authToken;
    if (!authToken) {
      throw new Error(res.message || "SSO 登录失败");
    }
    storage.setItem(tokenKey, authToken);

    const ssoRes = await loginByDesktop();
    const idToken = ssoRes.data?.idToken;
    if (idToken) {
      storage.setItem(idTokenKey, idToken);
    }

    await setTokenAndBootstrap(authToken);
  }

  await executeSsoCallbackStrategy({
    searchParams,
    handlers: {
      onZhxt: async ({ token }) => {
        await handleZhxt(token);
      },
      onYdbg: async ({ token }) => {
        await handleYdbg(token);
      },
      onTicket: async ({ ticket, redirectUrlRaw: ticketRedirectUrlRaw }) => {
        await handleTicket(ticket, ticketRedirectUrlRaw);
      },
      onTypeToken: async ({ token }) => {
        await setTokenAndBootstrap(token);
      },
      onMoaToken: async ({ token }) => {
        await handleExternalSso({
          from: "om",
          token,
        });
      },
      onUserToken: async ({ token }) => {
        await handleExternalSso({
          from: "portal",
          token,
        });
      },
    },
  });
}
