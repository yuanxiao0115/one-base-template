import { describe, expect, it } from 'vite-plus/test';
import { readSourceFile } from './test-utils/read-source-file';

describe('CardTable source', () => {
  const source = readSourceFile('components/table/CardTable.vue');

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
