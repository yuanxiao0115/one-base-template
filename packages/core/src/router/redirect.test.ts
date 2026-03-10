import { describe, expect, it } from 'vitest';

import { resolveAppRedirectTarget } from './redirect';

describe('core/router/redirect', () => {
  it('非法 redirect 应回退 fallback', () => {
    expect(resolveAppRedirectTarget('https://evil.example/path', { fallback: '/home/index', baseUrl: '/' })).toBe(
      '/home/index'
    );
    expect(resolveAppRedirectTarget('javascript:alert(1)', { fallback: '/home/index', baseUrl: '/' })).toBe(
      '/home/index'
    );
  });

  it('应剥离 baseUrl 前缀并保留 query/hash', () => {
    expect(resolveAppRedirectTarget('/admin/system/user', { fallback: '/home/index', baseUrl: '/admin' })).toBe(
      '/system/user'
    );
    expect(resolveAppRedirectTarget('/admin', { fallback: '/home/index', baseUrl: '/admin' })).toBe('/');
    expect(
      resolveAppRedirectTarget('/admin/system/user?tab=1#detail', { fallback: '/home/index', baseUrl: '/admin' })
    ).toBe('/system/user?tab=1#detail');
  });
});
