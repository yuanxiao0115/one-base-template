import { describe, expect, it } from 'vite-plus/test';

import listSource from './list.vue?raw';

describe('adminManagement/user list source', () => {
  it('用户管理页应切换为 ObTable，并保留分页、选择和操作列接线', () => {
    expect(listSource).toContain('<ObTable');
    expect(listSource).not.toContain('<ObVxeTable');
    expect(listSource).toContain('@selection-change="actions.handleSelectionChange"');
    expect(listSource).toContain('@page-size-change="actions.handleSizeChange"');
    expect(listSource).toContain('@page-current-change="actions.handleCurrentChange"');
    expect(listSource).toContain('<template #operation="{ row, size: actionSize }">');
  });
});
