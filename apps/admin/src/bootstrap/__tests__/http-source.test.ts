import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('bootstrap/http source', () => {
  it('匿名登录链路不应静态引入 tag 根入口，避免提前拉起壳层 chunk', () => {
    const source = readFileSync(new URL('../http.ts', import.meta.url), 'utf8');

    expect(source).not.toContain('from "@one-base-template/tag"');
    expect(source).toContain('import("@one-base-template/tag/store")');
  });
});
