import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('router/public-routes', () => {
  it('仅暴露登录与 SSO 公共路由，并保持 public/hiddenTab 元信息', () => {
    const source = readFileSync(new URL('../public-routes.ts', import.meta.url), 'utf8');

    expect(source).toContain('path: APP_LOGIN_ROUTE_PATH');
    expect(source).toContain('path: APP_SSO_ROUTE_PATH');
    expect(source).toContain('name: "Login"');
    expect(source).toContain('name: "Sso"');
    expect(source.match(/public: true/g)?.length).toBe(2);
    expect(source.match(/hiddenTab: true/g)?.length).toBe(2);
  });
});
