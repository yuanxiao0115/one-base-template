import { describe, expect, it } from 'vitest';

import { resolveBootstrapMode, stripBaseUrl } from '../entry';

describe('bootstrap/entry', () => {
  it('stripBaseUrl 应去掉应用 baseUrl 前缀', () => {
    expect(stripBaseUrl('/login', '/')).toBe('/login');
    expect(stripBaseUrl('/oa/login', '/oa/')).toBe('/login');
    expect(stripBaseUrl('/oa/sso', '/oa')).toBe('/sso');
  });

  it('远程菜单模式下登录与 SSO 页面应走 public bootstrap', () => {
    expect(resolveBootstrapMode({ pathname: '/login', baseUrl: '/', menuMode: 'remote' })).toBe('public');
    expect(resolveBootstrapMode({ pathname: '/oa/login', baseUrl: '/oa/', menuMode: 'remote' })).toBe('public');
    expect(resolveBootstrapMode({ pathname: '/oa/sso', baseUrl: '/oa/', menuMode: 'remote' })).toBe('public');
  });

  it('业务页与 static 菜单模式应继续走 admin bootstrap', () => {
    expect(resolveBootstrapMode({ pathname: '/home/index', baseUrl: '/', menuMode: 'remote' })).toBe('admin');
    expect(resolveBootstrapMode({ pathname: '/oa/login', baseUrl: '/oa/', menuMode: 'static' })).toBe('admin');
  });
});
