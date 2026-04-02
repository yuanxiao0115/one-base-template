import { describe, expect, it, vi } from 'vite-plus/test';
import { startSsoCallbackStrategy } from './sso-callback-strategy';

describe('auth/sso-callback-strategy', () => {
  it('应按优先级优先命中 sourceCode=zhxt', async () => {
    const handlers = {
      onZhxt: vi.fn(async () => {}),
      onYdbg: vi.fn(async () => {}),
      onTicket: vi.fn(async () => {}),
      onTypeToken: vi.fn(async () => {}),
      onMoaToken: vi.fn(async () => {}),
      onUserToken: vi.fn(async () => {})
    };

    const searchParams = new URLSearchParams({
      sourceCode: 'zhxt',
      token: 'zhxt-token',
      ticket: 'ticket-1',
      type: 'external',
      moaToken: 'moa-1',
      Usertoken: 'user-1',
      redirectUrl: 'sso/redirect'
    });

    await startSsoCallbackStrategy({ searchParams, handlers });

    expect(handlers.onZhxt).toHaveBeenCalledWith({ token: 'zhxt-token' });
    expect(handlers.onYdbg).not.toHaveBeenCalled();
    expect(handlers.onTicket).not.toHaveBeenCalled();
  });

  it('应按优先级命中 sourceCode=YDBG', async () => {
    const handlers = {
      onZhxt: vi.fn(async () => {}),
      onYdbg: vi.fn(async () => {}),
      onTicket: vi.fn(async () => {}),
      onTypeToken: vi.fn(async () => {}),
      onMoaToken: vi.fn(async () => {}),
      onUserToken: vi.fn(async () => {})
    };

    const searchParams = new URLSearchParams({
      sourceCode: 'YDBG',
      token: 'ydbg-token',
      ticket: 'ticket-1',
      type: 'external'
    });

    await startSsoCallbackStrategy({ searchParams, handlers });

    expect(handlers.onYdbg).toHaveBeenCalledWith({ token: 'ydbg-token' });
    expect(handlers.onZhxt).not.toHaveBeenCalled();
    expect(handlers.onTicket).not.toHaveBeenCalled();
  });

  it('应按优先级命中 ticket 并透传 serviceUrl 与 redirectUrl', async () => {
    const handlers = {
      onZhxt: vi.fn(async () => {}),
      onYdbg: vi.fn(async () => {}),
      onTicket: vi.fn(async () => {}),
      onTypeToken: vi.fn(async () => {}),
      onMoaToken: vi.fn(async () => {}),
      onUserToken: vi.fn(async () => {})
    };

    const searchParams = new URLSearchParams({
      ticket: 'ticket-1',
      serviceUrl: 'https://sso.example.com/portal/sso',
      redirectUrl: 'oa/redirect',
      redirect: '/home/index'
    });

    await startSsoCallbackStrategy({ searchParams, handlers });

    expect(handlers.onTicket).toHaveBeenCalledWith({
      ticket: 'ticket-1',
      serviceUrlRaw: 'https://sso.example.com/portal/sso',
      redirectUrlRaw: 'oa/redirect'
    });
  });

  it('ticket 未携带 serviceUrl 时应透传 null', async () => {
    const handlers = {
      onZhxt: vi.fn(async () => {}),
      onYdbg: vi.fn(async () => {}),
      onTicket: vi.fn(async () => {}),
      onTypeToken: vi.fn(async () => {}),
      onMoaToken: vi.fn(async () => {}),
      onUserToken: vi.fn(async () => {})
    };

    await startSsoCallbackStrategy({
      searchParams: new URLSearchParams({
        ticket: 'ticket-1',
        redirectUrl: 'oa/redirect'
      }),
      handlers
    });

    expect(handlers.onTicket).toHaveBeenCalledWith({
      ticket: 'ticket-1',
      serviceUrlRaw: null,
      redirectUrlRaw: 'oa/redirect'
    });
  });

  it('应按优先级命中 type+token', async () => {
    const handlers = {
      onZhxt: vi.fn(async () => {}),
      onYdbg: vi.fn(async () => {}),
      onTicket: vi.fn(async () => {}),
      onTypeToken: vi.fn(async () => {}),
      onMoaToken: vi.fn(async () => {}),
      onUserToken: vi.fn(async () => {})
    };

    const searchParams = new URLSearchParams({
      type: 'external',
      token: 'type-token',
      moaToken: 'moa-1',
      Usertoken: 'user-1'
    });

    await startSsoCallbackStrategy({ searchParams, handlers });

    expect(handlers.onTypeToken).toHaveBeenCalledWith({
      type: 'external',
      token: 'type-token'
    });
  });

  it('应命中 moaToken 与 Usertoken', async () => {
    const handlers = {
      onZhxt: vi.fn(async () => {}),
      onYdbg: vi.fn(async () => {}),
      onTicket: vi.fn(async () => {}),
      onTypeToken: vi.fn(async () => {}),
      onMoaToken: vi.fn(async () => {}),
      onUserToken: vi.fn(async () => {})
    };

    await startSsoCallbackStrategy({
      searchParams: new URLSearchParams({ moaToken: 'moa-1' }),
      handlers
    });
    expect(handlers.onMoaToken).toHaveBeenCalledWith({ token: 'moa-1' });

    await startSsoCallbackStrategy({
      searchParams: new URLSearchParams({ Usertoken: 'user-1' }),
      handlers
    });
    expect(handlers.onUserToken).toHaveBeenCalledWith({ token: 'user-1' });
  });

  it('无有效参数时应抛错，命中分支时应透传 handler 异常', async () => {
    const handlers = {
      onZhxt: vi.fn(async () => {}),
      onYdbg: vi.fn(async () => {}),
      onTicket: vi.fn(async () => {
        throw new Error('ticket handler failed');
      }),
      onTypeToken: vi.fn(async () => {}),
      onMoaToken: vi.fn(async () => {}),
      onUserToken: vi.fn(async () => {})
    };

    await expect(
      startSsoCallbackStrategy({ searchParams: new URLSearchParams(), handlers })
    ).rejects.toThrowError('登录参数无效');

    await expect(
      startSsoCallbackStrategy({
        searchParams: new URLSearchParams({ ticket: 'ticket-1' }),
        handlers
      })
    ).rejects.toThrowError('ticket handler failed');
  });
});
