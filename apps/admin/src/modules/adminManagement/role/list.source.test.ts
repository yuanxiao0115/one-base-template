import { describe, expect, it } from 'vite-plus/test';

import listSource from './list.vue?raw';

describe('adminManagement/role list source', () => {
  it('角色管理页应切换为 ObTanStackTable，保留分页与操作列插槽', () => {
    expect(listSource).toContain('<ObTanStackTable');
    expect(listSource).not.toContain('<ObVxeTable');
    expect(listSource).toContain('@page-size-change="actions.handleSizeChange"');
    expect(listSource).toContain('@page-current-change="actions.handleCurrentChange"');
    expect(listSource).toContain('<template #operation="{ row, size: actionSize }">');
  });
});
