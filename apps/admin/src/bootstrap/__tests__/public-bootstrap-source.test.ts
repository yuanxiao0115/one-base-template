import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('bootstrap/public source', () => {
  it('public 启动链路不应再通过全局注册挂载登录组件', () => {
    const source = readFileSync(new URL('../public.ts', import.meta.url), 'utf8');

    expect(source).not.toContain('registerOneLiteUiComponents(');
  });
});
