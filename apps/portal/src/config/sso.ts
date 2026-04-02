import type { CoreOptions } from '@one-base-template/core';
import { APP_SSO_ROUTE_PATH } from '@/router/constants';

export interface AppPortalSsoApiConfig {
  loginPageConfigEndpoint: string;
  portalFrontConfigEndpoint: string;
  ticketSsoEndpoint: string;
}

export const appPortalSsoApiConfig: AppPortalSsoApiConfig = {
  loginPageConfigEndpoint: '/cmict/portal/getLoginPage',
  portalFrontConfigEndpoint: '/cmict/admin/front-config/portal',
  ticketSsoEndpoint: '/cmict/auth/ticket/sso'
};

/**
 * portal SSO 配置统一入口。
 *
 * 说明：
 * - 认证入口固定 `/sso`；
 * - 策略按 token -> ticket -> oauth 顺序匹配。
 */
export const appSsoOptions: CoreOptions['sso'] = {
  enabled: true,
  routePath: APP_SSO_ROUTE_PATH,
  strategies: [
    {
      type: 'token',
      paramNames: ['token', 'access_token'],
      exchange: 'adapter'
    },
    {
      type: 'ticket',
      paramNames: ['ticket'],
      serviceUrlParam: 'serviceUrl'
    },
    {
      type: 'oauth',
      codeParam: 'code',
      stateParam: 'state',
      redirectUri: undefined
    }
  ]
};
