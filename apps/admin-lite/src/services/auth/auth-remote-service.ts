import { obHttp } from '@one-base-template/core';
import { authApi } from '@/config/auth';
import type { ApiResponse } from '@/types/api';

export interface TokenResult {
  authToken?: string;
  token?: string;
  [k: string]: unknown;
}

export interface IdTokenResult {
  idToken?: string;
  [k: string]: unknown;
}

export interface LoginPageConfig {
  webLogoText?: string;
  loginPageFodders?: string[];
  [k: string]: unknown;
}

export async function getLoginPageConfig() {
  return obHttp().get<ApiResponse<LoginPageConfig>>(authApi.loginPageConfigEndpoint, {
    $noErrorAlert: true
  });
}

export async function loginByZhxt(token: string) {
  return obHttp().get<ApiResponse<TokenResult>>(authApi.externalSsoEndpoints.zhxtSsoEndpoint, {
    params: { 'zhxt-token': token },
    $isAuth: true,
    $throwOnBizError: true
  });
}

export async function loginByYdbg(token: string) {
  return obHttp().get<ApiResponse<TokenResult>>(authApi.externalSsoEndpoints.ydbgSsoEndpoint, {
    params: {
      'ydbg-token': token,
      appType: 2
    },
    $isAuth: true,
    $throwOnBizError: true
  });
}

export async function loginByTicket(payload: { ticket: string; serviceUrl: string }) {
  return obHttp().get<ApiResponse<TokenResult>>(authApi.ticketSsoEndpoint, {
    params: payload,
    $isAuth: true,
    $throwOnBizError: true
  });
}

export async function loginByExternal(payload: { from: 'om' | 'portal'; token: string }) {
  const externalEndpointBySource = {
    om: authApi.externalSsoEndpoints.omSsoEndpoint,
    portal: authApi.externalSsoEndpoints.portalSsoEndpoint
  } as const;

  return obHttp().get<ApiResponse<TokenResult>>(
    externalEndpointBySource[payload.from],
    {
      params: { token: payload.token },
      $isAuth: true,
      $throwOnBizError: true
    }
  );
}

export async function loginByDesktop() {
  return obHttp().post<ApiResponse<IdTokenResult>>(
    authApi.externalSsoEndpoints.desktopSsoLoginEndpoint,
    {
      $noErrorAlert: true
    }
  );
}
