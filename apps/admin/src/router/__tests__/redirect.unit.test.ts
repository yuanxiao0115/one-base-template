import { describe, expect, it } from "vitest";

import { getAppRedirectTarget } from "../redirect";

describe("router/redirect", () => {
  it("外链或非法 redirect 应回退到 fallback", () => {
    expect(
      getAppRedirectTarget("https://evil.example/path", {
        fallback: "/home/index",
        baseUrl: "/",
      })
    ).toBe("/home/index");

    expect(
      getAppRedirectTarget("javascript:alert(1)", {
        fallback: "/home/index",
        baseUrl: "/",
      })
    ).toBe("/home/index");
  });

  it("应剥离 baseUrl 前缀", () => {
    expect(
      getAppRedirectTarget("/admin/system/user", {
        fallback: "/home/index",
        baseUrl: "/admin",
      })
    ).toBe("/system/user");

    expect(
      getAppRedirectTarget("/admin", {
        fallback: "/home/index",
        baseUrl: "/admin",
      })
    ).toBe("/");
  });

  it("应保留 query 与 hash", () => {
    expect(
      getAppRedirectTarget("/admin/system/user?tab=1#detail", {
        fallback: "/home/index",
        baseUrl: "/admin",
      })
    ).toBe("/system/user?tab=1#detail");
  });
});
