import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vite-plus/test';

describe('ui root entry source', () => {
  const source = readFileSync(new URL('./index.ts', import.meta.url), 'utf8');

  it('保留登录组件导出，避免调用方编译期回归', () => {
    expect(source).toContain("export { LoginBox, LoginBoxV2 } from './lite-auth';");
    expect(source).toContain("export { default as ObCard } from './components/card/ObCard.vue';");
  });

  it('导出 Table，供业务统一使用 ObTable', () => {
    expect(source).toContain("export { default as Table } from './components/table/Table.vue';");
    expect(source).not.toContain('TanStackTable');
  });
});
