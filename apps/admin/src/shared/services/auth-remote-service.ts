import { getAppHttpClient } from "@/shared/api/http-client";

interface BizResponse<T> {
  code?: unknown;
  data?: T;
  message?: string;
}

interface TokenResult {
  authToken?: string;
  token?: string;
  [k: string]: unknown;
}

interface IdTokenResult {
  idToken?: string;
  [k: string]: unknown;
}

interface LoginPageConfig {
  webLogoText?: string;
  loginPageFodders?: string[];
  [k: string]: unknown;
}

function getHttp() {
  return getAppHttpClient();
}

export async function getLoginPageConfig() {
  return getHttp().get<BizResponse<LoginPageConfig>>("/cmict/portal/getLoginPage", {
    $noErrorAlert: true,
  });
}

export async function loginByZhxt(token: string) {
  return getHttp().get<BizResponse<TokenResult>>("/cmict/auth/external/zhxt/sso", {
    params: { "zhxt-token": token },
    $isAuth: true,
    $throwOnBizError: true,
  });
}

export async function loginByYdbg(token: string) {
  return getHttp().get<BizResponse<TokenResult>>("/cmict/auth/external/ydbg/sso", {
    params: {
      "ydbg-token": token,
      appType: 2,
    },
    $isAuth: true,
    $throwOnBizError: true,
  });
}

export async function loginByTicket(payload: { ticket: string; serviceUrl: string }) {
  return getHttp().get<BizResponse<TokenResult>>("/cmict/auth/ticket/sso", {
    params: payload,
    $isAuth: true,
    $throwOnBizError: true,
  });
}

export async function loginByExternal(payload: { from: "om" | "portal"; token: string }) {
  return getHttp().get<BizResponse<TokenResult>>(`/cmict/auth/external/${payload.from}/sso`, {
    params: { token: payload.token },
    $isAuth: true,
    $throwOnBizError: true,
  });
}

export async function loginByDesktop() {
  return getHttp().post<BizResponse<IdTokenResult>>("/cmict/uaa/unity-desktop/sso-login", {
    $noErrorAlert: true,
  });
}
