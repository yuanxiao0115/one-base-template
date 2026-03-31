import { describe, expect, it } from 'vite-plus/test';

import listSource from './list.vue?raw';

describe('adminManagement/org list source', () => {
  it('组织管理页应切换为 ObTanStackTable，并保留树形配置与操作列插槽', () => {
    expect(listSource).toContain('<ObTanStackTable');
    expect(listSource).not.toContain('<ObVxeTable');
    expect(listSource).toContain(':tree-config="table.treeConfig"');
    expect(listSource).toContain(':pagination="false"');
    expect(listSource).toContain('<template #operation="{ row, size: actionSize }">');
    expect(listSource).toContain('@click="actions.openCreateChild(row)"');
  });
});
