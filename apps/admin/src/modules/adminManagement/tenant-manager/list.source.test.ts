import { describe, expect, it } from 'vite-plus/test';

import listSource from './list.vue?raw';

describe('adminManagement/tenant-manager list source', () => {
  it('租户管理员管理页应切换为 ObTable，并保留分页与操作列接线', () => {
    expect(listSource).toContain('<ObTable');
    expect(listSource).not.toContain('<ObVxeTable');
    expect(listSource).toContain('@page-size-change="actions.handleSizeChange"');
    expect(listSource).toContain('@page-current-change="actions.handleCurrentChange"');
    expect(listSource).toContain('<template #isEnable="{ row }">');
    expect(listSource).toContain('<template #operation="{ row, size: actionSize }">');
  });
});
