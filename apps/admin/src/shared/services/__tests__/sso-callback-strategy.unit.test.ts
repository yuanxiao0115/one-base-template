import { describe, expect, it, vi } from 'vite-plus/test';

import { executeSsoCallbackStrategy } from '../sso-callback-strategy';

describe('shared/services/sso-callback-strategy', () => {
  it('应按优先级优先命中 sourceCode=zhxt', async () => {
    const handlers = {
      onZhxt: vi.fn(async () => {}),
      onYdbg: vi.fn(async () => {}),
      onTicket: vi.fn(async () => {}),
      onTypeToken: vi.fn(async () => {}),
      onMoaToken: vi.fn(async () => {}),
      onUserToken: vi.fn(async () => {})
    };

    const sp = new URLSearchParams({
      sourceCode: 'zhxt',
      token: 'zhxt-token',
      ticket: 'ticket-1',
      type: 'external',
      moaToken: 'moa-1',
      Usertoken: 'user-1',
      redirectUrl: 'sso/redirect'
    });

    await executeSsoCallbackStrategy({ searchParams: sp, handlers });

    expect(handlers.onZhxt).toHaveBeenCalledWith({ token: 'zhxt-token' });
    expect(handlers.onYdbg).not.toHaveBeenCalled();
    expect(handlers.onTicket).not.toHaveBeenCalled();
    expect(handlers.onTypeToken).not.toHaveBeenCalled();
    expect(handlers.onMoaToken).not.toHaveBeenCalled();
    expect(handlers.onUserToken).not.toHaveBeenCalled();
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

    const sp = new URLSearchParams({
      sourceCode: 'YDBG',
      token: 'ydbg-token',
      ticket: 'ticket-1',
      type: 'external',
      moaToken: 'moa-1',
      Usertoken: 'user-1',
      redirectUrl: 'sso/redirect'
    });

    await executeSsoCallbackStrategy({ searchParams: sp, handlers });

    expect(handlers.onYdbg).toHaveBeenCalledWith({ token: 'ydbg-token' });
    expect(handlers.onZhxt).not.toHaveBeenCalled();
    expect(handlers.onTicket).not.toHaveBeenCalled();
    expect(handlers.onTypeToken).not.toHaveBeenCalled();
    expect(handlers.onMoaToken).not.toHaveBeenCalled();
    expect(handlers.onUserToken).not.toHaveBeenCalled();
  });

  it('应按优先级命中 ticket 并透传 redirectUrl', async () => {
    const handlers = {
      onZhxt: vi.fn(async () => {}),
      onYdbg: vi.fn(async () => {}),
      onTicket: vi.fn(async () => {}),
      onTypeToken: vi.fn(async () => {}),
      onMoaToken: vi.fn(async () => {}),
      onUserToken: vi.fn(async () => {})
    };

    const sp = new URLSearchParams({
      ticket: 'ticket-1',
      type: 'external',
      token: 'type-token',
      moaToken: 'moa-1',
      Usertoken: 'user-1',
      redirectUrl: 'oa/redirect',
      redirect: '/home/index'
    });

    await executeSsoCallbackStrategy({ searchParams: sp, handlers });

    expect(handlers.onTicket).toHaveBeenCalledWith({
      ticket: 'ticket-1',
      redirectUrlRaw: 'oa/redirect'
    });
    expect(handlers.onTypeToken).not.toHaveBeenCalled();
    expect(handlers.onMoaToken).not.toHaveBeenCalled();
    expect(handlers.onUserToken).not.toHaveBeenCalled();
  });

  it('ticket 分支缺失 redirectUrl 时应透传 null', async () => {
    const handlers = {
      onZhxt: vi.fn(async () => {}),
      onYdbg: vi.fn(async () => {}),
      onTicket: vi.fn(async () => {}),
      onTypeToken: vi.fn(async () => {}),
      onMoaToken: vi.fn(async () => {}),
      onUserToken: vi.fn(async () => {})
    };

    const sp = new URLSearchParams({
      ticket: 'ticket-without-redirect-url',
      redirect: '/fallback/home'
    });

    await executeSsoCallbackStrategy({ searchParams: sp, handlers });

    expect(handlers.onTicket).toHaveBeenCalledWith({
      ticket: 'ticket-without-redirect-url',
      redirectUrlRaw: null
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

    const sp = new URLSearchParams({
      type: 'external',
      token: 'type-token',
      moaToken: 'moa-1',
      Usertoken: 'user-1'
    });

    await executeSsoCallbackStrategy({ searchParams: sp, handlers });

    expect(handlers.onTypeToken).toHaveBeenCalledWith({
      type: 'external',
      token: 'type-token'
    });
    expect(handlers.onMoaToken).not.toHaveBeenCalled();
    expect(handlers.onUserToken).not.toHaveBeenCalled();
  });

  it('应按优先级命中 moaToken', async () => {
    const handlers = {
      onZhxt: vi.fn(async () => {}),
      onYdbg: vi.fn(async () => {}),
      onTicket: vi.fn(async () => {}),
      onTypeToken: vi.fn(async () => {}),
      onMoaToken: vi.fn(async () => {}),
      onUserToken: vi.fn(async () => {})
    };

    const sp = new URLSearchParams({
      moaToken: 'moa-1',
      Usertoken: 'user-1'
    });

    await executeSsoCallbackStrategy({ searchParams: sp, handlers });

    expect(handlers.onMoaToken).toHaveBeenCalledWith({ token: 'moa-1' });
    expect(handlers.onUserToken).not.toHaveBeenCalled();
  });

  it('应命中 Usertoken', async () => {
    const handlers = {
      onZhxt: vi.fn(async () => {}),
      onYdbg: vi.fn(async () => {}),
      onTicket: vi.fn(async () => {}),
      onTypeToken: vi.fn(async () => {}),
      onMoaToken: vi.fn(async () => {}),
      onUserToken: vi.fn(async () => {})
    };

    const sp = new URLSearchParams({
      Usertoken: 'user-1'
    });

    await executeSsoCallbackStrategy({ searchParams: sp, handlers });

    expect(handlers.onUserToken).toHaveBeenCalledWith({ token: 'user-1' });
  });

  it('无有效参数时应抛错', async () => {
    const handlers = {
      onZhxt: vi.fn(async () => {}),
      onYdbg: vi.fn(async () => {}),
      onTicket: vi.fn(async () => {}),
      onTypeToken: vi.fn(async () => {}),
      onMoaToken: vi.fn(async () => {}),
      onUserToken: vi.fn(async () => {})
    };

    await expect(
      executeSsoCallbackStrategy({ searchParams: new URLSearchParams(), handlers })
    ).rejects.toThrowError('登录参数无效');
  });

  it('命中分支时 handler 抛错应透传异常', async () => {
    const expectedError = new Error('ticket handler failed');
    const handlers = {
      onZhxt: vi.fn(async () => {}),
      onYdbg: vi.fn(async () => {}),
      onTicket: vi.fn(async () => {
        throw expectedError;
      }),
      onTypeToken: vi.fn(async () => {}),
      onMoaToken: vi.fn(async () => {}),
      onUserToken: vi.fn(async () => {})
    };

    const sp = new URLSearchParams({
      ticket: 'ticket-1'
    });

    await expect(executeSsoCallbackStrategy({ searchParams: sp, handlers })).rejects.toBe(
      expectedError
    );
  });
});
