import { obHttp } from '@one-base-template/core';

interface BizResponse<T> {
  code?: unknown;
  success?: boolean;
  message?: string;
  data?: T;
  encrypted?: boolean;
}

export interface LoginPageConfig {
  webLogoText?: string;
  loginPageFodders?: string[];
  [k: string]: unknown;
}

export async function getLoginPageConfig() {
  return obHttp().get<BizResponse<LoginPageConfig>>('/cmict/portal/getLoginPage', {
    $noErrorAlert: true
  });
}
