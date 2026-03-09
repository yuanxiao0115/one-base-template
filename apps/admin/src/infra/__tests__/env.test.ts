import { beforeEach, describe, expect, it, vi } from "vitest";

const getPlatformConfigMock = vi.fn();

vi.mock("../../config/platform-config", () => ({
  getPlatformConfig: getPlatformConfigMock,
}));

describe("infra/env", () => {
  beforeEach(() => {
    vi.resetModules();
    getPlatformConfigMock.mockReset();
    getPlatformConfigMock.mockReturnValue({
      backend: "sczfw",
      authMode: "token",
      tokenKey: "token",
      idTokenKey: "idToken",
      menuMode: "remote",
      enabledModules: ["home"],
      authorizationType: "ADMIN",
      appsource: "frame",
      appcode: "od",
      storageNamespace: "one-base-template-admin",
      clientSignatureSalt: "salt",
      clientSignatureClientId: "1",
      defaultSystemCode: "admin_server",
      systemHomeMap: {
        admin_server: "/home/index",
      },
    });
  });

  it("导入 env 模块时不应立即读取 platform-config，而应在真正取值时再懒加载", async () => {
    const envModule = await import("../env");

    expect(getPlatformConfigMock).not.toHaveBeenCalled();
    expect(envModule.buildEnv.baseUrl).toBeTypeOf("string");

    const env = envModule.getAppEnv();

    expect(getPlatformConfigMock).toHaveBeenCalledTimes(1);
    expect(env.backend).toBe("sczfw");
    expect(env.storageNamespace).toBe("one-base-template-admin");
  });
});
