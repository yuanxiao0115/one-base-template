import { computed, ref, type ComputedRef } from 'vue';
import { menuPermissionApi } from '../api';
import type { MenuPermissionRecord, PermissionTypeOption } from '../types';
import type { ParentOption } from '../form';
import {
  ROOT_PARENT_ID,
  findSystemNodeById,
  findSystemScopeIdByNodeId,
  getSystemNodes,
  getTreeRows,
  markDescendants,
  toParentTreeOptions
} from './menuTreeHelpers';

interface SystemOption {
  id: string;
  name: string;
  row: MenuPermissionRecord;
}

interface UseMenuPermissionTreeStateOptions {
  inTreeMode: ComputedRef<boolean>;
}

export function useMenuPermissionTreeState(options: UseMenuPermissionTreeStateOptions) {
  const parentOptions = ref<ParentOption[]>([]);
  const resourceTypeOptions = ref<PermissionTypeOption[]>([]);
  const permissionTree = ref<MenuPermissionRecord[]>([]);
  const activeSystemId = ref('');

  const systemList = computed<SystemOption[]>(() => {
    return getSystemNodes(permissionTree.value).map((item) => ({
      id: item.id,
      name: item.resourceName,
      row: item
    }));
  });

  const activeSystemName = computed(() => {
    const active = findSystemNodeById(permissionTree.value, activeSystemId.value);
    return active?.resourceName || '未选择系统';
  });

  const hasSystemData = computed(() => systemList.value.length > 0);

  const tableTreeConfig = computed<Record<string, unknown> | undefined>(() => {
    if (!options.inTreeMode.value) {
      return undefined;
    }

    return {
      defaultExpandAll: true,
      children: 'children'
    };
  });

  function syncPermissionTree(treeRows: MenuPermissionRecord[]) {
    permissionTree.value = treeRows;

    const systems = getSystemNodes(treeRows);
    if (systems.length === 0) {
      activeSystemId.value = '';
      return;
    }

    const activeExists = systems.some((item) => item.id === activeSystemId.value);
    if (!activeExists) {
      activeSystemId.value = systems[0]?.id || '';
    }
  }

  function getSystemScopedTreeRows() {
    const activeSystem = findSystemNodeById(permissionTree.value, activeSystemId.value);
    if (!activeSystem) {
      return [];
    }

    return Array.isArray(activeSystem.children) ? activeSystem.children : [];
  }

  async function ensurePermissionTreeLoaded() {
    if (permissionTree.value.length > 0) {
      return permissionTree.value;
    }

    const response = await menuPermissionApi.getPermissionTree();
    if (response.code !== 200) {
      throw new Error(response.message || '获取权限树失败');
    }

    const treeRows = getTreeRows(response.data);
    syncPermissionTree(treeRows);
    return treeRows;
  }

  async function resolveScopeSystemId(nodeId: string) {
    if (!nodeId || nodeId === ROOT_PARENT_ID) {
      return '';
    }

    const treeRows = await ensurePermissionTreeLoaded();
    return findSystemScopeIdByNodeId(treeRows, nodeId);
  }

  async function loadParentOptions(disabledId?: string, scopeSystemId = '') {
    const treeRows = await ensurePermissionTreeLoaded();
    const disabledIds = new Set<string>();
    if (disabledId) {
      markDescendants(treeRows, disabledId, disabledIds);
    }

    if (scopeSystemId) {
      const scopedSystemNode = findSystemNodeById(treeRows, scopeSystemId);
      parentOptions.value = scopedSystemNode
        ? toParentTreeOptions([scopedSystemNode], disabledIds)
        : [];
      return;
    }

    parentOptions.value = [
      {
        value: ROOT_PARENT_ID,
        label: '顶级权限（系统）',
        children: toParentTreeOptions(treeRows, disabledIds)
      }
    ];
  }

  async function loadResourceTypeOptions() {
    const response = await menuPermissionApi.getResourceTypeEnum();
    if (response.code === 200 && Array.isArray(response.data)) {
      resourceTypeOptions.value = response.data;
      return;
    }

    resourceTypeOptions.value = [];
  }

  return {
    permissionTree,
    activeSystemId,
    systemList,
    activeSystemName,
    hasSystemData,
    tableTreeConfig,
    parentOptions,
    resourceTypeOptions,
    syncPermissionTree,
    getSystemScopedTreeRows,
    ensurePermissionTreeLoaded,
    resolveScopeSystemId,
    loadParentOptions,
    loadResourceTypeOptions
  };
}
