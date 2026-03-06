import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('LoginPage source', () => {
  it('应显式按需引入 LoginBoxV2，而不是依赖全局注册', () => {
    const source = readFileSync(new URL('./LoginPage.vue', import.meta.url), 'utf8');

    expect(source).toContain('from "@one-base-template/ui/lite"');
    expect(source).toContain('<ObLoginBoxV2');
  });
});
