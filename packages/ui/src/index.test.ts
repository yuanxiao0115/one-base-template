import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

describe('ui root entry source', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/index.ts'), 'utf8');
  const obtableEntrySource = readFileSync(resolve(process.cwd(), 'src/obtable.ts'), 'utf8');

  it('保留登录组件导出，避免调用方编译期回归', () => {
    expect(source).toContain("export { LoginBox, LoginBoxV2 } from './lite-auth';");
    expect(source).toContain("export { default as ObCard } from './components/card/ObCard.vue';");
  });

  it('导出 Table，供业务统一使用 ObTable', () => {
    expect(source).toContain("export { default as Table } from './components/table/Table.vue';");
    expect(source).not.toContain('TanStackTable');
  });

  it('obtable 子入口应注入图标与表格主题样式，避免样式变量丢失', () => {
    expect(obtableEntrySource).toContain("import './styles/iconfont.css';");
    expect(obtableEntrySource).toContain("import './styles/table-theme.css';");
  });
});
