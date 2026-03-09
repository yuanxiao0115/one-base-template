import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('router/public-routes source', () => {
  it('public 路由应直接引用登录与 SSO 页面，避免匿名启动链路再套一层异步页面 chunk', () => {
    const source = readFileSync(new URL('../public-routes.ts', import.meta.url), 'utf8');

    expect(source).toContain('import LoginPage from "../pages/login/LoginPage.vue";');
    expect(source).toContain('import SsoCallbackPage from "../pages/sso/SsoCallbackPage.vue";');
    expect(source).not.toContain('component: async () => import(');
  });
});
