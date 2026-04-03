import { type AuthApiConfig, type CoreOptions } from '@one-base-template/core';
import { routePaths } from '@/router/constants';

/** 认证接口配置 */
export const authApi: AuthApiConfig = {
  /** 登录页配置接口 */
  loginPageConfigEndpoint: '/cmict/portal/getLoginPage',
  /** ticket 换 token 接口 */
  ticketSsoEndpoint: '/cmict/auth/ticket/sso',
  /** 外部系统 SSO 端点集合 */
  externalSsoEndpoints: {
    /** 综治系统 SSO 接口 */
    zhxtSsoEndpoint: '/cmict/auth/external/zhxt/sso',
    /** 一队包干系统 SSO 接口 */
    ydbgSsoEndpoint: '/cmict/auth/external/ydbg/sso',
    /** 桌面端 SSO 登录接口 */
    desktopSsoLoginEndpoint: '/cmict/uaa/unity-desktop/sso-login',
    /** OM 外部系统 SSO 接口 */
    omSsoEndpoint: '/cmict/auth/external/om/sso',
    /** 门户外部系统 SSO 接口 */
    portalSsoEndpoint: '/cmict/auth/external/portal/sso'
  }
};

/** SSO 策略配置 */
export const sso: CoreOptions['sso'] = {
  /** 是否启用 SSO 回调 */
  enabled: true,
  /** SSO 回调路由 */
  routePath: routePaths.sso,
  /** SSO 参数解析策略优先级 */
  strategies: [
    {
      /** token 直登策略 */
      type: 'token',
      paramNames: ['token', 'access_token'],
      exchange: 'adapter'
    },
    {
      /** ticket 换 token 策略 */
      type: 'ticket',
      paramNames: ['ticket'],
      serviceUrlParam: 'serviceUrl'
    },
    {
      /** OAuth code 策略 */
      type: 'oauth',
      codeParam: 'code',
      stateParam: 'state',
      redirectUri: undefined
    }
  ]
};
