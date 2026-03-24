import type { CoreOptions } from '@one-base-template/core';
import { routePaths } from '@/router/constants';

/**
 * SSO 配置（回调路由固定为 /sso）。
 *
 * 说明：
 * - core 的路由白名单/回调解析依赖该配置
 * - 业务项目如需对接更多入口参数或策略，可在这里扩展 strategies
 *
 * 维护建议：
 * - 常规 CRUD 开发一般不需要修改；
 * - 对接新 SSO 参数协议时再调整本文件。
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
