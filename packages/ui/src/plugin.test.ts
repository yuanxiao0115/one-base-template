import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vite-plus/test';

describe('registerOneUiComponents source', () => {
  const source = readFileSync(new URL('./plugin.ts', import.meta.url), 'utf8');

  it('默认不全局注册登录组件，但保留业务壳常用组件', () => {
    expect(source).toContain('PageContainer,');
    expect(source).toContain('Card: ObCard,');
    expect(source).not.toContain('LoginBox');
    expect(source).not.toContain('LoginBoxV2');
  });

  it('注册 TanStackTable，保持 Ob* 组件命名规则一致', () => {
    expect(source).toContain("import TanStackTable from './components/table/TanStackTable.vue';");
    expect(source).toContain('TanStackTable,');
  });
});
