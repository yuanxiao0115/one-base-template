import { describe, expect, it } from 'vitest';

import { resolveAppHref, resolveAuthNavigationTarget } from '../runtime';

describe('bootstrap/runtime', () => {
  it('public 模式应拼接 baseUrl 后返回整页重载目标', () => {
    expect(resolveAppHref('/home/index', '/')).toBe('/home/index');
    expect(resolveAppHref('/home/index?tab=1', '/oa/')).toBe('/oa/home/index?tab=1');
    expect(resolveAppHref('/', '/oa/')).toBe('/oa/');

    expect(
      resolveAuthNavigationTarget({
        mode: 'public',
        target: '/home/index',
        baseUrl: '/oa/',
      })
    ).toEqual({
      type: 'reload',
      href: '/oa/home/index',
    });
  });

  it('admin 模式应继续返回 router 内跳转目标', () => {
    expect(
      resolveAuthNavigationTarget({
        mode: 'admin',
        target: '/home/index',
        baseUrl: '/oa/',
      })
    ).toEqual({
      type: 'router',
      target: '/home/index',
    });
  });
});
