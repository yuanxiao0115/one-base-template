import { describe, expect, it, vi } from "vitest";

vi.mock("@one-base-template/ui/shell", () => ({
  AdminLayout: {},
  ForbiddenPage: {},
  NotFoundPage: {},
}));

import {
  APP_FORBIDDEN_ROUTE_PATH,
  APP_LOGIN_ROUTE_PATH,
  APP_NOT_FOUND_CATCHALL_PATH,
  APP_NOT_FOUND_ROUTE_PATH,
  APP_SSO_ROUTE_PATH,
} from "../constants";
import { assembleRoutes } from "../assemble-routes";
import type { AppRouteAssemblyOptions } from "../types";

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
    const routePaths = routes.map((item) => item.path);

    expect(routePaths).toContain(APP_LOGIN_ROUTE_PATH);
    expect(routePaths).toContain(APP_SSO_ROUTE_PATH);
    expect(routePaths).toContain(APP_FORBIDDEN_ROUTE_PATH);
    expect(routePaths).toContain(APP_NOT_FOUND_ROUTE_PATH);
    expect(routePaths).toContain(APP_NOT_FOUND_CATCHALL_PATH);
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
    const { skipMenuAuthRouteRules } = await assembleRoutes(createRouteAssemblyOptions(["home", "portal"]));
    const skipMenuAuthRouteNames = skipMenuAuthRouteRules.map((item) => item.name);

    expect(skipMenuAuthRouteNames).toEqual(
      expect.arrayContaining(["HomeIndex", "PortalTemplateList", "PortalDesigner", "PortalPageEditor"])
    );
    expect(skipMenuAuthRouteNames).not.toContain("PortalPreview");
    expect(skipMenuAuthRouteRules).toEqual(
      expect.arrayContaining([
        { name: "HomeIndex", level: "stable" },
        { name: "PortalTemplateList", level: "allowlist" },
        { name: "PortalDesigner", level: "allowlist" },
        { name: "PortalPageEditor", level: "allowlist" },
      ])
    );
  });
});
