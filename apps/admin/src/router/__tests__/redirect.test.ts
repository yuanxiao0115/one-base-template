import { describe, expect, it } from 'vitest';

import { resolveAppRedirectTarget } from '../redirect';

describe('router/redirect', () => {
  it('子路径部署时会剥离 redirect 中重复携带的 baseUrl 前缀', () => {
    expect(
      resolveAppRedirectTarget('/admin/home/index?tab=base#anchor', {
        baseUrl: '/admin/',
        fallback: '/home/index'
      })
    ).toBe('/home/index?tab=base#anchor');
  });

  it('非法 redirect 仍回退到安全兜底地址', () => {
    expect(
      resolveAppRedirectTarget('https://example.com/evil', {
        baseUrl: '/admin/',
        fallback: '/home/index'
      })
    ).toBe('/home/index');
  });

  it('未命中 baseUrl 前缀时保持原始站内路径', () => {
    expect(
      resolveAppRedirectTarget('/system/user/list', {
        baseUrl: '/admin/',
        fallback: '/home/index'
      })
    ).toBe('/system/user/list');
  });
});
