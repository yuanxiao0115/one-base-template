import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

const warn = vi.hoisted(() => vi.fn());

vi.mock('@/utils/logger', () => ({
  createAppLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn,
    error: vi.fn()
  })
}));

import { getEnabledModules } from '@/router/registry';

describe('router/registry', () => {
  beforeEach(() => {
    warn.mockClear();
  });

  it("enabledModules='*' 应返回全部模块", async () => {
    const all = await getEnabledModules('*');

    expect(all.length).toBeGreaterThan(0);
    expect(new Set(all.map((item) => item.id)).size).toBe(all.length);
  });

  it('enabledModules 为空数组时应返回 enabledByDefault 模块', async () => {
    const all = await getEnabledModules('*');
    const defaults = await getEnabledModules([]);
    const expectedDefaultIds = all.filter((item) => item.enabledByDefault).map((item) => item.id);

    expect(defaults.map((item) => item.id)).toEqual(expectedDefaultIds);
  });

  it('应过滤重复与未知模块并触发 warn', async () => {
    const enabled = await getEnabledModules(['home', 'home', 'unknown-module', 'demo']);
    const warnMessages = warn.mock.calls.map((call) => String(call[0]));

    expect(enabled.map((item) => item.id)).toEqual(['home', 'demo']);
    expect(warnMessages).toEqual(
      expect.arrayContaining([
        expect.stringContaining('enabledModules 包含重复模块 id：home'),
        expect.stringContaining('enabledModules 包含未知模块 id：unknown-module')
      ])
    );
  });
});
