import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { startSsoScenario } from '@/services/auth/auth-scenario-provider';
import {
  loginByDesktop,
  loginByExternal,
  loginByTicket,
  loginByZhxt
} from '@/services/auth/auth-remote-service';

vi.mock('@/services/auth/auth-remote-service', () => {
  return {
    loginByZhxt: vi.fn(),
    loginByYdbg: vi.fn(),
    loginByTicket: vi.fn(),
    loginByExternal: vi.fn(),
    loginByDesktop: vi.fn()
  };
});

describe('services/auth/auth-scenario-provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('startSsoScenario: default 场景应走默认回调并跳转', async () => {
    const onDefaultSsoCallback = vi.fn(async () => ({ redirect: '/dashboard' }));
    const onAuthenticatedRedirect = vi.fn(async () => {});
    const onFinalizeAuthSession = vi.fn(async () => {});

    await startSsoScenario({
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

  it('startSsoScenario: basic 命中 type+token 应写入 token 并完成会话', async () => {
    const setItem = vi.fn();
    const onAuthenticatedRedirect = vi.fn(async () => {});
    const onFinalizeAuthSession = vi.fn(async () => {});

    await startSsoScenario({
      backend: 'basic',
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

  it('startSsoScenario: basic 命中 zhxt 但无 authToken 应抛错', async () => {
    vi.mocked(loginByZhxt).mockResolvedValue({
      code: 200,
      message: '智慧协同单点登录失败',
      data: {}
    } as never);

    await expect(
      startSsoScenario({
        backend: 'basic',
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

  it('startSsoScenario: basic 命中 ticket 时应优先透传 serviceUrl', async () => {
    vi.mocked(loginByTicket).mockResolvedValue({
      code: 200,
      message: 'success',
      data: {
        authToken: 'ticket-auth-token'
      }
    } as never);

    const setItem = vi.fn();
    const onFinalizeAuthSession = vi.fn(async () => {});
    const onAuthenticatedRedirect = vi.fn(async () => {});

    await startSsoScenario({
      backend: 'basic',
      baseUrl: '/',
      tokenKey: 'token-key',
      idTokenKey: 'id-token-key',
      searchParams: new URLSearchParams({
        ticket: 'st-001',
        serviceUrl: 'https://sso.example.com/portal/sso',
        redirect: '/portal/index'
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

    expect(loginByTicket).toHaveBeenCalledWith({
      ticket: 'st-001',
      serviceUrl: 'https://sso.example.com/portal/sso'
    });
    expect(setItem).toHaveBeenCalledWith('token-key', 'ticket-auth-token');
    expect(onFinalizeAuthSession).toHaveBeenCalledTimes(1);
    expect(onAuthenticatedRedirect).toHaveBeenCalledWith('/portal/index');
  });

  it('startSsoScenario: basic ticket 未携带 serviceUrl 时应回退 redirectUrl', async () => {
    vi.mocked(loginByTicket).mockResolvedValue({
      code: 200,
      message: 'success',
      data: {
        authToken: 'ticket-auth-token'
      }
    } as never);

    await startSsoScenario({
      backend: 'basic',
      baseUrl: '/',
      tokenKey: 'token-key',
      idTokenKey: 'id-token-key',
      searchParams: new URLSearchParams({
        ticket: 'st-002',
        redirectUrl: 'portal/sso',
        redirect: '/home/index'
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
    });

    expect(loginByTicket).toHaveBeenCalledWith({
      ticket: 'st-002',
      serviceUrl: 'https://example.com/portal/sso'
    });
  });

  it('startSsoScenario: basic 无有效参数应抛错', async () => {
    await expect(
      startSsoScenario({
        backend: 'basic',
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

  it('startSsoScenario: basic 命中 moaToken 应写入 idToken', async () => {
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

    await startSsoScenario({
      backend: 'basic',
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
