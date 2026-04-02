import type { CoreOptions } from '@one-base-template/core';
import { routePaths } from '@/router/constants';

export interface TicketServiceUrlLocationLike {
  origin: string;
  href: string;
}

export interface AppAuthSsoApiConfig {
  loginPageConfigEndpoint: string;
  zhxtSsoEndpoint: string;
  ydbgSsoEndpoint: string;
  ticketSsoEndpoint: string;
  desktopSsoLoginEndpoint: string;
  externalSsoEndpoints: Record<'om' | 'portal', string>;
}

/**
 * 应用侧 SSO 远端接口配置统一入口。
 *
 * 维护建议：
 * - 对接新 auth 服务时只改这里，不在 service 文件散落硬编码。
 * - 仅维护本应用真实使用的接口，避免“配置看起来全但没人消费”。
 */
export const appAuthSsoApiConfig: AppAuthSsoApiConfig = {
  loginPageConfigEndpoint: '/cmict/portal/getLoginPage',
  zhxtSsoEndpoint: '/cmict/auth/external/zhxt/sso',
  ydbgSsoEndpoint: '/cmict/auth/external/ydbg/sso',
  ticketSsoEndpoint: '/cmict/auth/ticket/sso',
  desktopSsoLoginEndpoint: '/cmict/uaa/unity-desktop/sso-login',
  externalSsoEndpoints: {
    om: '/cmict/auth/external/om/sso',
    portal: '/cmict/auth/external/portal/sso'
  }
};

function isAbsoluteHttpUrl(value: string) {
  return value.startsWith('http://') || value.startsWith('https://');
}

/**
 * ticket 场景 serviceUrl 解析规则：
 * 1. 优先使用 URL 显式透传的 serviceUrl（与后端 ticket 契约对齐）；
 * 2. 其次使用 redirectUrl 推导绝对地址；
 * 3. 最后兜底当前回调地址。
 */
export function resolveTicketServiceUrl(params: {
  serviceUrlRaw: string | null;
  redirectUrlRaw: string | null;
  locationLike: TicketServiceUrlLocationLike;
}) {
  const { serviceUrlRaw, redirectUrlRaw, locationLike } = params;

  if (serviceUrlRaw && serviceUrlRaw.trim()) {
    return serviceUrlRaw.trim();
  }

  if (redirectUrlRaw && redirectUrlRaw.trim()) {
    const normalizedRedirectUrl = redirectUrlRaw.trim();
    if (isAbsoluteHttpUrl(normalizedRedirectUrl)) {
      return normalizedRedirectUrl;
    }

    if (normalizedRedirectUrl.startsWith('/')) {
      return `${locationLike.origin}${normalizedRedirectUrl}`;
    }

    return `${locationLike.origin}/${normalizedRedirectUrl}`;
  }

  return locationLike.href;
}

/**
 * SSO 配置（认证入口 / 回调路由固定为 /sso）。
 */
export const appSsoOptions: CoreOptions['sso'] = {
  enabled: true,
  routePath: routePaths.sso,
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
