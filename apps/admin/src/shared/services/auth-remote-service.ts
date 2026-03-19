import { obHttp } from '@one-base-template/core';
import type { ApiResponse } from '@/shared/api/types';

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
  return obHttp().get<ApiResponse<LoginPageConfig>>('/cmict/portal/getLoginPage', {
    $noErrorAlert: true
  });
}

export async function loginByZhxt(token: string) {
  return obHttp().get<ApiResponse<TokenResult>>('/cmict/auth/external/zhxt/sso', {
    params: { 'zhxt-token': token },
    $isAuth: true,
    $throwOnBizError: true
  });
}

export async function loginByYdbg(token: string) {
  return obHttp().get<ApiResponse<TokenResult>>('/cmict/auth/external/ydbg/sso', {
    params: {
      'ydbg-token': token,
      appType: 2
    },
    $isAuth: true,
    $throwOnBizError: true
  });
}

export async function loginByTicket(payload: { ticket: string; serviceUrl: string }) {
  return obHttp().get<ApiResponse<TokenResult>>('/cmict/auth/ticket/sso', {
    params: payload,
    $isAuth: true,
    $throwOnBizError: true
  });
}

export async function loginByExternal(payload: { from: 'om' | 'portal'; token: string }) {
  return obHttp().get<ApiResponse<TokenResult>>(`/cmict/auth/external/${payload.from}/sso`, {
    params: { token: payload.token },
    $isAuth: true,
    $throwOnBizError: true
  });
}

export async function loginByDesktop() {
  return obHttp().post<ApiResponse<IdTokenResult>>('/cmict/uaa/unity-desktop/sso-login', {
    $noErrorAlert: true
  });
}
