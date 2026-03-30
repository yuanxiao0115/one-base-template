import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

const mocks = vi.hoisted(() => ({
  bootstrapAdminLiteApp: vi.fn(),
  renderBootstrapError: vi.fn()
}));

vi.mock('@/bootstrap/index', () => ({
  bootstrapAdminLiteApp: mocks.bootstrapAdminLiteApp
}));

vi.mock('@/bootstrap/error-view', () => ({
  renderBootstrapError: mocks.renderBootstrapError
}));

import { startAdminLiteApp } from '@/bootstrap/startup';

describe('bootstrap/startup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.bootstrapAdminLiteApp.mockResolvedValue({
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

    await startAdminLiteApp({
      beforeMount
    });

    expect(mocks.bootstrapAdminLiteApp).toHaveBeenCalledTimes(1);
    expect(beforeMount).toHaveBeenCalledTimes(1);
  });

  it('启动失败时应渲染错误视图', async () => {
    const error = new Error('bootstrap error');
    mocks.bootstrapAdminLiteApp.mockRejectedValue(error);

    await startAdminLiteApp();

    expect(mocks.renderBootstrapError).toHaveBeenCalledWith(error);
  });
});
