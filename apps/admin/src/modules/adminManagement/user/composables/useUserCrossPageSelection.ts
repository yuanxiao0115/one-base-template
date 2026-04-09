import { computed, nextTick, reactive, ref, type Ref } from 'vue';
import type { UserListRecord } from '../types';

interface TableInstanceExpose {
  clearSelection?: () => void;
  toggleRowSelection?: (row: UserListRecord, selected?: boolean) => void;
}

interface TableRefExpose {
  getTableRef?: () => TableInstanceExpose | null;
}

interface UseUserCrossPageSelectionOptions {
  tableRef: Ref<unknown>;
  dataList: Ref<UserListRecord[]>;
  onSelectionCancel: (tableRef: unknown) => void;
  onSelectionChangeRaw: (selection: UserListRecord[]) => void;
}

function getUserRowId(row: UserListRecord): string {
  const id = row?.id;
  return typeof id === 'string' && id.trim() ? id : '';
}

export function useUserCrossPageSelection(options: UseUserCrossPageSelectionOptions) {
  const crossPageSelectedMap = reactive<Record<string, UserListRecord>>({});
  const syncingSelection = ref(false);

  const crossPageSelectedList = computed<UserListRecord[]>(() =>
    Object.values(crossPageSelectedMap)
  );

  function clearCrossPageSelection() {
    Object.keys(crossPageSelectedMap).forEach((id) => {
      delete crossPageSelectedMap[id];
    });
  }

  function removeSelectionById(id: string) {
    if (!id) {
      return;
    }
    delete crossPageSelectedMap[id];
  }

  function mergeCurrentPageSelection(selection: UserListRecord[]) {
    const currentPageIds = new Set(
      options.dataList.value.map((row) => getUserRowId(row)).filter((id) => id.length > 0)
    );

    currentPageIds.forEach((id) => {
      delete crossPageSelectedMap[id];
    });

    selection.forEach((row) => {
      const id = getUserRowId(row);
      if (!id) {
        return;
      }
      crossPageSelectedMap[id] = row;
    });
  }

  async function syncCurrentPageSelectionToTable() {
    const tableInstance = (options.tableRef.value as TableRefExpose | null)?.getTableRef?.();
    if (!tableInstance || typeof tableInstance.clearSelection !== 'function') {
      return;
    }

    syncingSelection.value = true;
    tableInstance.clearSelection();

    if (typeof tableInstance.toggleRowSelection === 'function') {
      options.dataList.value.forEach((row) => {
        const id = getUserRowId(row);
        if (!id || !crossPageSelectedMap[id]) {
          return;
        }
        tableInstance.toggleRowSelection?.(row, true);
      });
    }

    await nextTick();
    syncingSelection.value = false;
  }

  function clearAllSelection() {
    clearCrossPageSelection();
    options.onSelectionCancel(options.tableRef.value);
  }

  function handleSelectionChange(selection: UserListRecord[]) {
    if (syncingSelection.value) {
      return;
    }

    options.onSelectionChangeRaw(selection);
    mergeCurrentPageSelection(Array.isArray(selection) ? selection : []);
  }

  return {
    crossPageSelectedList,
    clearAllSelection,
    handleSelectionChange,
    syncCurrentPageSelectionToTable,
    removeSelectionById
  };
}
