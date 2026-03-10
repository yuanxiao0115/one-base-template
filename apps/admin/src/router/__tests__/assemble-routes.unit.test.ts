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
import { getAppRoutes } from "../assemble-routes";
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
  it("应保留公共固定路由", () => {
    const { routes } = getAppRoutes(createRouteAssemblyOptions(["home"]));
    const routePaths = routes.map((item) => item.path);

    expect(routePaths).toContain(APP_LOGIN_ROUTE_PATH);
    expect(routePaths).toContain(APP_SSO_ROUTE_PATH);
    expect(routePaths).toContain(APP_FORBIDDEN_ROUTE_PATH);
    expect(routePaths).toContain(APP_NOT_FOUND_ROUTE_PATH);
    expect(routePaths).toContain(APP_NOT_FOUND_CATCHALL_PATH);
  });

  it("portal 模块应生成 compat 别名路由并补齐 activePath", () => {
    const { routes } = getAppRoutes(createRouteAssemblyOptions(["portal"]));
    const aliasRoute = routes.find((item) => item.path === "/portal/setting");
    const meta = (aliasRoute?.meta as Record<string, unknown> | undefined) ?? {};

    expect(aliasRoute).toBeDefined();
    expect(aliasRoute?.redirect).toBe("/portal/templates");
    expect(meta.hideInMenu).toBe(true);
    expect(meta.hiddenTab).toBe(true);
    expect(meta.activePath).toBe("/portal/setting");
  });

  it("应从已装配路由自动收集 skipMenuAuth 白名单", () => {
    const { skipMenuAuthRouteNames } = getAppRoutes(createRouteAssemblyOptions(["home", "portal"]));

    expect(skipMenuAuthRouteNames).toContain("HomeIndex");
    expect(skipMenuAuthRouteNames).toContain("PortalTemplateList");
    expect(skipMenuAuthRouteNames).toContain("PortalDesigner");
    expect(skipMenuAuthRouteNames).toContain("PortalPageEditor");
    expect(skipMenuAuthRouteNames).not.toContain("PortalPreview");
  });
});
