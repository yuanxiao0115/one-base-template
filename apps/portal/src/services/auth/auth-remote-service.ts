import { obHttp } from '@one-base-template/core';
import type { PortalFrontConfig } from '@one-base-template/core';
import { appPortalSsoApiConfig } from '@/config/sso';

export interface PortalBizResponse<T> {
  code?: unknown;
  success?: boolean;
  message?: string;
  data?: T;
  encrypted?: boolean;
}

export interface PortalLoginPageConfig {
  webLogoText?: string;
  loginPageFodders?: string[];
  [k: string]: unknown;
}

export async function getLoginPageConfig() {
  return obHttp().get<PortalBizResponse<PortalLoginPageConfig>>(
    appPortalSsoApiConfig.loginPageConfigEndpoint,
    {
      $noErrorAlert: true
    }
  );
}

export async function getPortalFrontConfig() {
  return obHttp().get<PortalBizResponse<PortalFrontConfig>>(
    appPortalSsoApiConfig.portalFrontConfigEndpoint,
    {
      $noErrorAlert: true
    }
  );
}
