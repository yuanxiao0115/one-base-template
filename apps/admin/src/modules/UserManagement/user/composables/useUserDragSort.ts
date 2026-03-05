import { nextTick, onBeforeUnmount, ref, type Ref, watch } from 'vue';
import type Sortable from 'sortablejs';
import { userApi, type UserListRecord } from '../api';
import {
  buildAdjustOrgSortPayload,
  buildSortableOptions,
  moveArrayItem,
  type PaginationLike
} from '../utils/dragSort';

type SortableCtor = {
  create: (element: HTMLElement, options?: Record<string, unknown>) => Sortable
}

type SortableEndEvent = {
  oldIndex?: number
  newIndex?: number
}

type UseUserDragSortOptions = {
  tableRef: Ref<unknown>
  canDragSort: Ref<boolean>
  dataList: Ref<UserListRecord[]>
  orgId: Ref<string>
  pagination: PaginationLike
  onSearch: (goFirstPage?: boolean) => Promise<void>
}

export function useUserDragSort (options: UseUserDragSortOptions) {
  const {
    tableRef,
    canDragSort,
    dataList,
    orgId,
    pagination,
    onSearch
  } = options;

  const sortableCtor = ref<SortableCtor | null>(null);
  const sortableInstance = ref<Sortable | null>(null);
  let sortableInitToken = 0;

  function getTableBodyElement () {
    const tableEl = (tableRef.value as { $el?: HTMLElement } | null)?.$el;
    if (!tableEl) {
      return null;
    }

    return (
      tableEl.querySelector('.vxe-table--body-wrapper tbody')
      || tableEl.querySelector('.vxe-table--main-body tbody')
    );
  }

  function destroySortable () {
    sortableInstance.value?.destroy();
    sortableInstance.value = null;
  }

  async function ensureSortableCtor () {
    if (sortableCtor.value) {
      return sortableCtor.value;
    }
    const imported = await import('sortablejs');
    const importedRecord = imported as unknown as Record<string, unknown>;
    const ctor = (importedRecord.default || importedRecord) as SortableCtor;
    sortableCtor.value = ctor;
    return ctor;
  }

  async function handleSortEnd (event: SortableEndEvent) {
    if (!canDragSort.value) {
      return;
    }

    const { oldIndex, newIndex } = event;
    if (oldIndex == null || newIndex == null || oldIndex === newIndex) {
      return;
    }

    const rows = dataList.value || [];
    const currentRow = rows[oldIndex];
    if (!currentRow) {
      return;
    }

    dataList.value = moveArrayItem(rows, oldIndex, newIndex);

    const payload = buildAdjustOrgSortPayload({
      orgId: orgId.value,
      rowId: currentRow.id,
      newIndex,
      pagination
    });

    if (!payload) {
      return;
    }

    try {
      const response = await userApi.adjustOrgSort(payload);
      if (response.code !== 200) {
        throw new Error(response.message || '用户排序更新失败');
      }
    } catch {
      await onSearch(false);
    }
  }

  async function initSortable () {
    const currentToken = ++sortableInitToken;
    if (!canDragSort.value || !Array.isArray(dataList.value) || dataList.value.length === 0) {
      destroySortable();
      return;
    }

    await nextTick();
    if (currentToken !== sortableInitToken) {
      return;
    }

    const tbody = getTableBodyElement();
    if (!tbody) {
      return;
    }

    const SortableCtor = await ensureSortableCtor();
    if (currentToken !== sortableInitToken) {
      return;
    }

    destroySortable();
    sortableInstance.value = SortableCtor.create(tbody as HTMLElement,
      buildSortableOptions((event: unknown) => {
        void handleSortEnd(event as SortableEndEvent);
      }));
  }

  watch([
    canDragSort,
    dataList,
    () => pagination.currentPage,
    () => pagination.pageSize
  ],
  () => {
    void initSortable();
  });

  onBeforeUnmount(() => {
    sortableInitToken += 1;
    destroySortable();
  });
}
