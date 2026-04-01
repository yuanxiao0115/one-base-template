import { describe, expect, it } from 'vite-plus/test';

import listSource from '@/modules/adminManagement/menu/list.vue?raw';
import pageStateSource from '@/modules/adminManagement/menu/composables/useMenuManagementPageState.ts?raw';
import menuColumnsSource from '@/modules/adminManagement/menu/columns.ts?raw';
import formSource from '@/modules/adminManagement/menu/components/MenuPermissionEditForm.vue?raw';

describe('adminManagement/menu list source', () => {
  it('菜单管理页应切换为 ObTable，并保留树形配置与操作列插槽', () => {
    expect(listSource).toContain('<ObTable');
    expect(listSource).not.toContain('<ObTanStackTable');
    expect(listSource).toContain(':tree-config="table.tableTreeConfig"');
    expect(listSource).toContain('<template #operation="{ row, size: actionSize }">');
    expect(listSource).toContain('@click="actions.openCreateChild(row)"');
    expect(listSource).toContain('@click="actions.openCreateSibling(row)"');
    expect(listSource).toContain('<template #left>');
    expect(listSource).toContain('@select="actions.selectSystem"');
    expect(listSource).toContain('@click="actions.openCreateUnderActiveSystem"');
  });

  it('菜单管理树配置应对齐 Element Plus 字段，并支持按系统切片展示', () => {
    expect(pageStateSource).toContain('defaultExpandAll: true');
    expect(pageStateSource).toContain("children: 'children'");
    expect(menuColumnsSource).toContain('treeNode: true');
    expect(pageStateSource).toContain('activeSystemId');
    expect(pageStateSource).toContain('systemList');
    expect(pageStateSource).toContain('selectSystem');
    expect(pageStateSource).toContain('openCreateUnderActiveSystem');
    expect(pageStateSource).toContain('getSystemScopedTreeRows()');
    expect(pageStateSource).toContain('ensurePermissionTreeLoaded');
    expect(pageStateSource).toContain('const treeRows = await ensurePermissionTreeLoaded();');
    expect(pageStateSource).not.toContain('childrenField');
    expect(pageStateSource).not.toContain('transform: false');
  });

  it('菜单表单应改为树形上级选择，并限制顶级权限类型为系统', () => {
    expect(formSource).toContain('<el-tree-select');
    expect(formSource).toContain('availableResourceTypeOptions');
    expect(formSource).toContain('resourceTypeDisabled');
    expect(formSource).toContain('SYSTEM_RESOURCE_TYPE = 1');
    expect(formSource).toContain('v-if="showComponentField"');
    expect(formSource).not.toContain('<el-form-item label="组件路径" prop="component">');
  });
});
