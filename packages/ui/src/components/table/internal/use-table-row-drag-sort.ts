import { nextTick, onBeforeUnmount, watch, type ComputedRef } from 'vue';
import type { TableRowDragConfig, TableRowDragSortPayload } from '../types';

type RowRecord = Record<string, unknown>;

interface SortableLike {
  destroy: () => void;
}

interface SortableCtor {
  create: (element: HTMLElement, options?: Record<string, unknown>) => SortableLike;
}

interface SortableEndEvent {
  oldIndex?: number;
  newIndex?: number;
}

export type { TableRowDragConfig, TableRowDragSortPayload };

interface UseTableRowDragSortOptions {
  enabled: ComputedRef<boolean>;
  data: ComputedRef<RowRecord[]>;
  config: ComputedRef<TableRowDragConfig | undefined>;
  resolveTbody: () => HTMLElement | null;
  onSortEnd: (payload: TableRowDragSortPayload) => void;
}

function moveArrayItem<T>(list: T[], fromIndex: number, toIndex: number): T[] {
  const next = [...list];
  const [target] = next.splice(fromIndex, 1);
  if (typeof target === 'undefined') {
    return next;
  }
  next.splice(toIndex, 0, target);
  return next;
}

let cachedSortableCtor: SortableCtor | null = null;
let loadingSortableCtor: Promise<SortableCtor | null> | null = null;

async function ensureSortableCtor() {
  if (cachedSortableCtor) {
    return cachedSortableCtor;
  }
  if (loadingSortableCtor) {
    return loadingSortableCtor;
  }
  loadingSortableCtor = import('sortablejs')
    .then((module) => {
      const ctor = (module.default || module) as Partial<SortableCtor>;
      if (typeof ctor?.create !== 'function') {
        return null;
      }
      cachedSortableCtor = ctor as SortableCtor;
      return cachedSortableCtor;
    })
    .catch(() => null)
    .finally(() => {
      loadingSortableCtor = null;
    });
  return loadingSortableCtor;
}

export function useTableRowDragSort(options: UseTableRowDragSortOptions) {
  let sortableInstance: SortableLike | null = null;
  let initToken = 0;

  function destroySortable() {
    sortableInstance?.destroy();
    sortableInstance = null;
  }

  function buildSortableOptions(): Record<string, unknown> {
    const dragConfig = options.config.value;
    return {
      animation: dragConfig?.animation ?? 180,
      handle: dragConfig?.handle,
      ghostClass: dragConfig?.ghostClass ?? 'ob-table__drag-ghost',
      chosenClass: dragConfig?.chosenClass ?? 'ob-table__drag-chosen',
      dragClass: dragConfig?.dragClass ?? 'ob-table__dragging',
      onEnd: (event: unknown) => {
        const { oldIndex, newIndex } = event as SortableEndEvent;
        if (typeof oldIndex !== 'number' || typeof newIndex !== 'number') {
          return;
        }
        if (oldIndex === newIndex) {
          return;
        }

        const rows = options.data.value;
        if (oldIndex < 0 || newIndex < 0 || oldIndex >= rows.length || newIndex >= rows.length) {
          return;
        }

        const nextRows = moveArrayItem(rows, oldIndex, newIndex);
        options.onSortEnd({
          oldIndex,
          newIndex,
          row: nextRows[newIndex],
          rows: nextRows
        });
      }
    };
  }

  async function initSortable() {
    const currentToken = ++initToken;
    if (!(options.enabled.value && options.data.value.length > 0)) {
      destroySortable();
      return;
    }

    await nextTick();
    if (currentToken !== initToken) {
      return;
    }

    const tbody = options.resolveTbody();
    if (!tbody) {
      destroySortable();
      return;
    }

    const SortableCtor = await ensureSortableCtor();
    if (currentToken !== initToken) {
      return;
    }
    if (!SortableCtor) {
      return;
    }

    destroySortable();
    sortableInstance = SortableCtor.create(tbody, buildSortableOptions());
  }

  watch(
    [options.enabled, options.data, options.config],
    () => {
      void initSortable();
    },
    { immediate: true }
  );

  onBeforeUnmount(() => {
    destroySortable();
  });

  return {
    initSortable,
    destroySortable
  };
}
