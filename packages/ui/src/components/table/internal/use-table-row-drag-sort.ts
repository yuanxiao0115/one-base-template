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
let warnedSortableUnavailable = false;

function warnSortableUnavailable() {
  if (warnedSortableUnavailable) {
    return;
  }
  warnedSortableUnavailable = true;
  console.warn('[ObTable] rowDrag 初始化失败：请确认已安装 sortablejs 依赖。');
}

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
        warnSortableUnavailable();
        return null;
      }
      cachedSortableCtor = ctor as SortableCtor;
      return cachedSortableCtor;
    })
    .catch(() => {
      warnSortableUnavailable();
      return null;
    })
    .finally(() => {
      loadingSortableCtor = null;
    });
  return loadingSortableCtor;
}

export function useTableRowDragSort(options: UseTableRowDragSortOptions) {
  let sortableInstance: SortableLike | null = null;
  let activeTbody: HTMLElement | null = null;
  let keyboardCleanup: (() => void) | null = null;
  let lastConfigSignature = '';
  let initToken = 0;
  let initTask: Promise<void> | null = null;

  function applyKeyboardFocusableRows(tbody: HTMLElement) {
    tbody.querySelectorAll('tr').forEach((row) => {
      row.setAttribute('tabindex', '0');
      row.setAttribute('aria-label', '可拖拽行，按 Alt+方向键调整顺序');
    });
  }

  function clearKeyboardFocusableRows(tbody: HTMLElement | null) {
    if (!tbody) {
      return;
    }
    tbody.querySelectorAll('tr').forEach((row) => {
      row.removeAttribute('tabindex');
      row.removeAttribute('aria-label');
    });
  }

  function bindKeyboardSort(tbody: HTMLElement) {
    applyKeyboardFocusableRows(tbody);
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey) {
        return;
      }
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
        return;
      }
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable) {
        return;
      }
      const rowElement = target?.closest('tr');
      if (!(rowElement instanceof HTMLElement)) {
        return;
      }
      const rows = Array.from(tbody.querySelectorAll('tr'));
      const oldIndex = rows.indexOf(rowElement);
      if (oldIndex < 0) {
        return;
      }
      const delta = event.key === 'ArrowUp' ? -1 : 1;
      const newIndex = oldIndex + delta;
      if (newIndex < 0 || newIndex >= rows.length) {
        return;
      }
      const sourceRows = options.data.value;
      if (oldIndex >= sourceRows.length || newIndex >= sourceRows.length) {
        return;
      }
      event.preventDefault();
      const nextRows = moveArrayItem(sourceRows, oldIndex, newIndex);
      options.onSortEnd({
        oldIndex,
        newIndex,
        row: nextRows[newIndex],
        rows: nextRows
      });
      void nextTick(() => {
        const latestRows = Array.from(tbody.querySelectorAll('tr'));
        (latestRows[newIndex] as HTMLElement | undefined)?.focus?.();
      });
    };
    tbody.addEventListener('keydown', onKeyDown);
    return () => {
      tbody.removeEventListener('keydown', onKeyDown);
      clearKeyboardFocusableRows(tbody);
    };
  }

  function resolveConfigSignature(config: TableRowDragConfig | undefined) {
    return [
      config?.handle ?? '',
      String(config?.animation ?? 180),
      config?.ghostClass ?? 'ob-table__drag-ghost',
      config?.chosenClass ?? 'ob-table__drag-chosen',
      config?.dragClass ?? 'ob-table__dragging'
    ].join('|');
  }

  function destroySortable() {
    sortableInstance?.destroy();
    sortableInstance = null;
    keyboardCleanup?.();
    keyboardCleanup = null;
    clearKeyboardFocusableRows(activeTbody);
    activeTbody = null;
    lastConfigSignature = '';
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

    const nextConfigSignature = resolveConfigSignature(options.config.value);
    if (sortableInstance && activeTbody === tbody && lastConfigSignature === nextConfigSignature) {
      applyKeyboardFocusableRows(tbody);
      return;
    }

    destroySortable();
    sortableInstance = SortableCtor.create(tbody, buildSortableOptions());
    keyboardCleanup = bindKeyboardSort(tbody);
    activeTbody = tbody;
    lastConfigSignature = nextConfigSignature;
  }

  function scheduleInitSortable() {
    if (initTask) {
      return;
    }
    initTask = Promise.resolve()
      .then(() => initSortable())
      .finally(() => {
        initTask = null;
      });
  }

  watch(
    () => options.enabled.value,
    () => {
      scheduleInitSortable();
    },
    { immediate: true }
  );

  watch(
    () => options.data.value.length,
    () => {
      scheduleInitSortable();
    }
  );

  watch(options.data, () => {
    scheduleInitSortable();
  });

  watch(
    options.config,
    () => {
      scheduleInitSortable();
    },
    { deep: true }
  );

  onBeforeUnmount(() => {
    initToken += 1;
    initTask = null;
    destroySortable();
  });

  return {
    initSortable,
    destroySortable
  };
}
