import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vite-plus/test';

describe('CardTable source', () => {
  const source = readFileSync(new URL('./components/table/CardTable.vue', import.meta.url), 'utf8');

  it('应改为 Element Plus 分页并移除 VxePager 依赖', () => {
    expect(source).toContain('<el-pagination');
    expect(source).toContain('@size-change="handlePageSizeChange"');
    expect(source).toContain('@current-change="handlePageCurrentChange"');
    expect(source).not.toContain('VxePager');
    expect(source).not.toContain('vxe-pc-ui');
    expect(source).not.toContain('.vxe-pager');
    expect(source).not.toContain('--vxe-ui-layout-background-color');
    expect(source).not.toContain('--vxe-ui-table-border-color');
  });
});
