import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('main single bootstrap source', () => {
  it('main.ts 应回归单启动链路，不再保留字体切换与双启动分流', () => {
    const source = readFileSync(new URL('../../main.ts', import.meta.url), 'utf8');

    expect(source).not.toContain('dataset.oneOs');
    expect(source).not.toContain('detectRuntimeOs(');
    expect(source).not.toContain('applyRuntimeOsMarker(');
    expect(source).not.toContain('bootstrapAppByMode(');
    expect(source).not.toContain('./bootstrap/switcher');
    expect(source).toContain('./bootstrap/admin-entry');
    expect(source).toContain('bootstrapAdminMode');
  });
});
