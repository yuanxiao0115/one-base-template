import { describe, expect, it } from 'vite-plus/test';

import routesSource from '@/modules/adminManagement/routes.ts?raw';

describe('adminManagement embedded host routes source', () => {
  it('应注册外链与 microapp 通用宿主路由，并保持菜单权限模型', () => {
    expect(routesSource).toContain("path: '/ext/:slug(.*)*'");
    expect(routesSource).toContain("name: 'SystemExternalFrameHost'");
    expect(routesSource).toContain("import('./menu/pages/ExternalFramePage.vue')");
    expect(routesSource).toContain("path: '/micro/:slug(.*)*'");
    expect(routesSource).toContain("name: 'SystemMicroAppHost'");
    expect(routesSource).toContain("import('./menu/pages/MicroAppHostPage.vue')");
    expect(routesSource).toContain('meta: defineRouteMeta({');
    expect(routesSource).not.toContain('createAuthRouteMeta');
  });
});
