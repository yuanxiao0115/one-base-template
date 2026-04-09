import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

describe('registerOneUiComponents source', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/plugin.ts'), 'utf8');

  it('默认不全局注册登录组件，但保留业务壳常用组件', () => {
    expect(source).toContain('PageContainer,');
    expect(source).toContain('Card: ObCard,');
    expect(source).not.toContain('LoginBox');
    expect(source).not.toContain('LoginBoxV2');
  });

  it('注册 Table，保持 Ob* 组件命名规则一致', () => {
    expect(source).toContain("import Table from './components/table/Table.vue';");
    expect(source).toContain('Table,');
    expect(source).not.toContain('TanStackTable');
  });

  it('应注册 CommandPalette，供应用层统一接入菜单搜索', () => {
    expect(source).toContain("import { CommandPalette } from './components/command-palette';");
    expect(source).toContain('CommandPalette');
  });

  it('应注册 DialogHost，供应用层挂载全局弹窗宿主', () => {
    expect(source).toContain("import { DialogHost } from './components/dialog-host';");
    expect(source).toContain('DialogHost');
  });
});
