import { describe, expect, it } from 'vite-plus/test';

import listSource from './list.vue?raw';

describe('adminManagement/role-assign list source', () => {
  it('角色分配页应切换为 ObElementTable，保留选择与分页交互', () => {
    expect(listSource).toContain('<ObElementTable');
    expect(listSource).not.toContain('<ObTanStackTable');
    expect(listSource).toContain('@selection-change="actions.handleSelectionChange"');
    expect(listSource).toContain('@page-size-change="actions.handleSizeChange"');
    expect(listSource).toContain('@page-current-change="actions.handleCurrentChange"');
    expect(listSource).toContain('<template #operation="{ row, size: actionSize }">');
  });
});
