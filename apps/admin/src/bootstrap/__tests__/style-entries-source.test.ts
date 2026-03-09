import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("bootstrap style entries source", () => {
  it("入口样式应下沉到 admin 分支，而不是留在 main.ts", () => {
    const mainSource = readFileSync(new URL("../../main.ts", import.meta.url), "utf8");
    const adminEntrySource = readFileSync(new URL("../admin-entry.ts", import.meta.url), "utf8");

    expect(mainSource).not.toContain("element-plus/dist/index.css");
    expect(mainSource).not.toContain("./styles/index.css");
    expect(adminEntrySource).toContain("./admin-styles");
  });
});
