import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('LoginPage source', () => {
  it('应显式按需引入轻量 auth 入口，而不是走会带出壳层的 lite barrel', () => {
    const source = readFileSync(new URL('./LoginPage.vue', import.meta.url), 'utf8');

    expect(source).toContain('from "@one-base-template/ui/lite-auth"');
    expect(source).not.toContain('from "@one-base-template/ui/lite"');
    expect(source).toContain('<ObLoginBoxV2');
  });
});
