import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminModuleManifest, AppRouteAssemblyOptions, RouteConflictPolicy } from "../types";

const warn = vi.hoisted(() => vi.fn());
const getEnabledModules = vi.hoisted(() => vi.fn());

vi.mock("@/shared/logger", () => ({
  createAppLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn,
    error: vi.fn(),
  }),
}));

vi.mock("@one-base-template/ui/shell", () => ({
  AdminLayout: {},
  ForbiddenPage: {},
  NotFoundPage: {},
}));

vi.mock("../registry", () => ({
  getEnabledModules,
}));

import { assembleRoutes } from "../assemble-routes";

function createMockModule(params: { id: string; path: string; name: string }): AdminModuleManifest {
  const { id, path, name } = params;
  return {
    id,
    version: "1",
    moduleTier: "core",
    enabledByDefault: true,
    apiNamespace: id,
    routes: {
      layout: [
        {
          path,
          name,
          component: {} as never,
        },
      ],
    },
  };
}

function createRouteAssemblyOptions(routeConflictPolicy?: RouteConflictPolicy): AppRouteAssemblyOptions {
  return {
    enabledModules: ["module-a", "module-b"],
    defaultSystemCode: "admin_server",
    systemHomeMap: {
      admin_server: "/home/index",
    },
    storageNamespace: "admin-test",
    routeConflictPolicy,
  };
}

describe("router/assemble-routes policy", () => {
  const duplicatePathModules: AdminModuleManifest[] = [
    createMockModule({
      id: "module-a",
      path: "/duplicate/path",
      name: "DuplicatePathA",
    }),
    createMockModule({
      id: "module-b",
      path: "/duplicate/path",
      name: "DuplicatePathB",
    }),
  ];

  beforeEach(() => {
    warn.mockClear();
    getEnabledModules.mockReset();
  });

  it("routeConflictPolicy='fail-fast' 时应在冲突处抛错", async () => {
    getEnabledModules.mockResolvedValue(duplicatePathModules);

    await expect(assembleRoutes(createRouteAssemblyOptions("fail-fast"))).rejects.toThrowError(
      /检测到重复 path：\/duplicate\/path/
    );
  });

  it("routeConflictPolicy='warn' 时应兼容 warn+skip 行为", async () => {
    getEnabledModules.mockResolvedValue(duplicatePathModules);

    const { routes } = await assembleRoutes(createRouteAssemblyOptions("warn"));
    const rootRoute = routes.find((item) => item.path === "/");
    const rootChildren = Array.isArray(rootRoute?.children) ? rootRoute.children : [];

    expect(rootChildren.filter((item) => item.path === "/duplicate/path")).toHaveLength(1);
    expect(
      warn.mock.calls.some((args) => String(args[0]).includes("检测到重复 path：/duplicate/path"))
    ).toBe(true);
  });
});
