import { describe, expect, it } from 'vite-plus/test';

import listSource from '@/modules/adminManagement/menu/list.vue?raw';
import pageStateSource from '@/modules/adminManagement/menu/composables/useMenuManagementPageState.ts?raw';
import treeStateSource from '@/modules/adminManagement/menu/composables/useMenuPermissionTreeState.ts?raw';
import treeHelperSource from '@/modules/adminManagement/menu/composables/menuTreeHelpers.ts?raw';
import menuColumnsSource from '@/modules/adminManagement/menu/columns.ts?raw';
import formSource from '@/modules/adminManagement/menu/components/MenuPermissionEditForm.vue?raw';
import systemFormSource from '@/modules/adminManagement/menu/components/SystemPermissionEditForm.vue?raw';

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
    expect(listSource).toContain('class="system-menu-management-page__system-add-button"');
    expect(listSource).toContain('@click="actions.openRootCreateDialog"');
    expect(listSource).toContain('@click.stop="actions.openEdit(item.row)"');
    expect(listSource).toContain('@click.stop="actions.remove(item.row)"');
    expect(listSource).toContain(':drawer-size="editor.drawerSize"');
    expect(listSource).toContain(':drawer-columns="editor.drawerColumns"');
    expect(listSource).toContain('<SystemPermissionEditForm');
  });

  it('菜单管理树配置应对齐 Element Plus 字段，并支持按系统切片展示', () => {
    expect(pageStateSource).toContain('useMenuPermissionTreeState');
    expect(pageStateSource).toContain('tableTreeConfig');
    expect(menuColumnsSource).toContain('treeNode: true');
    expect(menuColumnsSource).toContain("label: '访问路径'");
    expect(menuColumnsSource).toContain("label: '状态'");
    expect(menuColumnsSource).not.toContain("label: '图标'");
    expect(menuColumnsSource).not.toContain("label: '缓存路由'");
    expect(menuColumnsSource).not.toContain("label: '打开方式'");
    expect(menuColumnsSource).not.toContain("label: '跳转地址'");
    expect(menuColumnsSource).not.toContain("label: '组件'");
    expect(menuColumnsSource).not.toContain("label: '备注'");
    expect(pageStateSource).toContain('activeSystemId');
    expect(pageStateSource).toContain('systemList');
    expect(treeStateSource).toContain('row: item');
    expect(pageStateSource).toContain('selectSystem');
    expect(pageStateSource).toContain('openCreateUnderActiveSystem');
    expect(pageStateSource).toContain('getSystemScopedTreeRows()');
    expect(treeStateSource).toContain('ensurePermissionTreeLoaded');
    expect(treeStateSource).toContain('findSystemScopeIdByNodeId');
    expect(treeStateSource).toContain('resolveScopeSystemId');
    expect(pageStateSource).toContain('await loadParentOptions(undefined, scopeSystemId);');
    expect(pageStateSource).toContain('await loadParentOptions(row.id, scopeSystemId);');
    expect(treeStateSource).toContain('const treeRows = await ensurePermissionTreeLoaded();');
    expect(pageStateSource).toContain('dataList.value = getSystemScopedTreeRows();');
    expect(pageStateSource).toContain('const isSystemForm = computed(() =>');
    expect(pageStateSource).toContain(
      'const drawerSize = computed(() => (isSystemForm.value ? 400 : 760));'
    );
    expect(pageStateSource).toContain(
      'const drawerColumns = computed(() => (isSystemForm.value ? 1 : 2));'
    );
    expect(treeStateSource).toContain('defaultExpandAll: true');
    expect(treeStateSource).toContain("children: 'children'");
    expect(treeHelperSource).toContain('markDescendants');
    expect(treeHelperSource).toContain('toParentTreeOptions');
    expect(pageStateSource).not.toContain('childrenField');
    expect(pageStateSource).not.toContain('transform: false');
  });

  it('菜单表单应改为树形上级选择，并限制顶级权限类型为系统', () => {
    expect(formSource).toContain('<el-tree-select');
    expect(formSource).toContain('availableResourceTypeOptions');
    expect(formSource).toContain('resourceTypeDisabled');
    expect(formSource).toContain('SYSTEM_RESOURCE_TYPE = 1');
    expect(formSource).not.toContain('label="组件路径"');
    expect(formSource).not.toContain('label="缓存路由"');
    expect(formSource).toContain('menu-permission-form__label-with-tip');
    expect(formSource).toContain('<QuestionFilled />');
    expect(formSource).toContain(
      '普通菜单填站内路由（如 /system/user）；内嵌外链填 /ext/*，微应用填 /micro/*。'
    );
    expect(formSource).toContain(
      '内嵌场景填写真实 http(s) 地址，作为外链或微应用入口。外部打开时优先使用此地址。'
    );
    expect(formSource).toContain(
      '内部：当前页路由内展示（含内嵌）；外部：浏览器新窗口打开，优先用跳转地址。'
    );
    expect(formSource).toContain('label="内部（当前页）"');
    expect(formSource).toContain('label="外部（浏览器新窗口）"');
    expect(formSource).not.toContain('menu-permission-form__tips');
    expect(formSource).not.toContain('menu-permission-form__field-tip');
    expect(systemFormSource).toContain('<el-option label="顶级权限（系统）" value="0" />');
    expect(systemFormSource).toContain('<el-option label="系统" :value="1" />');
    expect(systemFormSource).not.toContain('label="打开方式"');
    expect(systemFormSource).not.toContain('label="图片地址"');
    expect(systemFormSource).not.toContain('label="缓存路由"');
    expect(systemFormSource).not.toContain('label="跳转地址"');
  });
});
