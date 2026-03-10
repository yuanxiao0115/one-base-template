import { describe, expect, it, vi } from "vitest";

async function loadHttpInfraModule() {
  vi.resetModules();
  return import("../http");
}

describe("infra/http", () => {
  it("未注入客户端时应抛错", async () => {
    const { getObHttpClient } = await loadHttpInfraModule();
    expect(() => getObHttpClient()).toThrowError("[admin] ObHttpClient 未初始化，请先在应用启动阶段调用 setObHttpClient().");
  });

  it("注入后应返回同一实例", async () => {
    const { getObHttpClient, setObHttpClient } = await loadHttpInfraModule();
    const client = {
      request: vi.fn(),
    } as unknown;

    setObHttpClient(client as never);

    expect(getObHttpClient()).toBe(client);
  });
});
