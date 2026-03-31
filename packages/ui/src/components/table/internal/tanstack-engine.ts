import { computed, h, ref, watch, type ComputedRef, type Slots, type VNodeChild } from 'vue';
import {
  type Cell,
  type ColumnOrderState,
  type ColumnSizingState,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useVueTable,
  type CellContext,
  type Column,
  type ColumnDef,
  type ExpandedState,
  type HeaderContext,
  type OnChangeFn,
  type Row,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type Table as TanStackTableInstance,
  type VisibilityState
} from '@tanstack/vue-table';
import type { TableAlign, TableColumn, TableColumnList, TableColumnRendererParams } from '../types';
import treeToggleCollapsedIcon from '../assets/tree-toggle-collapsed.svg';
import treeToggleExpandedIcon from '../assets/tree-toggle-expanded.svg';

type RowRecord = Record<string, unknown>;
type VxeEventParams = Record<string, unknown>;

interface TableRuntimeProps extends Record<string, unknown> {
  rowKey: string;
  alignWhole: TableAlign;
  headerAlign?: TableAlign;
  showOverflowTooltip: boolean;
  treeConfig?: Record<string, unknown>;
  reserveSelection?: boolean;
}

interface TableColumnMeta {
  align: TableAlign;
  headerAlign: TableAlign;
  fixed?: TableColumn['fixed'];
  width?: string | number;
  minWidth?: string | number;
  className?: string;
  showOverflow?: boolean;
  originalColumn: TableColumn;
  isOperationColumn: boolean;
  isTreeNode: boolean;
  isCustomSort: boolean;
}

interface UseTanStackTableEngineOptions {
  data: ComputedRef<RowRecord[]>;
  columns: ComputedRef<TableColumnList>;
  props: ComputedRef<TableRuntimeProps>;
  attrs: ComputedRef<Record<string, unknown>>;
  slots: Slots;
  emitSelectionChange: (selection: RowRecord[]) => void;
  emitSortChange: (payload: VxeEventParams) => void;
}

function applyUpdater<T>(updaterOrValue: T | ((old: T) => T), state: { value: T }) {
  state.value =
    typeof updaterOrValue === 'function'
      ? (updaterOrValue as (old: T) => T)(state.value)
      : updaterOrValue;
}

function cloneRows(rows: RowRecord[], childrenField: string): RowRecord[] {
  return rows.map((row) => {
    const nextRow: RowRecord = { ...row };
    const children = row[childrenField];
    if (Array.isArray(children)) {
      nextRow[childrenField] = cloneRows(children as RowRecord[], childrenField);
    }
    return nextRow;
  });
}

function resolveColumnField(prop: TableColumn['prop'], index: number): string | undefined {
  if (typeof prop === 'function') {
    const result = prop(index);
    return typeof result === 'string' && result.length > 0 ? result : undefined;
  }
  return typeof prop === 'string' && prop.length > 0 ? prop : undefined;
}

function resolveColumnId(column: TableColumn, index: number, parentPath = '') {
  const field = resolveColumnField(column.prop, index);
  return field || `${parentPath}${column.type || 'column'}-${index}`;
}

function resolveColumnHidden(column: TableColumn): boolean {
  if (typeof column.hide === 'function') {
    return Boolean(column.hide(column));
  }
  return Boolean(column.hide);
}

function resolveColumnSize(value?: string | number): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function resolveColumnSizeStyle(value?: string | number): string | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${value}px`;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  return undefined;
}

function collectLeafColumnIds(columns: TableColumnList, parentPath = ''): string[] {
  const leafIds: string[] = [];
  columns.forEach((column, index) => {
    const columnId = resolveColumnId(column, index, parentPath);
    if (Array.isArray(column.children) && column.children.length > 0) {
      leafIds.push(...collectLeafColumnIds(column.children, `${columnId}-`));
      return;
    }
    leafIds.push(columnId);
  });
  return leafIds;
}

function collectColumnVisibility(
  columns: TableColumnList,
  parentPath = ''
): Record<string, boolean> {
  const visibility: Record<string, boolean> = {};
  columns.forEach((column, index) => {
    const columnId = resolveColumnId(column, index, parentPath);
    visibility[columnId] = !resolveColumnHidden(column);
    if (Array.isArray(column.children) && column.children.length > 0) {
      Object.assign(visibility, collectColumnVisibility(column.children, `${columnId}-`));
    }
  });
  return visibility;
}

function resolveTreeChildrenField(treeConfig?: Record<string, unknown>) {
  const childrenField = treeConfig?.childrenField;
  return typeof childrenField === 'string' && childrenField.length > 0 ? childrenField : 'children';
}

function resolveTreeHasChildField(treeConfig?: Record<string, unknown>) {
  const hasChildField = treeConfig?.hasChildField;
  return typeof hasChildField === 'string' && hasChildField.length > 0
    ? hasChildField
    : 'hasChildren';
}

function resolveTreeTrigger(treeConfig?: Record<string, unknown>) {
  return treeConfig?.trigger === 'cell' ? 'cell' : 'button';
}

function shouldReserveExpanded(treeConfig?: Record<string, unknown>) {
  return treeConfig?.reserve === true;
}

function shouldExpandAll(treeConfig?: Record<string, unknown>) {
  return treeConfig?.expandAll === true;
}

type TreeLoadMethod = (params: { row: RowRecord }) => Promise<unknown[]> | unknown[];

function resolveTreeLoadMethod(treeConfig?: Record<string, unknown>): TreeLoadMethod | null {
  const loadMethod = treeConfig?.loadMethod;
  return typeof loadMethod === 'function' ? (loadMethod as TreeLoadMethod) : null;
}

function collectRowKeys(
  rows: RowRecord[],
  childrenField: string,
  rowKey: string,
  keySet: Set<string>
) {
  rows.forEach((row, index) => {
    keySet.add(getRowKey(row, index, rowKey));
    const children = row[childrenField];
    if (Array.isArray(children)) {
      collectRowKeys(children as RowRecord[], childrenField, rowKey, keySet);
    }
  });
}

function filterExpandedState(
  previous: ExpandedState,
  rows: RowRecord[],
  childrenField: string,
  rowKey: string
): ExpandedState {
  if (previous === true) {
    return true;
  }
  if (!previous || typeof previous !== 'object') {
    return {};
  }

  const keySet = new Set<string>();
  collectRowKeys(rows, childrenField, rowKey, keySet);

  const nextState: Record<string, boolean> = {};
  Object.entries(previous).forEach(([key, value]) => {
    if (value && keySet.has(key)) {
      nextState[key] = true;
    }
  });
  return nextState;
}

function createExpandedState(
  rows: RowRecord[],
  childrenField: string,
  hasChildField: string,
  rowKey: string
): ExpandedState {
  const nextState: Record<string, boolean> = {};

  const travel = (items: RowRecord[]) => {
    items.forEach((row, index) => {
      const children = row[childrenField];
      const hasChildren = Array.isArray(children) && children.length > 0;
      const hasRemoteChildren = Boolean(row[hasChildField]);

      if (hasChildren || hasRemoteChildren) {
        nextState[getRowKey(row, index, rowKey)] = true;
      }

      if (hasChildren) {
        travel(children as RowRecord[]);
      }
    });
  };

  travel(rows);
  return nextState;
}

function resolveSortField(column: TableColumn | undefined, fallback: string): string {
  if (!column) {
    return fallback;
  }

  if (typeof column.sortBy === 'string' && column.sortBy.length > 0) {
    return column.sortBy;
  }

  if (Array.isArray(column.sortBy)) {
    const firstSortField = column.sortBy.find(
      (item) => typeof item === 'string' && item.length > 0
    );
    if (firstSortField) {
      return firstSortField;
    }
  }

  if (typeof column.prop === 'string' && column.prop.length > 0) {
    return column.prop;
  }

  return fallback;
}

function resolveSortProp(column: TableColumn | undefined, fallback: string): string {
  if (!column) {
    return fallback;
  }
  if (typeof column.prop === 'string' && column.prop.length > 0) {
    return column.prop;
  }
  return fallback;
}

function resolveColumnOverflow(column: TableColumn, index: number, props: TableRuntimeProps) {
  const field = resolveColumnField(column.prop, index) || '';
  const slotName = column.slot || '';
  const label = column.label || '';
  const isOperationColumn =
    ['operation', 'action', 'actions'].includes(field) ||
    ['operation', 'action', 'actions'].includes(slotName) ||
    label.includes('操作');

  return {
    showOverflow: isOperationColumn
      ? false
      : (column.showOverflowTooltip ?? props.showOverflowTooltip),
    isOperationColumn
  };
}

function getRowKey(row: RowRecord, index: number, rowKey: string) {
  const candidate = row[rowKey];
  return typeof candidate === 'string' || typeof candidate === 'number'
    ? String(candidate)
    : `${index}`;
}

function getRowValue(row: RowRecord, field?: string) {
  if (!field) {
    return '';
  }
  return row[field];
}

function createDefaultCellValue(
  row: RowRecord,
  column: TableColumn,
  index: number
): string | number | VNodeChild {
  const field = resolveColumnField(column.prop, index);
  const value = getRowValue(row, field);
  return (value ?? '') as string | number | VNodeChild;
}

function createCheckboxNode(params: {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return h('input', {
    class: 'ob-tanstack-table__checkbox',
    type: 'checkbox',
    checked: params.checked,
    disabled: params.disabled,
    indeterminate: params.indeterminate,
    onChange: (event: Event) => {
      const target = event.target as HTMLInputElement | null;
      params.onChange(Boolean(target?.checked));
    }
  });
}

function createSortOrder(
  column: ReturnType<TanStackTableInstance<RowRecord>['getAllColumns']>[number]
) {
  const sortingState = column.getIsSorted();
  if (sortingState === 'asc') {
    return 'asc';
  }
  if (sortingState === 'desc') {
    return 'desc';
  }
  return null;
}

export function useTanStackTableEngine(options: UseTanStackTableEngineOptions) {
  const sorting = ref<SortingState>([]);
  const rowSelection = ref<RowSelectionState>({});
  const expanded = ref<ExpandedState>({});
  const columnVisibility = ref<VisibilityState>({});
  const columnOrder = ref<ColumnOrderState>([]);
  const columnSizing = ref<ColumnSizingState>({});
  const attrs = options.attrs;
  const resolvedProps = options.props;
  const lazyLoadingKeys = ref<Record<string, boolean>>({});
  const reservedSelectionRows = ref<Record<string, RowRecord>>({});
  const reserveSelection = computed(() => resolvedProps.value.reserveSelection === true);

  const childrenField = computed(() => resolveTreeChildrenField(resolvedProps.value.treeConfig));
  const hasChildField = computed(() => resolveTreeHasChildField(resolvedProps.value.treeConfig));
  const reserveExpanded = computed(() => shouldReserveExpanded(resolvedProps.value.treeConfig));
  const expandAll = computed(() => shouldExpandAll(resolvedProps.value.treeConfig));

  const internalData = ref<RowRecord[]>(cloneRows(options.data.value, childrenField.value));

  watch(
    options.columns,
    (columns) => {
      const defaultVisibility = collectColumnVisibility(columns);
      const mergedVisibility: VisibilityState = {};
      Object.entries(defaultVisibility).forEach(([columnId, visible]) => {
        const prev = columnVisibility.value[columnId];
        mergedVisibility[columnId] = typeof prev === 'boolean' ? prev : visible;
      });
      columnVisibility.value = mergedVisibility;

      const leafColumnIds = collectLeafColumnIds(columns);
      const nextOrder = columnOrder.value.filter((columnId) => leafColumnIds.includes(columnId));
      const missingOrder = leafColumnIds.filter((columnId) => !nextOrder.includes(columnId));
      columnOrder.value = [...nextOrder, ...missingOrder];
    },
    { immediate: true, deep: true }
  );

  watch(
    [
      options.data,
      childrenField,
      hasChildField,
      reserveExpanded,
      expandAll,
      () => resolvedProps.value.rowKey
    ],
    ([rows, nextChildrenField, nextHasChildField, shouldReserve, shouldExpand, nextRowKey]) => {
      internalData.value = cloneRows(rows, nextChildrenField);
      if (shouldExpand) {
        expanded.value = createExpandedState(
          internalData.value,
          nextChildrenField,
          nextHasChildField,
          nextRowKey
        );
      } else if (shouldReserve) {
        expanded.value = filterExpandedState(
          expanded.value,
          internalData.value,
          nextChildrenField,
          nextRowKey
        );
      } else {
        expanded.value = {};
      }

      if (!reserveSelection.value) {
        rowSelection.value = {};
        reservedSelectionRows.value = {};
        return;
      }

      const availableRowKeys = new Set<string>();
      collectRowKeys(internalData.value, nextChildrenField, nextRowKey, availableRowKeys);

      const nextSelection: RowSelectionState = {};
      Object.keys(reservedSelectionRows.value).forEach((rowKey) => {
        if (availableRowKeys.has(rowKey)) {
          nextSelection[rowKey] = true;
        }
      });
      rowSelection.value = nextSelection;
    },
    { deep: true }
  );

  const columnSourceMap = computed(() => {
    const map = new Map<string, TableColumn>();

    const travel = (columns: TableColumnList, parentPath = '') => {
      columns.forEach((column, index) => {
        const columnId = resolveColumnId(column, index, parentPath);
        map.set(columnId, column);
        if (Array.isArray(column.children) && column.children.length > 0) {
          travel(column.children, `${columnId}-`);
        }
      });
    };

    travel(options.columns.value);
    return map;
  });

  function renderTreeCell(params: {
    cellContext: CellContext<RowRecord, unknown>;
    column: TableColumn;
    defaultNode: VNodeChild;
  }) {
    const { cellContext, column, defaultNode } = params;
    if (!column.treeNode) {
      return defaultNode;
    }

    const row = cellContext.row;
    const record = row.original;
    const rowKey = row.id;
    const loadMethod = resolveTreeLoadMethod(resolvedProps.value.treeConfig);
    const trigger = resolveTreeTrigger(resolvedProps.value.treeConfig);
    const canExpand = row.getCanExpand();
    const isExpanded = row.getIsExpanded();
    const isLoading = Boolean(lazyLoadingKeys.value[rowKey]);
    const hasChildren = Array.isArray(record[childrenField.value]);

    const toggleTreeExpand = async () => {
      const canLazyLoad =
        resolvedProps.value.treeConfig?.lazy === true &&
        Boolean(loadMethod) &&
        !hasChildren &&
        Boolean(record[hasChildField.value]);

      if (canLazyLoad && loadMethod) {
        lazyLoadingKeys.value = {
          ...lazyLoadingKeys.value,
          [rowKey]: true
        };

        try {
          const result = await Promise.resolve(loadMethod({ row: record }));
          record[childrenField.value] = Array.isArray(result) ? result : [];
        } finally {
          lazyLoadingKeys.value = {
            ...lazyLoadingKeys.value,
            [rowKey]: false
          };
          internalData.value = [...internalData.value];
        }
      }

      row.toggleExpanded();
    };

    return h(
      'div',
      {
        class: 'ob-tanstack-table__tree-cell',
        style: {
          paddingLeft: `${row.depth * 20}px`
        },
        onClick: (event: MouseEvent) => {
          if (trigger !== 'cell' || !canExpand) {
            return;
          }
          const target = event.target as HTMLElement | null;
          if (target?.closest('.ob-tanstack-table__tree-toggle-icon')) {
            return;
          }
          void toggleTreeExpand();
        }
      },
      [
        canExpand
          ? h('img', {
              src: isExpanded ? treeToggleExpandedIcon : treeToggleCollapsedIcon,
              class: ['ob-tanstack-table__tree-toggle-icon', isLoading ? 'is-loading' : ''],
              alt: '',
              'aria-hidden': 'true',
              onClick: (event: MouseEvent) => {
                event.stopPropagation();
                if (isLoading) {
                  return;
                }
                void toggleTreeExpand();
              }
            })
          : h('span', { class: 'ob-tanstack-table__tree-placeholder' }, ''),
        h('span', { class: 'ob-tanstack-table__tree-content' }, [defaultNode])
      ]
    );
  }

  function buildColumns(columns: TableColumnList, parentPath = ''): ColumnDef<RowRecord>[] {
    return columns.map((column, index) => {
      const field = resolveColumnField(column.prop, index);
      const columnId = resolveColumnId(column, index, parentPath);
      const { showOverflow, isOperationColumn } = resolveColumnOverflow(
        column,
        index,
        resolvedProps.value
      );
      const meta: TableColumnMeta = {
        align: column.align ?? resolvedProps.value.alignWhole,
        headerAlign:
          column.headerAlign ?? resolvedProps.value.headerAlign ?? resolvedProps.value.alignWhole,
        fixed: column.fixed,
        width: column.width,
        minWidth: column.minWidth,
        className: column.className,
        showOverflow,
        originalColumn: column,
        isOperationColumn,
        isTreeNode: Boolean(column.treeNode),
        isCustomSort: column.sortable === 'custom'
      };

      const initialSize = resolveColumnSize(column.width);
      const minSize = resolveColumnSize(column.minWidth);

      if (Array.isArray(column.children) && column.children.length > 0) {
        return {
          id: columnId,
          header: () => column.label || '',
          meta,
          size: initialSize,
          minSize,
          columns: buildColumns(column.children, `${columnId}-`)
        };
      }

      if (column.type === 'selection') {
        return {
          id: columnId,
          header: ({ table }) =>
            createCheckboxNode({
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: (checked) => table.toggleAllRowsSelected(checked)
            }),
          cell: ({ row }) =>
            createCheckboxNode({
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              onChange: (checked) => row.toggleSelected(checked)
            }),
          enableSorting: false,
          enableHiding: false,
          enableResizing: false,
          size: initialSize,
          minSize,
          meta
        };
      }

      if (column.type === 'index') {
        return {
          id: columnId,
          header: () => column.label || '#',
          cell: ({ row }) => {
            if (typeof column.index === 'function') {
              return column.index(row.index);
            }
            if (typeof column.index === 'number') {
              return row.index + column.index;
            }
            return row.index + 1;
          },
          enableSorting: false,
          enableResizing: false,
          size: initialSize,
          minSize,
          meta
        };
      }

      if (column.type === 'expand') {
        return {
          id: columnId,
          header: () => column.label || '',
          cell: ({ row }) =>
            h(
              'button',
              {
                class: 'ob-tanstack-table__expand-toggle',
                type: 'button',
                onClick: () => row.toggleExpanded()
              },
              row.getIsExpanded() ? '-' : '+'
            ),
          enableSorting: false,
          enableResizing: false,
          size: initialSize,
          minSize,
          meta
        };
      }

      return {
        id: columnId,
        accessorFn: (row) => getRowValue(row, field),
        header: (context: HeaderContext<RowRecord, unknown>) => {
          if (column.headerSlot && options.slots[column.headerSlot]) {
            return options.slots[column.headerSlot]?.(context) as VNodeChild;
          }

          if (column.headerRenderer) {
            return column.headerRenderer({
              column,
              props: resolvedProps.value,
              attrs: attrs.value
            });
          }

          return column.label || '';
        },
        cell: (context: CellContext<RowRecord, unknown>) => {
          let content: VNodeChild;
          const slotParams: TableColumnRendererParams = {
            row: context.row.original,
            column,
            $index: context.row.index,
            index: context.row.index,
            size: typeof attrs.value.size === 'string' ? attrs.value.size : undefined,
            props: resolvedProps.value,
            attrs: attrs.value
          };

          if (column.slot && options.slots[column.slot]) {
            content = options.slots[column.slot]?.(slotParams) as VNodeChild;
          } else if (column.cellRenderer) {
            content = column.cellRenderer(slotParams);
          } else {
            content = createDefaultCellValue(context.row.original, column, index);
          }

          return renderTreeCell({
            cellContext: context,
            column,
            defaultNode: content
          });
        },
        enableSorting: Boolean(column.sortable),
        enableResizing: true,
        sortingFn: meta.isCustomSort ? () => 0 : undefined,
        size: initialSize,
        minSize,
        meta
      };
    });
  }

  const tableColumns = computed<ColumnDef<RowRecord>[]>(() => buildColumns(options.columns.value));

  const onSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
    applyUpdater(updaterOrValue, sorting);
  };

  const onRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    applyUpdater(updaterOrValue, rowSelection);
  };

  const onExpandedChange: OnChangeFn<ExpandedState> = (updaterOrValue) => {
    applyUpdater(updaterOrValue, expanded);
  };

  const onColumnVisibilityChange: OnChangeFn<VisibilityState> = (updaterOrValue) => {
    applyUpdater(updaterOrValue, columnVisibility);
  };

  const onColumnOrderChange: OnChangeFn<ColumnOrderState> = (updaterOrValue) => {
    applyUpdater(updaterOrValue, columnOrder);
  };

  const onColumnSizingChange: OnChangeFn<ColumnSizingState> = (updaterOrValue) => {
    applyUpdater(updaterOrValue, columnSizing);
  };

  const tableRef = useVueTable<RowRecord>({
    get data() {
      return internalData.value;
    },
    get columns() {
      return tableColumns.value;
    },
    state: {
      get sorting() {
        return sorting.value;
      },
      get rowSelection() {
        return rowSelection.value;
      },
      get expanded() {
        return expanded.value;
      },
      get columnVisibility() {
        return columnVisibility.value;
      },
      get columnOrder() {
        return columnOrder.value;
      },
      get columnSizing() {
        return columnSizing.value;
      }
    },
    getRowId: (row: RowRecord, index: number) =>
      getRowKey(row, index, resolvedProps.value.rowKey || 'id'),
    getSubRows: (row: RowRecord) => {
      const children = row[childrenField.value];
      return Array.isArray(children) ? (children as RowRecord[]) : [];
    },
    getRowCanExpand: (row) => {
      const record = row.original;
      const children = record[childrenField.value];
      const hasChildren = Array.isArray(children) && children.length > 0;
      const hasRemoteChildren = Boolean(record[hasChildField.value]);
      const hasExpandColumn = tableColumns.value.some((column) => {
        const originalColumn = (column.meta as TableColumnMeta | undefined)?.originalColumn;
        return originalColumn?.type === 'expand';
      });
      return hasChildren || hasRemoteChildren || hasExpandColumn;
    },
    enableRowSelection: true,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    onSortingChange,
    onRowSelectionChange,
    onExpandedChange,
    onColumnVisibilityChange,
    onColumnOrderChange,
    onColumnSizingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel()
  });

  watch(
    rowSelection,
    () => {
      const currentPageRows = tableRef.getRowModel().rows;
      const selectedRows = tableRef.getSelectedRowModel().flatRows;

      if (!reserveSelection.value) {
        options.emitSelectionChange(selectedRows.map((row) => row.original));
        return;
      }

      const nextReservedRows = { ...reservedSelectionRows.value };
      currentPageRows.forEach((row) => {
        delete nextReservedRows[row.id];
      });
      selectedRows.forEach((row) => {
        nextReservedRows[row.id] = row.original;
      });
      reservedSelectionRows.value = nextReservedRows;
      options.emitSelectionChange(Object.values(nextReservedRows));
    },
    { deep: true }
  );

  watch(
    sorting,
    (value) => {
      const activeSort = value[0];
      if (!activeSort) {
        options.emitSortChange({
          prop: undefined,
          field: undefined,
          order: null
        });
        return;
      }

      const sourceColumn = columnSourceMap.value.get(activeSort.id);
      options.emitSortChange({
        prop: resolveSortProp(sourceColumn, activeSort.id),
        field: resolveSortField(sourceColumn, activeSort.id),
        order: activeSort.desc ? 'desc' : 'asc',
        column: sourceColumn
      });
    },
    { deep: true }
  );

  const rows = computed(() => tableRef.getRowModel().rows);
  const headerGroups = computed(() => tableRef.getHeaderGroups());
  const visibleLeafColumns = computed(() => tableRef.getVisibleLeafColumns());

  function clearSelection() {
    rowSelection.value = {};
    reservedSelectionRows.value = {};
    options.emitSelectionChange([]);
  }

  function getSelectedRows() {
    if (reserveSelection.value) {
      return Object.values(reservedSelectionRows.value);
    }
    return tableRef.getSelectedRowModel().flatRows.map((row) => row.original);
  }

  function getSelectedRowKeys() {
    if (reserveSelection.value) {
      return Object.keys(reservedSelectionRows.value);
    }
    return Object.keys(rowSelection.value).filter((key) => Boolean(rowSelection.value[key]));
  }

  function setSelectedRowKeys(rowKeys: Array<string | number>) {
    const nextRowKeys = Array.from(new Set(rowKeys.map((rowKey) => String(rowKey))));
    const nextSelection: RowSelectionState = {};
    const nextReservedRows = reserveSelection.value ? { ...reservedSelectionRows.value } : {};
    const rowMap = new Map(
      tableRef.getCoreRowModel().flatRows.map((row) => [row.id, row.original])
    );

    if (reserveSelection.value) {
      Object.keys(nextReservedRows).forEach((rowKey) => {
        if (!nextRowKeys.includes(rowKey)) {
          delete nextReservedRows[rowKey];
        }
      });
    }

    nextRowKeys.forEach((rowKey) => {
      const currentRow = rowMap.get(rowKey);
      if (currentRow) {
        nextSelection[rowKey] = true;
        if (reserveSelection.value) {
          nextReservedRows[rowKey] = currentRow;
        }
      }
    });

    rowSelection.value = nextSelection;

    if (reserveSelection.value) {
      reservedSelectionRows.value = nextReservedRows;
      options.emitSelectionChange(Object.values(nextReservedRows));
      return;
    }

    options.emitSelectionChange(tableRef.getSelectedRowModel().flatRows.map((row) => row.original));
  }

  function setColumnVisibility(nextVisibility: Record<string, boolean>) {
    columnVisibility.value = {
      ...columnVisibility.value,
      ...nextVisibility
    };
  }

  function toggleColumnVisibility(columnId: string, visible?: boolean) {
    const currentVisible = columnVisibility.value[columnId] ?? true;
    setColumnVisibility({
      [columnId]: typeof visible === 'boolean' ? visible : !currentVisible
    });
  }

  function getColumnVisibility() {
    return { ...columnVisibility.value };
  }

  function setColumnOrder(nextOrder: string[]) {
    const leafColumnIds = collectLeafColumnIds(options.columns.value);
    const normalizedOrder = nextOrder.filter((columnId) => leafColumnIds.includes(columnId));
    const missingOrder = leafColumnIds.filter((columnId) => !normalizedOrder.includes(columnId));
    columnOrder.value = [...normalizedOrder, ...missingOrder];
  }

  function reorderColumn(sourceId: string, targetId: string) {
    if (sourceId === targetId) {
      return;
    }

    const nextOrder = [...columnOrder.value];
    const sourceIndex = nextOrder.indexOf(sourceId);
    const targetIndex = nextOrder.indexOf(targetId);
    if (sourceIndex < 0 || targetIndex < 0) {
      return;
    }

    nextOrder.splice(sourceIndex, 1);
    nextOrder.splice(targetIndex, 0, sourceId);
    columnOrder.value = nextOrder;
  }

  function getColumnOrder() {
    return [...columnOrder.value];
  }

  function setColumnSizing(nextSizing: ColumnSizingState) {
    columnSizing.value = {
      ...columnSizing.value,
      ...nextSizing
    };
  }

  function resetColumnSizing() {
    columnSizing.value = {};
  }

  function getColumnSizing() {
    return { ...columnSizing.value };
  }

  function getExpandedContent(row: Row<RowRecord>) {
    const expandColumn = options.columns.value.find((column) => column.type === 'expand');
    if (!expandColumn) {
      return null;
    }

    if (expandColumn.slot && options.slots[expandColumn.slot]) {
      return options.slots[expandColumn.slot]?.({
        row: row.original,
        column: expandColumn,
        $index: row.index,
        index: row.index,
        size: typeof attrs.value.size === 'string' ? attrs.value.size : undefined,
        props: resolvedProps.value,
        attrs: attrs.value
      }) as VNodeChild;
    }

    if (expandColumn.cellRenderer) {
      return expandColumn.cellRenderer({
        row: row.original,
        column: expandColumn,
        $index: row.index,
        index: row.index,
        size: typeof attrs.value.size === 'string' ? attrs.value.size : undefined,
        props: resolvedProps.value,
        attrs: attrs.value
      });
    }

    return null;
  }

  function hasExpandedContent(row: Row<RowRecord>) {
    return Boolean(getExpandedContent(row));
  }

  function getColumnMeta(column: Column<RowRecord, unknown>) {
    return (column.columnDef.meta || {
      align: resolvedProps.value.alignWhole,
      headerAlign: resolvedProps.value.headerAlign ?? resolvedProps.value.alignWhole,
      originalColumn: {}
    }) as TableColumnMeta;
  }

  function getColumnStyle(column: Column<RowRecord, unknown>, meta: TableColumnMeta) {
    const hasConfiguredWidth = meta.width != null && String(meta.width).trim().length > 0;
    const hasManualSizing = Object.prototype.hasOwnProperty.call(columnSizing.value, column.id);
    const dynamicSize = column.getSize();
    const resolvedMinWidth = resolveColumnSizeStyle(meta.minWidth);

    if (!hasConfiguredWidth && !hasManualSizing) {
      return {
        minWidth: resolvedMinWidth
      };
    }

    const resolvedWidth = Number.isFinite(dynamicSize)
      ? `${dynamicSize}px`
      : resolveColumnSizeStyle(meta.width);
    return {
      width: resolvedWidth,
      minWidth: resolvedMinWidth ?? resolvedWidth,
      maxWidth: resolvedWidth
    };
  }

  function getCellTitle(cell: Cell<RowRecord, unknown>) {
    const meta = getColumnMeta(cell.column);
    if (!meta.showOverflow || meta.isOperationColumn) {
      return undefined;
    }
    const value = cell.getValue();
    return value == null ? undefined : String(value);
  }

  return {
    table: tableRef,
    rows,
    headerGroups,
    visibleLeafColumns,
    clearSelection,
    getSelectedRows,
    getSelectedRowKeys,
    setSelectedRowKeys,
    getExpandedContent,
    hasExpandedContent,
    setColumnVisibility,
    toggleColumnVisibility,
    getColumnVisibility,
    setColumnOrder,
    reorderColumn,
    getColumnOrder,
    setColumnSizing,
    resetColumnSizing,
    getColumnSizing,
    getColumnMeta,
    getColumnStyle,
    getCellTitle,
    createSortOrder,
    rowSelection,
    sorting,
    columnVisibility,
    columnOrder,
    columnSizing
  };
}

declare module '@tanstack/vue-table' {
  interface ColumnMeta<TData extends RowData, TValue> extends TableColumnMeta {
    _obTableMetaExtends?: never;
  }
}
