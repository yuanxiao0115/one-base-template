import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

const mocks = vi.hoisted(() => ({
  bootstrapZfwSystemSfssApp: vi.fn(),
  renderBootstrapError: vi.fn()
}));

vi.mock('@/bootstrap/index', () => ({
  bootstrapZfwSystemSfssApp: mocks.bootstrapZfwSystemSfssApp
}));

vi.mock('@/bootstrap/error-view', () => ({
  renderBootstrapError: mocks.renderBootstrapError
}));

import { startZfwSystemSfssApp } from '@/bootstrap/startup';

describe('bootstrap/startup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.bootstrapZfwSystemSfssApp.mockResolvedValue({
      app: {
        mount: vi.fn()
      },
      router: {
        isReady: vi.fn().mockResolvedValue(undefined)
      }
    });
  });

  it('应执行 bootstrap 并透传 beforeMount 扩展钩子', async () => {
    const beforeMount = vi.fn();

    await startZfwSystemSfssApp({
      beforeMount
    });

    expect(mocks.bootstrapZfwSystemSfssApp).toHaveBeenCalledTimes(1);
    expect(beforeMount).toHaveBeenCalledTimes(1);
  });

  it('启动失败时应渲染错误视图', async () => {
    const error = new Error('bootstrap error');
    mocks.bootstrapZfwSystemSfssApp.mockRejectedValue(error);

    await startZfwSystemSfssApp();

    expect(mocks.renderBootstrapError).toHaveBeenCalledWith(error);
  });
});
