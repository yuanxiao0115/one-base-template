import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  startAppWithRuntimeConfig: vi.fn(),
}));

vi.mock("@one-base-template/app-starter", () => ({
  startAppWithRuntimeConfig: mocks.startAppWithRuntimeConfig,
}));

import { startAdminApp } from "../startup";

describe("bootstrap/startup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.startAppWithRuntimeConfig.mockResolvedValue(undefined);
  });

  it("应透传 main 的 beforeMount 扩展钩子", async () => {
    const beforeMount = vi.fn();

    await startAdminApp({
      beforeMount,
    });

    const options = mocks.startAppWithRuntimeConfig.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(options.beforeMount).toBe(beforeMount);
  });
});
