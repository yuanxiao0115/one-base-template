import { describe, expect, it } from 'vitest';

import { getPublicRoutes } from '../public-routes';

describe('router/public-routes', () => {
  it('仅暴露登录与 SSO 公共路由', () => {
    const routes = getPublicRoutes();

    expect(routes.map((item) => item.path)).toEqual(['/login', '/sso']);
    expect(routes.every((item) => item.meta?.public === true)).toBe(true);
    expect(routes.every((item) => item.meta?.hiddenTab === true)).toBe(true);
    expect(routes.every((item) => typeof item.component === 'function')).toBe(true);
  });
});
