import { resolveAppRedirectTarget, startSsoCallbackStrategy } from '@one-base-template/core';
import { DEFAULT_FALLBACK_HOME } from '@/config/systems';
import type { BackendKind } from '@/config/env';
import {
  loginByDesktop,
  loginByExternal,
  loginByTicket,
  loginByYdbg,
  loginByZhxt
} from '@/services/auth/auth-remote-service';

interface StorageLike {
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

interface LocationLike {
  origin: string;
  href: string;
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

export async function startSsoScenario(options: ExecuteSsoScenarioOptions) {
  const {
    backend,
    baseUrl,
    tokenKey,
    idTokenKey,
    searchParams,
    onDefaultSsoCallback,
    onAuthenticatedRedirect,
    onFinalizeAuthSession
  } = options;

  const storage = options.storage ?? localStorage;
  const locationLike = options.locationLike ?? window.location;

  if (backend !== 'basic') {
    const { redirect } = await onDefaultSsoCallback();
    const target = resolveAppRedirectTarget(redirect, {
      fallback: DEFAULT_FALLBACK_HOME,
      baseUrl
    });
    await onAuthenticatedRedirect(target);
    return;
  }

  const redirectUrlRaw = searchParams.get('redirectUrl') ?? searchParams.get('redirect');
  const redirect = resolveAppRedirectTarget(redirectUrlRaw, {
    fallback: DEFAULT_FALLBACK_HOME,
    baseUrl
  });

  async function setTokenAndBootstrap(token: string) {
    storage.setItem(tokenKey, token);
    await onFinalizeAuthSession();
    await onAuthenticatedRedirect(redirect);
  }

  async function loginByZhxtToken(token: string) {
    const res = await loginByZhxt(token);
    const authToken = res.data?.authToken;
    if (!authToken) {
      throw new Error(res.message || '智慧协同单点登录失败');
    }
    await setTokenAndBootstrap(authToken);
  }

  async function loginByYdbgToken(token: string) {
    const res = await loginByYdbg(token);
    const authToken = res.data?.authToken;
    if (!authToken) {
      throw new Error(res.message || '移动办公单点登录失败');
    }
    await setTokenAndBootstrap(authToken);
  }

  async function loginByTicketToken(ticket: string, ticketRedirectUrlRaw: string | null) {
    const serviceUrl = ticketRedirectUrlRaw
      ? `${locationLike.origin}/${ticketRedirectUrlRaw}`
      : locationLike.href;

    const res = await loginByTicket({
      ticket,
      serviceUrl
    });

    const authToken = res.data?.authToken;
    if (!authToken) {
      throw new Error(res.message || '票据验证失败');
    }
    await setTokenAndBootstrap(authToken);
  }

  async function loginByExternalSso(params: { from: 'om' | 'portal'; token: string }) {
    const res = await loginByExternal({
      from: params.from,
      token: params.token
    });

    const authToken = res.data?.token ?? res.data?.authToken;
    if (!authToken) {
      throw new Error(res.message || 'SSO 登录失败');
    }
    storage.setItem(tokenKey, authToken);

    const ssoRes = await loginByDesktop();
    const idToken = ssoRes.data?.idToken;
    if (idToken) {
      storage.setItem(idTokenKey, idToken);
    }

    await setTokenAndBootstrap(authToken);
  }

  await startSsoCallbackStrategy({
    searchParams,
    handlers: {
      onZhxt: async ({ token }) => {
        await loginByZhxtToken(token);
      },
      onYdbg: async ({ token }) => {
        await loginByYdbgToken(token);
      },
      onTicket: async ({ ticket, redirectUrlRaw: ticketRedirectUrlRaw }) => {
        await loginByTicketToken(ticket, ticketRedirectUrlRaw);
      },
      onTypeToken: async ({ token }) => {
        await setTokenAndBootstrap(token);
      },
      onMoaToken: async ({ token }) => {
        await loginByExternalSso({
          from: 'om',
          token
        });
      },
      onUserToken: async ({ token }) => {
        await loginByExternalSso({
          from: 'portal',
          token
        });
      }
    }
  });
}
