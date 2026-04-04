import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import type { App } from 'vue';

vi.mock('./auth', () => ({
  LoginBox: { name: 'MockLoginBox' },
  LoginBoxV2: { name: 'MockLoginBoxV2' }
}));

vi.mock('./container', () => ({
  PageContainer: { name: 'MockPageContainer' }
}));

function createAppMock(initialRegistry?: Record<string, unknown>) {
  const registry = new Map<string, unknown>(Object.entries(initialRegistry || {}));

  const app = {
    component(name: string, component?: unknown) {
      if (typeof component === 'undefined') {
        return registry.get(name);
      }
      registry.set(name, component);
      return app;
    }
  };

  return {
    app: app as unknown as App,
    registry
  };
}

describe('registerOneLiteUiComponents', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('默认应仅注册 Ob 前缀组件', async () => {
    const { registerOneLiteUiComponents } = await import('./plugin');
    const { app, registry } = createAppMock();

    registerOneLiteUiComponents(app);

    expect(registry.has('ObLoginBox')).toBe(true);
    expect(registry.has('ObLoginBoxV2')).toBe(true);
    expect(registry.has('ObPageContainer')).toBe(true);
    expect(registry.has('LoginBox')).toBe(false);
    expect(registry.has('PageContainer')).toBe(false);
  });

  it('应支持 prefix 去空白、aliases 和 include 精确控制', async () => {
    const { registerOneLiteUiComponents } = await import('./plugin');
    const { app, registry } = createAppMock();

    registerOneLiteUiComponents(app, {
      prefix: ' One ',
      aliases: true,
      include: {
        PageContainer: false
      }
    });

    expect(registry.has('OneLoginBox')).toBe(true);
    expect(registry.has('OneLoginBoxV2')).toBe(true);
    expect(registry.has('OnePageContainer')).toBe(false);
    expect(registry.has('LoginBox')).toBe(true);
    expect(registry.has('LoginBoxV2')).toBe(true);
    expect(registry.has('PageContainer')).toBe(false);
  });

  it('已存在同名组件时不应覆盖已有注册', async () => {
    const { registerOneLiteUiComponents } = await import('./plugin');
    const existing = { name: 'ExistingLoginBox' };
    const { app, registry } = createAppMock({
      ObLoginBox: existing
    });

    registerOneLiteUiComponents(app);

    expect(registry.get('ObLoginBox')).toBe(existing);
    expect(registry.has('ObLoginBoxV2')).toBe(true);
    expect(registry.has('ObPageContainer')).toBe(true);
  });
});
