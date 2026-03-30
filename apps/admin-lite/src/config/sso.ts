import type { CoreOptions } from '@one-base-template/core';
import { routePaths } from '@/router/constants';

/**
 * SSO 配置（认证入口 / 回调路由固定为 /sso）。
 *
 * 说明：
 * - core 会用该路径识别 SSO 认证入口，并复用登录入口的守卫分支
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
