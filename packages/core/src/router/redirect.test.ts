import { describe, expect, it } from 'vite-plus/test';

import {
  readAuthRedirectRawFromQuery,
  readAuthRedirectRawFromSearchParams,
  resolveAppRedirectTarget,
  resolveAuthRedirectTargetFromQuery,
  resolveAuthRedirectTargetFromSearchParams
} from './redirect';

describe('core/router/redirect', () => {
  it('非法 redirect 应回退 fallback', () => {
    expect(
      resolveAppRedirectTarget('https://evil.example/path', {
        fallback: '/home/index',
        baseUrl: '/'
      })
    ).toBe('/home/index');
    expect(
      resolveAppRedirectTarget('javascript:alert(1)', { fallback: '/home/index', baseUrl: '/' })
    ).toBe('/home/index');
  });

  it('应剥离 baseUrl 前缀并保留 query/hash', () => {
    expect(
      resolveAppRedirectTarget('/admin/system/user', { fallback: '/home/index', baseUrl: '/admin' })
    ).toBe('/system/user');
    expect(resolveAppRedirectTarget('/admin', { fallback: '/home/index', baseUrl: '/admin' })).toBe(
      '/'
    );
    expect(
      resolveAppRedirectTarget('/admin/system/user?tab=1#detail', {
        fallback: '/home/index',
        baseUrl: '/admin'
      })
    ).toBe('/system/user?tab=1#detail');
  });

  it('应统一读取 query.redirect / query.redirectUrl', () => {
    expect(
      readAuthRedirectRawFromQuery({
        redirect: [' ', '/system/user']
      })
    ).toBe('/system/user');
    expect(
      readAuthRedirectRawFromQuery({
        redirect: '',
        redirectUrl: '/home/index'
      })
    ).toBe('/home/index');
    expect(readAuthRedirectRawFromQuery({})).toBeNull();
  });

  it('应统一读取 searchParams redirect 参数', () => {
    const params = new URLSearchParams('redirect=%2Fsystem%2Fuser');
    expect(readAuthRedirectRawFromSearchParams(params)).toBe('/system/user');

    const fallbackParams = new URLSearchParams('redirectUrl=%2Fhome%2Findex');
    expect(readAuthRedirectRawFromSearchParams(fallbackParams)).toBe('/home/index');
  });

  it('从 query/searchParams 解析认证回跳时应保持安全兜底', () => {
    expect(
      resolveAuthRedirectTargetFromQuery(
        { redirect: 'https://evil.example/path' },
        { fallback: '/home/index', baseUrl: '/' }
      )
    ).toBe('/home/index');

    const params = new URLSearchParams('redirect=%2Fadmin%2Fsystem%2Fuser');
    expect(
      resolveAuthRedirectTargetFromSearchParams(params, {
        fallback: '/home/index',
        baseUrl: '/admin'
      })
    ).toBe('/system/user');
  });
});
