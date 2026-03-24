import { type Ref, ref } from 'vue';
import { orgApi } from '../api';
import type { OrgRecord } from '../types';
import type { OrgTreeOption } from '../form';

interface UseOrgTreeOptionsParams {
  rootParentId: Ref<string>;
}

function getSortedRows(rows: OrgRecord[]): OrgRecord[] {
  return [...rows].sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0));
}

function getTreeOptions(rows: OrgRecord[]): OrgTreeOption[] {
  return getSortedRows(rows).map((row) => ({
    value: row.id,
    label: row.orgName,
    children: Array.isArray(row.children) ? getTreeOptions(row.children) : undefined
  }));
}

function markChildIds(row: OrgRecord, ids: Set<string>) {
  if (!Array.isArray(row.children) || row.children.length === 0) {
    return;
  }

  row.children.forEach((child) => {
    ids.add(child.id);
    markChildIds(child, ids);
  });
}

function getDisabledIds(rows: OrgRecord[], targetId: string, ids: Set<string>): boolean {
  for (const row of rows) {
    if (row.id === targetId) {
      ids.add(row.id);
      markChildIds(row, ids);
      return true;
    }

    if (Array.isArray(row.children) && row.children.length > 0) {
      const found = getDisabledIds(row.children, targetId, ids);
      if (found) {
        return true;
      }
    }
  }

  return false;
}

function getDisabledTreeOptions(options: OrgTreeOption[], ids: Set<string>): OrgTreeOption[] {
  return options.map((item) => ({
    ...item,
    disabled: ids.has(item.value),
    children: Array.isArray(item.children) ? getDisabledTreeOptions(item.children, ids) : undefined
  }));
}

function hasOptionValue(options: OrgTreeOption[], targetValue: string): boolean {
  for (const item of options) {
    if (item.value === targetValue) {
      return true;
    }
    if (Array.isArray(item.children) && item.children.length > 0) {
      const found = hasOptionValue(item.children, targetValue);
      if (found) {
        return true;
      }
    }
  }

  return false;
}

export function useOrgTreeOptions(params: UseOrgTreeOptionsParams) {
  const { rootParentId } = params;
  const orgTreeOptions = ref<OrgTreeOption[]>([]);

  async function loadOrgTreeOptions(disabledId?: string) {
    const response = await orgApi.queryAllOrgTree();
    if (response.code !== 200) {
      throw new Error(response.message || '加载组织树失败');
    }

    const rows = Array.isArray(response.data) ? response.data : [];
    const disabledIds = new Set<string>();

    if (disabledId) {
      getDisabledIds(rows, disabledId, disabledIds);
    }

    let options = getDisabledTreeOptions(getTreeOptions(rows), disabledIds);

    if (!hasOptionValue(options, rootParentId.value)) {
      options = [
        {
          value: rootParentId.value,
          label: '顶级组织',
          children: options
        }
      ];
    }

    orgTreeOptions.value = options;
  }

  return {
    orgTreeOptions,
    loadOrgTreeOptions
  };
}
