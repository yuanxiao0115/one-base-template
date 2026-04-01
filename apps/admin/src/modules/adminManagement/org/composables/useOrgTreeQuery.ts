import { type ComputedRef, type Ref, ref } from 'vue';
import { message } from '@one-base-template/ui';
import { orgApi } from '../api';
import type { OrgRecord } from '../types';

interface SearchRefExpose {
  resetFields?: () => void;
}

interface TableRefExpose {
  getTableRef?: () => {
    store?: {
      states?: {
        lazyTreeNodeMap?: {
          value?: Record<string, unknown>;
        };
      };
    };
  } | null;
}

interface UseOrgTreeQueryOptions {
  inSearchMode: ComputedRef<boolean>;
  searchForm: { orgName: string };
  searchRef: Ref<SearchRefExpose | undefined>;
  tableRef: Ref<unknown>;
  onSearch: (goFirstPage?: boolean) => Promise<void>;
  resetForm: (formRef: Ref<SearchRefExpose | undefined>, keywordField?: string) => void;
}

interface TreeCacheEntry {
  data: OrgRecord[];
  timestamp: number;
}

const CACHE_EXPIRE_TIME = 5 * 60 * 1000;

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function useOrgTreeQuery(options: UseOrgTreeQueryOptions) {
  const { inSearchMode, searchForm, searchRef, tableRef, onSearch, resetForm } = options;

  const treeChildrenCache = new Map<string, TreeCacheEntry>();
  const deletingRow = ref<OrgRecord | null>(null);
  const lazyNodeResolverCache = new Map<
    string,
    {
      row: OrgRecord;
      treeNode: unknown;
      resolve: (rows: OrgRecord[]) => void;
    }
  >();

  function clearLazyTreeNodeMap() {
    const tableInstance = (tableRef.value as TableRefExpose | null | undefined)?.getTableRef?.();
    const store = tableInstance?.store;
    const states = store?.states;
    const lazyTreeNodeMap = states?.lazyTreeNodeMap;
    if (!lazyTreeNodeMap || typeof lazyTreeNodeMap.value !== 'object') {
      return;
    }
    lazyTreeNodeMap.value = {};
  }

  function clearTreeCache() {
    treeChildrenCache.clear();
    lazyNodeResolverCache.clear();
    clearLazyTreeNodeMap();
  }

  function isCacheExpired(cache: TreeCacheEntry): boolean {
    return Date.now() - cache.timestamp > CACHE_EXPIRE_TIME;
  }

  function getCacheRows(parentId: string): OrgRecord[] | null {
    const cache = treeChildrenCache.get(parentId);
    if (!cache) {
      return null;
    }

    if (isCacheExpired(cache)) {
      treeChildrenCache.delete(parentId);
      return null;
    }

    return cache.data;
  }

  function saveCacheRows(parentId: string, rows: OrgRecord[]) {
    treeChildrenCache.set(parentId, {
      data: rows,
      timestamp: Date.now()
    });
  }

  async function queryTreeChildren(row: OrgRecord) {
    if (inSearchMode.value) {
      return [];
    }

    const parentId = String(row.id);
    const cacheRows = getCacheRows(parentId);
    if (cacheRows) {
      return cacheRows;
    }

    try {
      const response = await orgApi.getOrgTree({ parentId });
      if (response.code !== 200) {
        throw new Error(response.message || '加载下级组织失败');
      }

      const rows = Array.isArray(response.data) ? response.data : [];
      if (!rows.length) {
        row.hasChildren = false;
      }

      saveCacheRows(parentId, rows);
      return rows;
    } catch (error) {
      message.error(getErrorMessage(error, '加载下级组织失败'));
      return [];
    }
  }

  async function loadTreeChildren(
    row: OrgRecord,
    treeNode: unknown,
    resolve: (rows: OrgRecord[]) => void
  ) {
    lazyNodeResolverCache.set(String(row.id), {
      row,
      treeNode,
      resolve
    });
    const rows = await queryTreeChildren(row);
    resolve(rows);
    return rows;
  }

  async function refreshTreeNode(parentId?: string): Promise<boolean> {
    if (!parentId) {
      return false;
    }
    if (inSearchMode.value) {
      return false;
    }

    const resolvedParentId = String(parentId);
    const lazyNode = lazyNodeResolverCache.get(resolvedParentId);
    if (!lazyNode) {
      return false;
    }

    treeChildrenCache.delete(resolvedParentId);
    const rows = await queryTreeChildren(lazyNode.row);
    lazyNode.resolve(rows);
    return true;
  }

  async function refreshTable() {
    clearTreeCache();
    await onSearch(false);
  }

  function markDeletingRow(row: OrgRecord) {
    deletingRow.value = row;
  }

  function clearDeletingRow() {
    deletingRow.value = null;
  }

  function clearDeletingRowIfMatched(row: OrgRecord) {
    if (deletingRow.value?.id === row.id) {
      deletingRow.value = null;
    }
  }

  function invalidateDeletedRowCache() {
    const row = deletingRow.value;
    deletingRow.value = null;

    if (!row || inSearchMode.value) {
      clearTreeCache();
      return;
    }

    treeChildrenCache.delete(String(row.id || ''));
    treeChildrenCache.delete(String(row.parentId || ''));
  }

  function tableSearch(keyword: string) {
    searchForm.orgName = keyword;
    clearTreeCache();
    void onSearch();
  }

  function onKeywordUpdate(keyword: string) {
    searchForm.orgName = keyword;
  }

  function onResetSearch() {
    clearTreeCache();
    resetForm(searchRef, 'orgName');
  }

  return {
    clearTreeCache,
    loadTreeChildren,
    refreshTreeNode,
    refreshTable,
    markDeletingRow,
    clearDeletingRow,
    clearDeletingRowIfMatched,
    invalidateDeletedRowCache,
    tableSearch,
    onKeywordUpdate,
    onResetSearch
  };
}
