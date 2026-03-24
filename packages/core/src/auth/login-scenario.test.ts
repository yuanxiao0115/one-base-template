import { describe, expect, it } from 'vite-plus/test';
import { buildLoginScenario } from './login-scenario';

describe('auth/login-scenario', () => {
  it('default 场景应关闭验证登录与登录配置加载', () => {
    const scenario = buildLoginScenario({
      backend: 'default',
      routeQuery: {
        token: 'direct-token'
      },
      verifyLoginFallback: '/home/index'
    });

    expect(scenario.useVerifyLogin).toBe(false);
    expect(scenario.shouldLoadLoginPageConfig).toBe(false);
    expect(scenario.fallback).toBe('/');
    expect(scenario.directLoginToken).toBeNull();
  });

  it('basic 场景应开启验证登录并提取直登 token', () => {
    const scenario = buildLoginScenario({
      backend: 'basic',
      routeQuery: {
        token: 'direct-token'
      },
      verifyLoginFallback: '/home/index'
    });

    expect(scenario.useVerifyLogin).toBe(true);
    expect(scenario.shouldLoadLoginPageConfig).toBe(true);
    expect(scenario.fallback).toBe('/home/index');
    expect(scenario.directLoginToken).toBe('direct-token');
  });
});
