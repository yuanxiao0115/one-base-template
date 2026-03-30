import { describe, expect, it, vi } from 'vite-plus/test';
import { startSsoScenario } from '@/services/auth/auth-scenario-provider';

vi.mock('@/services/auth/auth-remote-service', () => {
  return {
    loginByZhxt: vi.fn(),
    loginByYdbg: vi.fn(),
    loginByTicket: vi.fn(),
    loginByExternal: vi.fn(),
    loginByDesktop: vi.fn()
  };
});

describe('services/auth/sso-minimal-e2e', () => {
  it('SSO 回调命中 type+token 时应完成会话并落地跳转', async () => {
    const setItem = vi.fn();
    const onDefaultSsoCallback = vi.fn(async () => ({ redirect: '/unused' }));
    const onFinalizeAuthSession = vi.fn(async () => {});
    const onAuthenticatedRedirect = vi.fn(async () => {});

    await startSsoScenario({
      backend: 'basic',
      baseUrl: '/admin/',
      tokenKey: 'token',
      idTokenKey: 'idToken',
      searchParams: new URLSearchParams({
        type: 'external',
        token: 'auth-token',
        redirect: '/system/user'
      }),
      onDefaultSsoCallback,
      onFinalizeAuthSession,
      onAuthenticatedRedirect,
      storage: {
        setItem,
        removeItem: vi.fn()
      },
      locationLike: {
        origin: 'https://example.com',
        href: 'https://example.com/admin/sso'
      }
    });

    expect(setItem).toHaveBeenCalledWith('token', 'auth-token');
    expect(onDefaultSsoCallback).not.toHaveBeenCalled();
    expect(onFinalizeAuthSession).toHaveBeenCalledTimes(1);
    expect(onAuthenticatedRedirect).toHaveBeenCalledWith('/system/user');
  });
});
