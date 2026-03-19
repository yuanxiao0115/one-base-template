import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

const mocks = vi.hoisted(() => ({
  axiosCreate: vi.fn(),
  axiosRequest: vi.fn()
}));

vi.mock('axios', () => ({
  default: {
    create: mocks.axiosCreate
  }
}));

import { createObHttp } from './pureHttp';

describe('core createObHttp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.axiosCreate.mockReturnValue({
      request: mocks.axiosRequest
    });
    mocks.axiosRequest.mockResolvedValue({
      data: {
        code: 0,
        data: {
          ok: true
        }
      },
      headers: {},
      config: {},
      status: 200,
      statusText: 'OK'
    });
  });

  it('应等待异步 beforeRequestCallback 完成后再发起请求', async () => {
    const steps: string[] = [];

    const http = createObHttp({
      beforeRequestCallback: async (config) => {
        steps.push('before:start');
        await Promise.resolve();
        config.headers = {
          ...(config.headers as Record<string, unknown> | undefined),
          'X-Test-Async': 'ready'
        };
        steps.push('before:end');
      }
    });

    mocks.axiosRequest.mockImplementation(async (config: Record<string, unknown>) => {
      const headers =
        config.headers && typeof config.headers === 'object'
          ? (config.headers as Record<string, unknown>)
          : {};
      steps.push(`request:${headers['X-Test-Async'] ?? 'missing'}`);
      return {
        data: {
          code: 0,
          data: 'ok'
        },
        headers: {},
        config,
        status: 200,
        statusText: 'OK'
      };
    });

    await http.get('/demo');

    expect(steps).toEqual(['before:start', 'before:end', 'request:ready']);
  });
});
