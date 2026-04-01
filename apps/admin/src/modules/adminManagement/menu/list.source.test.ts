import { describe, expect, it } from 'vite-plus/test';

import listSource from './list.vue?raw';
import pageStateSource from './composables/useMenuManagementPageState.ts?raw';

describe('adminManagement/menu list source', () => {
  it('菜单管理页应切换为 ObTable，并保留树形配置与操作列插槽', () => {
    expect(listSource).toContain('<ObTable');
    expect(listSource).not.toContain('<ObTanStackTable');
    expect(listSource).toContain(':tree-config="table.tableTreeConfig"');
    expect(listSource).toContain('<template #operation="{ row, size: actionSize }">');
    expect(listSource).toContain('@click="actions.openCreateChild(row)"');
    expect(listSource).toContain('@click="actions.openCreateSibling(row)"');
  });

  it('菜单管理树配置应对齐 Element Plus 字段', () => {
    expect(pageStateSource).toContain('defaultExpandAll: true');
    expect(pageStateSource).toContain("children: 'children'");
    expect(pageStateSource).not.toContain('childrenField');
    expect(pageStateSource).not.toContain('transform: false');
  });
});
