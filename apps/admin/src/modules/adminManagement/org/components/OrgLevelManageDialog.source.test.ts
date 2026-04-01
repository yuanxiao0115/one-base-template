import { describe, expect, it } from 'vite-plus/test';

import dialogSource from './OrgLevelManageDialog.vue?raw';

describe('adminManagement/org OrgLevelManageDialog source', () => {
  it('等级管理对话框应切换为 ObTable，并保留操作列插槽', () => {
    expect(dialogSource).toContain('<ObTable');
    expect(dialogSource).not.toContain('<ObVxeTable');
    expect(dialogSource).toContain('<template #operation="{ row, size }">');
    expect(dialogSource).toContain('@click="levelCrud.openEdit(row)"');
    expect(dialogSource).toContain('@click="handleDelete(row)"');
  });
});
