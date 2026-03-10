import { describe, expect, it, vi } from "vitest";

vi.mock("@one-base-template/ui/shell", () => ({
  AdminLayout: {},
  ForbiddenPage: {},
  NotFoundPage: {},
}));

import { routePaths } from "../constants";
import { assembleRoutes, type AppRouteAssemblyOptions } from "../assemble-routes";

function createRouteAssemblyOptions(
  enabledModules: string[],
  overrides: Partial<AppRouteAssemblyOptions> = {}
): AppRouteAssemblyOptions {
  return {
    enabledModules,
    defaultSystemCode: "admin_server",
    systemHomeMap: {
      admin_server: "/home/index",
    },
    storageNamespace: "admin-test",
    ...overrides,
  };
}

describe("router/assemble-routes", () => {
  it("应保留公共固定路由", async () => {
    const { routes } = await assembleRoutes(createRouteAssemblyOptions(["home"]));
    const routePathList = routes.map((item) => item.path);

    expect(routePathList).toContain(routePaths.login);
    expect(routePathList).toContain(routePaths.sso);
    expect(routePathList).toContain(routePaths.forbidden);
    expect(routePathList).toContain(routePaths.notFound);
    expect(routePathList).toContain(routePaths.catchall);
  });

  it("portal 模块应生成 compat 别名路由并补齐 activePath", async () => {
    const { routes } = await assembleRoutes(createRouteAssemblyOptions(["portal"]));
    const aliasRoute = routes.find((item) => item.path === "/portal/setting");
    const meta = (aliasRoute?.meta as Record<string, unknown> | undefined) ?? {};

    expect(aliasRoute).toBeDefined();
    expect(aliasRoute?.redirect).toBe("/portal/templates");
    expect(meta.hideInMenu).toBe(true);
    expect(meta.hiddenTab).toBe(true);
    expect(meta.activePath).toBe("/portal/setting");
  });

  it("应从已装配路由自动收集 skipMenuAuth 白名单", async () => {
    const { skipMenuAuthRouteNames } = await assembleRoutes(createRouteAssemblyOptions(["home", "portal"]));

    expect(skipMenuAuthRouteNames).toEqual(
      expect.arrayContaining(["HomeIndex", "PortalTemplateList", "PortalDesigner", "PortalPageEditor"])
    );
    expect(skipMenuAuthRouteNames).not.toContain("PortalPreview");
  });
});
