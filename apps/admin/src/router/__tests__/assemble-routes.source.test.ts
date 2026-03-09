import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('router/assemble-routes source', () => {
  it('应通过更窄的 ui shell 子入口导入壳层页面，避免根入口副作用进入业务路由装配', () => {
    const source = readFileSync(new URL('../assemble-routes.ts', import.meta.url), 'utf8');

    expect(source).toContain('from "@one-base-template/ui/shell"');
    expect(source).not.toContain('from "@one-base-template/ui"');
  });
});
