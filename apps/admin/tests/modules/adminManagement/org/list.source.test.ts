import { describe, expect, it } from 'vite-plus/test';

import listSource from '@/modules/adminManagement/org/list.vue?raw';
import pageStateSource from '@/modules/adminManagement/org/composables/useOrgPageState.ts?raw';
import treeQuerySource from '@/modules/adminManagement/org/composables/useOrgTreeQuery.ts?raw';
import orgColumnsSource from '@/modules/adminManagement/org/columns.tsx?raw';

describe('adminManagement/org list source', () => {
  it('组织管理页应切换为 ObTable，并保留树形配置与操作列插槽', () => {
    expect(listSource).toContain('<ObTable');
    expect(listSource).not.toContain('<ObTanStackTable');
    expect(listSource).toContain(':tree-config="table.treeConfig"');
    expect(listSource).toContain(':pagination="false"');
    expect(listSource).toContain('<template #operation="{ row, size: actionSize }">');
    expect(listSource).toContain('@click="actions.openCreateChild(row)"');
  });

  it('组织管理树配置应对齐 Element Plus 字段', () => {
    expect(pageStateSource).toContain("children: 'children'");
    expect(pageStateSource).toContain("hasChildren: 'hasChildren'");
    expect(pageStateSource).toContain('load: loadTreeChildren');
    expect(orgColumnsSource).toContain('treeNode: true');
    expect(pageStateSource).toContain('tableRef,');
    expect(pageStateSource).toContain("refreshAfterSave: 'none'");
    expect(pageStateSource).toContain('await refreshAfterSave({ payload, row });');
    expect(pageStateSource).not.toContain('childrenField');
    expect(pageStateSource).not.toContain('hasChildField');
    expect(pageStateSource).not.toContain('loadMethod');
    expect(pageStateSource).not.toContain("trigger: 'cell'");
    expect(pageStateSource).not.toContain('reserve: true');
  });

  it('组织管理懒加载应包含缓存与 lazyTreeNodeMap 清理能力', () => {
    expect(treeQuerySource).toContain('clearLazyTreeNodeMap()');
    expect(treeQuerySource).toContain('lazyTreeNodeMap.value = {};');
    expect(treeQuerySource).toContain('lazyNodeResolverCache.set(String(row.id)');
    expect(treeQuerySource).toContain('async function refreshTreeNode(parentId?: string)');
  });
});
