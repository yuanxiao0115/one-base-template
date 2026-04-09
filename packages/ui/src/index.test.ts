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

  it('导出 CommandPalette 与相关 helper，保证菜单搜索能力可复用', () => {
    expect(source).toContain("export { CommandPalette } from './components/command-palette';");
    expect(source).toContain("} from './components/command-palette';");
  });

  it('导出 DialogHost 与指令式 API，支持全局弹窗编排', () => {
    expect(source).toContain("export { DialogHost } from './components/dialog-host';");
    expect(source).toContain("} from './components/dialog-host';");
  });

  it('obtable 子入口应注入图标与表格主题样式，避免样式变量丢失', () => {
    expect(obtableEntrySource).toContain("import './styles/iconfont.css';");
    expect(obtableEntrySource).toContain("import './styles/table-theme.css';");
  });
});
