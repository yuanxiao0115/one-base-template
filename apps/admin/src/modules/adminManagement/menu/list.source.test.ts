import { describe, expect, it } from 'vite-plus/test';

import listSource from './list.vue?raw';

describe('adminManagement/menu list source', () => {
  it('菜单管理页应切换为 ObElementTable，并保留树形配置与操作列插槽', () => {
    expect(listSource).toContain('<ObElementTable');
    expect(listSource).not.toContain('<ObTanStackTable');
    expect(listSource).toContain(':tree-config="table.tableTreeConfig"');
    expect(listSource).toContain('<template #operation="{ row, size: actionSize }">');
    expect(listSource).toContain('@click="actions.openCreateChild(row)"');
    expect(listSource).toContain('@click="actions.openCreateSibling(row)"');
  });
});
