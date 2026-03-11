import { describe, expect, it, vi } from 'vitest';

async function loadRuntimeHttpModule() {
  vi.resetModules();
  return import('./runtime');
}

describe('core/http/runtime', () => {
  it('未注入客户端时应抛错', async () => {
    const { obHttp } = await loadRuntimeHttpModule();
    expect(() => obHttp()).toThrowError('[core] ObHttpClient 未初始化，请先在应用启动阶段调用 setObHttpClient().');
  });

  it('注入后应返回同一实例', async () => {
    const { obHttp, setObHttpClient } = await loadRuntimeHttpModule();
    const client = {
      request: vi.fn(),
    } as unknown;

    setObHttpClient(client as never);

    expect(obHttp()).toBe(client);
  });
});
