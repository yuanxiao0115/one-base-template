import type { CoreOptions } from '@one-base-template/core';
import { routePaths } from '@/router/constants';

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
