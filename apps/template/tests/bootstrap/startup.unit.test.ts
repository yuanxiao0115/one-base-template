import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

const mocks = vi.hoisted(() => ({
  bootstrapTemplateApp: vi.fn(),
  renderBootstrapError: vi.fn()
}));

vi.mock('@/bootstrap/index', () => ({
  bootstrapTemplateApp: mocks.bootstrapTemplateApp
}));

vi.mock('@/bootstrap/error-view', () => ({
  renderBootstrapError: mocks.renderBootstrapError
}));

import { startTemplateApp } from '@/bootstrap/startup';

describe('bootstrap/startup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.bootstrapTemplateApp.mockResolvedValue({
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

    await startTemplateApp({
      beforeMount
    });

    expect(mocks.bootstrapTemplateApp).toHaveBeenCalledTimes(1);
    expect(beforeMount).toHaveBeenCalledTimes(1);
  });

  it('启动失败时应渲染错误视图', async () => {
    const error = new Error('bootstrap error');
    mocks.bootstrapTemplateApp.mockRejectedValue(error);

    await startTemplateApp();

    expect(mocks.renderBootstrapError).toHaveBeenCalledWith(error);
  });
});
