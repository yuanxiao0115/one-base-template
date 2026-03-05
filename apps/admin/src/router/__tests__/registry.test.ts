import { describe, expect, it } from 'vitest';

import { getEnabledModules } from '../registry';

describe('router/registry', () => {
  it('默认启用列表不应包含 optional 模块', () => {
    const modules = getEnabledModules([]);

    expect(modules.length).toBeGreaterThan(0);
    expect(modules.every((item) => item.moduleTier === 'core')).toBe(true);
    expect(modules.some((item) => item.id === 'demo')).toBe(false);
    expect(modules.some((item) => item.id === 'portal')).toBe(false);
  });

  it('全量启用时应包含 optional 模块', () => {
    const modules = getEnabledModules('*');
    const ids = modules.map((item) => item.id);

    expect(ids).toContain('portal');
    expect(ids).not.toContain('demo');
  });
});
