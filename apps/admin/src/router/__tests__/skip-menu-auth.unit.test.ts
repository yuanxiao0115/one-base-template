import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RouteRecordRaw } from "vue-router";

const warn = vi.hoisted(() => vi.fn());

vi.mock("@/shared/logger", () => ({
  createAppLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn,
    error: vi.fn(),
  }),
}));

import { getSkipAuthRule, listSkipAuthNames } from "../skip-menu-auth";

function createRoute(route: Partial<RouteRecordRaw>): RouteRecordRaw {
  return route as unknown as RouteRecordRaw;
}

describe("router/skip-menu-auth", () => {
  beforeEach(() => {
    warn.mockReset();
  });

  it("skipMenuAuth=true 时应默认 stable 级别", () => {
    const rule = getSkipAuthRule(createRoute({
      path: "/home/index",
      name: "HomeIndex",
      meta: {
        skipMenuAuth: true,
      },
    }));

    expect(rule).toEqual({
      name: "HomeIndex",
      level: "stable",
    });
  });

  it("应支持 skipMenuAuthLevel 显式分级", () => {
    const allowlistRule = getSkipAuthRule(createRoute({
      path: "/portal/designer",
      name: "PortalDesigner",
      meta: {
        skipMenuAuth: true,
        skipMenuAuthLevel: "allowlist",
      },
    }));

    const devOnlyRule = getSkipAuthRule(createRoute({
      path: "/local/dev-tool",
      name: "LocalDevTool",
      meta: {
        skipMenuAuth: true,
        skipMenuAuthLevel: "dev-only",
      },
    }));

    expect(allowlistRule).toEqual({
      name: "PortalDesigner",
      level: "allowlist",
    });
    expect(devOnlyRule).toEqual({
      name: "LocalDevTool",
      level: "dev-only",
    });
  });

  it("skipMenuAuth 路由缺少 name 时不应生成规则", () => {
    const rule = getSkipAuthRule(createRoute({
      path: "/anonymous",
      meta: {
        skipMenuAuth: true,
      },
    }));

    expect(rule).toBeNull();
  });

  it("生产环境应按级别与白名单过滤守卫放行集合", () => {
    const routeNames = listSkipAuthNames({
      isProd: true,
      routeRules: [
        { name: "HomeIndex", level: "stable" },
        { name: "PortalDesigner", level: "allowlist" },
        { name: "PortalTemplateList", level: "allowlist" },
        { name: "LocalDevTool", level: "dev-only" },
      ],
      productionAllowList: ["PortalDesigner", "UnknownRoute"],
    });

    expect(routeNames).toEqual(["HomeIndex", "PortalDesigner"]);
    expect(warn.mock.calls.map((call) => String(call[0]))).toEqual(
      expect.arrayContaining([
        expect.stringContaining("生产白名单包含未知 skipMenuAuth 路由：UnknownRoute"),
        expect.stringContaining("生产环境 skipMenuAuth 路由未加入白名单：PortalTemplateList"),
        expect.stringContaining("生产环境禁用 dev-only skipMenuAuth 路由：LocalDevTool"),
      ])
    );
  });

  it("开发环境应放行 allowlist 与 dev-only 级别", () => {
    const routeNames = listSkipAuthNames({
      isProd: false,
      routeRules: [
        { name: "HomeIndex", level: "stable" },
        { name: "PortalDesigner", level: "allowlist" },
        { name: "LocalDevTool", level: "dev-only" },
      ],
      productionAllowList: [],
    });

    expect(routeNames).toEqual(["HomeIndex", "PortalDesigner", "LocalDevTool"]);
  });
});
