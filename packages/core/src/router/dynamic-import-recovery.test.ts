import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import type { Router } from 'vue-router';
import {
  DYNAMIC_IMPORT_RELOAD_KEY,
  installRouteDynamicImportRecovery,
  isDynamicImportLoadError
} from './dynamic-import-recovery';

function createRouterStub() {
  let onErrorHandler: ((error: unknown, to?: { fullPath?: string }) => void) | undefined;
  let afterEachHandler: ((to: { fullPath: string }) => void) | undefined;

  const router = {
    onError: vi.fn((handler: (error: unknown, to?: { fullPath?: string }) => void) => {
      onErrorHandler = handler;
    }),
    afterEach: vi.fn((handler: (to: { fullPath: string }) => void) => {
      afterEachHandler = handler;
    })
  } as unknown as Router;

  return {
    router,
    triggerError(error: unknown, to?: { fullPath?: string }) {
      if (!onErrorHandler) {
        throw new Error('onError 未注册');
      }
      onErrorHandler(error, to);
    },
    triggerAfterEach(to: { fullPath: string }) {
      if (!afterEachHandler) {
        throw new Error('afterEach 未注册');
      }
      afterEachHandler(to);
    }
  };
}

describe('router/dynamic-import-recovery', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('应识别动态导入失败错误', () => {
    expect(isDynamicImportLoadError(new Error('Loading chunk 123 failed'))).toBe(true);
    expect(isDynamicImportLoadError(new Error('FAILED TO LOAD MODULE SCRIPT'))).toBe(true);
    expect(isDynamicImportLoadError(new Error('request timeout'))).toBe(false);
  });

  it('首次失败应记录目标路由并触发自动刷新', () => {
    const { router, triggerError } = createRouterStub();
    const assignSpy = vi.spyOn(window.location, 'assign').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    installRouteDynamicImportRecovery(router);
    triggerError(new Error('Loading chunk 888 failed'), {
      fullPath: '/portal/design'
    });

    expect(sessionStorage.getItem(DYNAMIC_IMPORT_RELOAD_KEY)).toBe('/portal/design');
    expect(assignSpy).toHaveBeenCalledWith('/portal/design');
  });

  it('同一路由重试后仍失败应停止自动刷新并清理标记', () => {
    const { router, triggerError } = createRouterStub();
    const assignSpy = vi.spyOn(window.location, 'assign').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    sessionStorage.setItem(DYNAMIC_IMPORT_RELOAD_KEY, '/portal/design');

    installRouteDynamicImportRecovery(router);
    triggerError(new Error('failed to fetch dynamically imported module'), {
      fullPath: '/portal/design'
    });

    expect(sessionStorage.getItem(DYNAMIC_IMPORT_RELOAD_KEY)).toBeNull();
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it('路由恢复成功后应清理重试标记', () => {
    const { router, triggerAfterEach } = createRouterStub();
    sessionStorage.setItem(DYNAMIC_IMPORT_RELOAD_KEY, '/home/index');

    installRouteDynamicImportRecovery(router);
    triggerAfterEach({
      fullPath: '/home/index'
    });

    expect(sessionStorage.getItem(DYNAMIC_IMPORT_RELOAD_KEY)).toBeNull();
  });
});
