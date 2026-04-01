import { describe, expect, it } from 'vite-plus/test';

import listSource from '@/modules/adminManagement/tenant-info/list.vue?raw';

describe('adminManagement/tenant-info list source', () => {
  it('租户信息管理页应切换为 ObTable，并保留分页与操作列接线', () => {
    expect(listSource).toContain('<ObTable');
    expect(listSource).not.toContain('<ObVxeTable');
    expect(listSource).toContain('@page-size-change="actions.handleSizeChange"');
    expect(listSource).toContain('@page-current-change="actions.handleCurrentChange"');
    expect(listSource).toContain('<template #tenantState="{ row }">');
    expect(listSource).toContain('<template #operation="{ row, size: actionSize }">');
  });
});
