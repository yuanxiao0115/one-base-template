import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("vite config source", () => {
  it("应在写盘后继续收紧已生成 chunk 的 preload 映射", () => {
    const source = readFileSync(new URL("../../vite.config.ts", import.meta.url), "utf8");

    expect(source).toContain("writeBundle(");
    expect(source).toContain("pruneBuiltChunkPreloadMaps(");
    expect(source).toContain("writeFileSync");
  });
});
