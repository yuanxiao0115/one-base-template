import { obHttp } from '@one-base-template/core';
import { appAuthSsoApiConfig } from '@/config/auth-sso';
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
  return obHttp().get<ApiResponse<LoginPageConfig>>(appAuthSsoApiConfig.loginPageConfigEndpoint, {
    $noErrorAlert: true
  });
}

export async function loginByZhxt(token: string) {
  return obHttp().get<ApiResponse<TokenResult>>(appAuthSsoApiConfig.zhxtSsoEndpoint, {
    params: { 'zhxt-token': token },
    $isAuth: true,
    $throwOnBizError: true
  });
}

export async function loginByYdbg(token: string) {
  return obHttp().get<ApiResponse<TokenResult>>(appAuthSsoApiConfig.ydbgSsoEndpoint, {
    params: {
      'ydbg-token': token,
      appType: 2
    },
    $isAuth: true,
    $throwOnBizError: true
  });
}

export async function loginByTicket(payload: { ticket: string; serviceUrl: string }) {
  return obHttp().get<ApiResponse<TokenResult>>(appAuthSsoApiConfig.ticketSsoEndpoint, {
    params: payload,
    $isAuth: true,
    $throwOnBizError: true
  });
}

export async function loginByExternal(payload: { from: 'om' | 'portal'; token: string }) {
  return obHttp().get<ApiResponse<TokenResult>>(
    appAuthSsoApiConfig.externalSsoEndpoints[payload.from],
    {
      params: { token: payload.token },
      $isAuth: true,
      $throwOnBizError: true
    }
  );
}

export async function loginByDesktop() {
  return obHttp().post<ApiResponse<IdTokenResult>>(appAuthSsoApiConfig.desktopSsoLoginEndpoint, {
    $noErrorAlert: true
  });
}
