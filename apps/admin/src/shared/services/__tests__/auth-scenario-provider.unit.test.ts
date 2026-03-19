import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { DEFAULT_FALLBACK_HOME } from '@/config/systems';

import { executeSsoScenario, resolveLoginScenario } from '../auth-scenario-provider';
import { loginByDesktop, loginByExternal, loginByZhxt } from '../auth-remote-service';

vi.mock('../auth-remote-service', () => {
  return {
    loginByZhxt: vi.fn(),
    loginByYdbg: vi.fn(),
    loginByTicket: vi.fn(),
    loginByExternal: vi.fn(),
    loginByDesktop: vi.fn()
  };
});

describe('shared/services/auth-scenario-provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolveLoginScenario: default 场景应关闭验证登录与登录配置加载', () => {
    const scenario = resolveLoginScenario({
      backend: 'default',
      routeQuery: {
        token: 'direct-token'
      }
    });

    expect(scenario.useVerifyLogin).toBe(false);
    expect(scenario.shouldLoadLoginPageConfig).toBe(false);
    expect(scenario.fallback).toBe('/');
    expect(scenario.directLoginToken).toBeNull();
  });

  it('resolveLoginScenario: sczfw 场景应开启验证登录并提取直登 token', () => {
    const scenario = resolveLoginScenario({
      backend: 'sczfw',
      routeQuery: {
        token: 'direct-token'
      }
    });

    expect(scenario.useVerifyLogin).toBe(true);
    expect(scenario.shouldLoadLoginPageConfig).toBe(true);
    expect(scenario.fallback).toBe(DEFAULT_FALLBACK_HOME);
    expect(scenario.directLoginToken).toBe('direct-token');
  });

  it('executeSsoScenario: default 场景应走默认回调并跳转', async () => {
    const onDefaultSsoCallback = vi.fn(async () => ({ redirect: '/dashboard' }));
    const onAuthenticatedRedirect = vi.fn(async () => {});
    const onFinalizeAuthSession = vi.fn(async () => {});

    await executeSsoScenario({
      backend: 'default',
      baseUrl: '/admin/',
      tokenKey: 'token-key',
      idTokenKey: 'id-token-key',
      searchParams: new URLSearchParams(),
      onDefaultSsoCallback,
      onAuthenticatedRedirect,
      onFinalizeAuthSession,
      storage: {
        setItem: vi.fn(),
        removeItem: vi.fn()
      },
      locationLike: {
        origin: 'https://example.com',
        href: 'https://example.com/admin/sso/callback'
      }
    });

    expect(onDefaultSsoCallback).toHaveBeenCalledTimes(1);
    expect(onAuthenticatedRedirect).toHaveBeenCalledWith('/dashboard');
    expect(onFinalizeAuthSession).not.toHaveBeenCalled();
  });

  it('executeSsoScenario: sczfw 命中 type+token 应写入 token 并完成会话', async () => {
    const setItem = vi.fn();
    const onAuthenticatedRedirect = vi.fn(async () => {});
    const onFinalizeAuthSession = vi.fn(async () => {});

    await executeSsoScenario({
      backend: 'sczfw',
      baseUrl: '/',
      tokenKey: 'token-key',
      idTokenKey: 'id-token-key',
      searchParams: new URLSearchParams({
        type: 'external',
        token: 'type-token',
        redirect: '/home/index'
      }),
      onDefaultSsoCallback: vi.fn(async () => ({ redirect: '/unused' })),
      onAuthenticatedRedirect,
      onFinalizeAuthSession,
      storage: {
        setItem,
        removeItem: vi.fn()
      },
      locationLike: {
        origin: 'https://example.com',
        href: 'https://example.com/sso/callback'
      }
    });

    expect(setItem).toHaveBeenCalledWith('token-key', 'type-token');
    expect(onFinalizeAuthSession).toHaveBeenCalledTimes(1);
    expect(onAuthenticatedRedirect).toHaveBeenCalledWith('/home/index');
  });

  it('executeSsoScenario: sczfw 命中 zhxt 但无 authToken 应抛错', async () => {
    vi.mocked(loginByZhxt).mockResolvedValue({
      code: 200,
      message: '智慧协同单点登录失败',
      data: {}
    } as never);

    await expect(
      executeSsoScenario({
        backend: 'sczfw',
        baseUrl: '/',
        tokenKey: 'token-key',
        idTokenKey: 'id-token-key',
        searchParams: new URLSearchParams({
          sourceCode: 'zhxt',
          token: 'zhxt-token'
        }),
        onDefaultSsoCallback: vi.fn(async () => ({ redirect: '/unused' })),
        onAuthenticatedRedirect: vi.fn(async () => {}),
        onFinalizeAuthSession: vi.fn(async () => {}),
        storage: {
          setItem: vi.fn(),
          removeItem: vi.fn()
        },
        locationLike: {
          origin: 'https://example.com',
          href: 'https://example.com/sso/callback'
        }
      })
    ).rejects.toThrowError('智慧协同单点登录失败');
  });

  it('executeSsoScenario: sczfw 无有效参数应抛错', async () => {
    await expect(
      executeSsoScenario({
        backend: 'sczfw',
        baseUrl: '/',
        tokenKey: 'token-key',
        idTokenKey: 'id-token-key',
        searchParams: new URLSearchParams(),
        onDefaultSsoCallback: vi.fn(async () => ({ redirect: '/unused' })),
        onAuthenticatedRedirect: vi.fn(async () => {}),
        onFinalizeAuthSession: vi.fn(async () => {}),
        storage: {
          setItem: vi.fn(),
          removeItem: vi.fn()
        },
        locationLike: {
          origin: 'https://example.com',
          href: 'https://example.com/sso/callback'
        }
      })
    ).rejects.toThrowError('登录参数无效');
  });

  it('executeSsoScenario: sczfw 命中 moaToken 应写入 idToken', async () => {
    vi.mocked(loginByExternal).mockResolvedValue({
      code: 200,
      message: 'success',
      data: {
        authToken: 'external-auth-token'
      }
    } as never);
    vi.mocked(loginByDesktop).mockResolvedValue({
      code: 200,
      data: {
        idToken: 'desktop-id-token'
      }
    } as never);

    const setItem = vi.fn();

    await executeSsoScenario({
      backend: 'sczfw',
      baseUrl: '/',
      tokenKey: 'token-key',
      idTokenKey: 'id-token-key',
      searchParams: new URLSearchParams({
        moaToken: 'moa-token'
      }),
      onDefaultSsoCallback: vi.fn(async () => ({ redirect: '/unused' })),
      onAuthenticatedRedirect: vi.fn(async () => {}),
      onFinalizeAuthSession: vi.fn(async () => {}),
      storage: {
        setItem,
        removeItem: vi.fn()
      },
      locationLike: {
        origin: 'https://example.com',
        href: 'https://example.com/sso/callback'
      }
    });

    expect(setItem).toHaveBeenCalledWith('id-token-key', 'desktop-id-token');
  });
});
