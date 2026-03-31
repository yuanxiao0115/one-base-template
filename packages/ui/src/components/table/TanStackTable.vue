<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  useSlots,
  watch,
  type CSSProperties
} from 'vue';
import zhCnLocale from 'element-plus/es/locale/lang/zh-cn';
import { FlexRender, type Cell, type Column, type Header, type Row } from '@tanstack/vue-table';
import { useVirtualizer, type VirtualItem } from '@tanstack/vue-virtual';
import emptyStateImage from './assets/table-empty-state.webp';
import { useTanStackTableEngine } from './internal/tanstack-engine';
import { useTanStackPagerProps } from './internal/tanstack-pagination';
import type {
  AdaptiveConfig,
  TableAlign,
  TableColumnList,
  TablePagination,
  VxeVirtualConfig
} from './types';

defineOptions({
  name: 'TanStackTable',
  inheritAttrs: false
});

type RowRecord = Record<string, unknown>;
type VxeEventParams = Record<string, unknown>;
type VirtualRow = VirtualItem;

interface ObTanStackTableProps {
  data?: RowRecord[];
  columns?: TableColumnList;
  loading?: boolean;
  enableFirstLoadSkeleton?: boolean;
  skeletonRows?: number;
  skeletonDelayMs?: number;
  skeletonMinDurationMs?: number;
  pagination?: TablePagination | false | null;
  paginationSmall?: boolean;
  rowKey?: string;
  tableLayout?: 'fixed' | 'auto';
  showOverflowTooltip?: boolean;
  alignWhole?: TableAlign;
  headerAlign?: TableAlign;
  stripe?: boolean;
  border?: boolean;
  adaptive?: boolean;
  adaptiveConfig?: AdaptiveConfig;
  treeConfig?: Record<string, unknown>;
  virtualConfig?: VxeVirtualConfig;
  reserveSelection?: boolean;
}

const props = withDefaults(defineProps<ObTanStackTableProps>(), {
  data: () => [],
  columns: () => [],
  loading: false,
  enableFirstLoadSkeleton: true,
  skeletonRows: 8,
  skeletonDelayMs: 120,
  skeletonMinDurationMs: 200,
  pagination: null,
  paginationSmall: undefined,
  rowKey: 'id',
  tableLayout: 'auto',
  showOverflowTooltip: true,
  alignWhole: 'left',
  headerAlign: undefined,
  stripe: false,
  border: false,
  adaptive: false,
  adaptiveConfig: () => ({
    offsetBottom: 110,
    fixHeader: true,
    timeout: 16
  }),
  treeConfig: undefined,
  virtualConfig: undefined,
  reserveSelection: false
});

const emit = defineEmits<{
  (e: 'selection-change', selection: RowRecord[]): void;
  (e: 'page-current-change' | 'page-size-change', page: number): void;
  (e: 'sort-change', payload: VxeEventParams): void;
}>();

const attrs = useAttrs();
const slots = useSlots();

const wrapperRef = ref<HTMLDivElement>();
const tableScrollRef = ref<HTMLElement | null>(null);
const adaptiveHeight = ref<number>();
const draggingColumnId = ref<string | null>(null);
let resizeObserver: ResizeObserver | null = null;

const wrapperClass = computed(() => ['ob-tanstack-table', attrs.class]);
const wrapperStyle = computed<CSSProperties>(() => {
  const style = (attrs.style || {}) as CSSProperties;
  return {
    ...style,
    '--ob-tanstack-table-layout': props.tableLayout
  } as CSSProperties;
});

const passthroughAttrs = computed(() => {
  const blockedKeys = new Set([
    'class',
    'style',
    'data',
    'columns',
    'loading',
    'enableFirstLoadSkeleton',
    'skeletonRows',
    'skeletonDelayMs',
    'skeletonMinDurationMs',
    'pagination',
    'paginationSmall',
    'rowKey',
    'tableLayout',
    'showOverflowTooltip',
    'alignWhole',
    'headerAlign',
    'stripe',
    'border',
    'adaptive',
    'adaptiveConfig',
    'treeConfig',
    'virtualConfig',
    'reserveSelection'
  ]);

  return Object.fromEntries(Object.entries(attrs).filter(([key]) => !blockedKeys.has(key)));
});

const normalizedData = computed<RowRecord[]>(() => (Array.isArray(props.data) ? props.data : []));
const normalizedColumns = computed<TableColumnList>(() =>
  Array.isArray(props.columns) ? props.columns : []
);

const normalizedPagination = computed<TablePagination | null>(() => {
  if (!props.pagination) {
    return null;
  }
  return props.pagination;
});

const pagerProps = useTanStackPagerProps({
  pagination: normalizedPagination,
  paginationSmall: computed(() => props.paginationSmall ?? attrs.size === 'small')
});

const engine = useTanStackTableEngine({
  data: normalizedData,
  columns: normalizedColumns,
  props: computed(() => ({
    rowKey: props.rowKey,
    alignWhole: props.alignWhole,
    headerAlign: props.headerAlign,
    showOverflowTooltip: props.showOverflowTooltip,
    treeConfig: props.treeConfig,
    reserveSelection: props.reserveSelection
  })),
  attrs: computed(() => attrs as Record<string, unknown>),
  slots,
  emitSelectionChange: (selection) => emit('selection-change', selection),
  emitSortChange: (payload) => emit('sort-change', payload)
});

type TanStackHeader = Header<RowRecord, unknown>;
type TanStackCell = Cell<RowRecord, unknown>;
type TanStackColumn = Column<RowRecord, unknown>;
type TanStackRow = Row<RowRecord>;

const headerGroups = computed(() => engine.headerGroups.value);
const tableRows = computed(() => engine.rows.value);
const visibleLeafColumns = computed(() => engine.visibleLeafColumns.value);

const virtualEnabled = computed(() => {
  if (!props.virtualConfig) {
    return false;
  }
  return props.virtualConfig.enabled ?? Boolean(props.virtualConfig.y);
});

const virtualRowHeight = computed(() => {
  const rowHeight = Number(
    (props.virtualConfig?.y as Record<string, unknown> | undefined)?.rowHeight
  );
  if (!Number.isFinite(rowHeight) || rowHeight <= 0) {
    return 44;
  }
  return Math.floor(rowHeight);
});

const virtualOverscan = computed(() => {
  const overscan = Number(
    (props.virtualConfig?.y as Record<string, unknown> | undefined)?.overscan
  );
  if (!Number.isFinite(overscan) || overscan < 0) {
    return 8;
  }
  return Math.floor(overscan);
});

const rowVirtualizer = useVirtualizer<HTMLElement, HTMLTableRowElement>(
  computed(() => ({
    count: tableRows.value.length,
    getScrollElement: () => tableScrollRef.value,
    estimateSize: () => virtualRowHeight.value,
    overscan: virtualOverscan.value,
    enabled: virtualEnabled.value
  }))
);

const virtualRows = computed<VirtualRow[]>(() => {
  if (!virtualEnabled.value) {
    return [];
  }
  return rowVirtualizer.value.getVirtualItems();
});

const virtualRowsWithData = computed(() => {
  return virtualRows.value
    .map((virtualRow) => {
      const row = tableRows.value[virtualRow.index];
      if (!row) {
        return null;
      }
      return {
        virtualRow,
        row
      };
    })
    .filter((entry): entry is { virtualRow: VirtualRow; row: TanStackRow } => Boolean(entry));
});

const virtualPaddingTop = computed(() => {
  const firstVirtualRow = virtualRows.value[0];
  return firstVirtualRow ? firstVirtualRow.start : 0;
});

const virtualPaddingBottom = computed(() => {
  const lastVirtualRow = virtualRows.value[virtualRows.value.length - 1];
  if (!lastVirtualRow) {
    return 0;
  }
  return Math.max(rowVirtualizer.value.getTotalSize() - lastVirtualRow.end, 0);
});

function resolveFixedDirection(fixed?: boolean | string | null) {
  if (fixed === true || fixed === 'left') {
    return 'left' as const;
  }
  if (fixed === 'right') {
    return 'right' as const;
  }
  return null;
}

function parseColumnSize(value?: string | number) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

function resolveColumnPixelWidth(column: TanStackColumn) {
  const dynamicSize = column.getSize();
  if (Number.isFinite(dynamicSize)) {
    return dynamicSize;
  }
  const meta = engine.getColumnMeta(column);
  return parseColumnSize(meta.width) ?? parseColumnSize(meta.minWidth) ?? 120;
}

const fixedColumnState = computed(() => {
  const leftOffsets: Record<string, number> = {};
  const rightOffsets: Record<string, number> = {};

  let leftOffset = 0;
  let rightOffset = 0;
  let lastLeftFixedId: string | null = null;
  let firstRightFixedId: string | null = null;

  visibleLeafColumns.value.forEach((column) => {
    const direction = resolveFixedDirection(engine.getColumnMeta(column).fixed);
    if (direction !== 'left') {
      return;
    }
    leftOffsets[column.id] = leftOffset;
    leftOffset += resolveColumnPixelWidth(column);
    lastLeftFixedId = column.id;
  });

  for (let index = visibleLeafColumns.value.length - 1; index >= 0; index -= 1) {
    const column = visibleLeafColumns.value[index];
    if (!column) {
      continue;
    }
    const direction = resolveFixedDirection(engine.getColumnMeta(column).fixed);
    if (direction !== 'right') {
      continue;
    }
    rightOffsets[column.id] = rightOffset;
    rightOffset += resolveColumnPixelWidth(column);
    firstRightFixedId = column.id;
  }

  return {
    leftOffsets,
    rightOffsets,
    lastLeftFixedId,
    firstRightFixedId
  };
});

const resolvedSkeletonRows = computed(() => {
  const rows = Number(props.skeletonRows || 0);
  if (!Number.isFinite(rows) || rows <= 0) {
    return 8;
  }
  return Math.max(1, Math.floor(rows));
});

const skeletonCellCount = computed(() => {
  const count = Array.isArray(props.columns) ? props.columns.length : 0;
  return Math.min(Math.max(count || 4, 3), 8);
});

const shouldUseFirstLoadSkeleton = computed(
  () => props.enableFirstLoadSkeleton && props.loading && normalizedData.value.length === 0
);

const showFirstLoadSkeleton = ref(false);
const skeletonShownAt = ref(0);
let skeletonDelayTimer: ReturnType<typeof setTimeout> | null = null;
let skeletonHideTimer: ReturnType<typeof setTimeout> | null = null;

const gridHeight = computed<number | undefined>(() => {
  if (!props.adaptive) {
    return undefined;
  }
  if (props.adaptiveConfig?.fixHeader === false) {
    return undefined;
  }
  return adaptiveHeight.value;
});

const resolvedTableHeight = computed<string>(() => {
  if (typeof gridHeight.value === 'number') {
    return `${gridHeight.value}px`;
  }
  return '100%';
});

function handleCurrentPageChange(page: number) {
  emit('page-current-change', Number(page || 1));
}

function handlePageSizeChange(pageSize: number) {
  emit('page-size-change', Number(pageSize || 10));
}

function updateAdaptiveHeight() {
  if (!(props.adaptive && wrapperRef.value) || props.adaptiveConfig?.fixHeader === false) {
    adaptiveHeight.value = undefined;
    return;
  }

  const rect = wrapperRef.value.getBoundingClientRect();
  const offsetBottom = props.adaptiveConfig?.offsetBottom ?? 110;
  const computedHeight = window.innerHeight - rect.top - offsetBottom;
  adaptiveHeight.value = Math.max(240, Math.floor(computedHeight));
}

function setAdaptive() {
  const timeout = props.adaptiveConfig?.timeout ?? 16;
  window.setTimeout(() => {
    void nextTick(() => {
      updateAdaptiveHeight();
    });
  }, timeout);
}

function clearSkeletonDelayTimer() {
  if (!skeletonDelayTimer) {
    return;
  }
  clearTimeout(skeletonDelayTimer);
  skeletonDelayTimer = null;
}

function clearSkeletonHideTimer() {
  if (!skeletonHideTimer) {
    return;
  }
  clearTimeout(skeletonHideTimer);
  skeletonHideTimer = null;
}

function hideFirstLoadSkeleton() {
  clearSkeletonDelayTimer();
  clearSkeletonHideTimer();
  showFirstLoadSkeleton.value = false;
  skeletonShownAt.value = 0;
}

function showFirstLoadSkeletonWithMinDuration() {
  clearSkeletonDelayTimer();
  clearSkeletonHideTimer();
  if (showFirstLoadSkeleton.value) {
    return;
  }
  showFirstLoadSkeleton.value = true;
  skeletonShownAt.value = Date.now();
}

function scheduleShowFirstLoadSkeleton() {
  if (showFirstLoadSkeleton.value) {
    return;
  }

  clearSkeletonDelayTimer();
  const delay = Number(props.skeletonDelayMs ?? 0);

  if (!Number.isFinite(delay) || delay <= 0) {
    showFirstLoadSkeletonWithMinDuration();
    return;
  }

  skeletonDelayTimer = setTimeout(() => {
    skeletonDelayTimer = null;
    if (shouldUseFirstLoadSkeleton.value) {
      showFirstLoadSkeletonWithMinDuration();
    }
  }, Math.floor(delay));
}

function scheduleHideFirstLoadSkeleton() {
  clearSkeletonDelayTimer();
  if (!showFirstLoadSkeleton.value) {
    return;
  }

  clearSkeletonHideTimer();
  const minDuration = Number(props.skeletonMinDurationMs ?? 0);
  if (!Number.isFinite(minDuration) || minDuration <= 0) {
    hideFirstLoadSkeleton();
    return;
  }

  const elapsed = Date.now() - skeletonShownAt.value;
  const remain = Math.floor(minDuration - elapsed);
  if (remain <= 0) {
    hideFirstLoadSkeleton();
    return;
  }

  skeletonHideTimer = setTimeout(() => {
    skeletonHideTimer = null;
    hideFirstLoadSkeleton();
  }, remain);
}

async function clearSelection() {
  engine.clearSelection();
}

function getSelectedRowKeys() {
  return engine.getSelectedRowKeys();
}

function setSelectedRowKeys(rowKeys: Array<string | number>) {
  engine.setSelectedRowKeys(rowKeys);
}

function setColumnVisibility(nextVisibility: Record<string, boolean>) {
  engine.setColumnVisibility(nextVisibility);
}

function toggleColumnVisibility(columnId: string, visible?: boolean) {
  engine.toggleColumnVisibility(columnId, visible);
}

function getColumnVisibility() {
  return engine.getColumnVisibility();
}

function setColumnOrder(columnOrder: string[]) {
  engine.setColumnOrder(columnOrder);
}

function getColumnOrder() {
  return engine.getColumnOrder();
}

function setColumnSizing(columnSizing: Record<string, number>) {
  engine.setColumnSizing(columnSizing);
}

function resetColumnSizing() {
  engine.resetColumnSizing();
}

function getColumnSizing() {
  return engine.getColumnSizing();
}

function getTableRef() {
  return {
    clearSelection,
    getCheckboxRecords: () => engine.getSelectedRows(),
    getSelectedRowKeys,
    setSelectedRowKeys,
    setColumnVisibility,
    toggleColumnVisibility,
    getColumnVisibility,
    setColumnOrder,
    getColumnOrder,
    setColumnSizing,
    resetColumnSizing,
    getColumnSizing
  };
}

function canDragHeader(header: TanStackHeader) {
  if (header.isPlaceholder) {
    return false;
  }
  const meta = engine.getColumnMeta(header.column);
  if (resolveFixedDirection(meta.fixed)) {
    return false;
  }
  const columnType = meta.originalColumn?.type;
  if (columnType === 'selection' || columnType === 'index' || columnType === 'expand') {
    return false;
  }
  return header.column.getCanHide();
}

function handleHeaderDragStart(header: TanStackHeader, event: DragEvent) {
  if (!canDragHeader(header)) {
    return;
  }
  draggingColumnId.value = header.column.id;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', header.column.id);
  }
}

function handleHeaderDragOver(header: TanStackHeader, event: DragEvent) {
  if (!canDragHeader(header) || !draggingColumnId.value) {
    return;
  }
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
}

function handleHeaderDrop(header: TanStackHeader, event: DragEvent) {
  if (!canDragHeader(header) || !draggingColumnId.value) {
    return;
  }
  event.preventDefault();
  engine.reorderColumn(draggingColumnId.value, header.column.id);
  draggingColumnId.value = null;
}

function handleHeaderDragEnd() {
  draggingColumnId.value = null;
}

function bindAdaptiveObserver() {
  if (!(props.adaptive && wrapperRef.value)) {
    return;
  }

  setAdaptive();
  window.addEventListener('resize', setAdaptive, { passive: true });

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      setAdaptive();
    });
    resizeObserver.observe(wrapperRef.value);
  }
}

function unbindAdaptiveObserver() {
  window.removeEventListener('resize', setAdaptive);

  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
}

function resolveHeaderClass(header: TanStackHeader) {
  const meta = engine.getColumnMeta(header.column);
  const sortOrder = engine.createSortOrder(header.column);
  const fixedDirection = resolveFixedDirection(meta.fixed);
  return [
    'ob-tanstack-table__th',
    meta.className,
    fixedDirection ? 'is-fixed' : '',
    fixedDirection ? `is-fixed-${fixedDirection}` : '',
    fixedDirection === 'left' && fixedColumnState.value.lastLeftFixedId === header.column.id
      ? 'is-fixed-left-edge'
      : '',
    fixedDirection === 'right' && fixedColumnState.value.firstRightFixedId === header.column.id
      ? 'is-fixed-right-edge'
      : '',
    `is-align-${meta.headerAlign}`,
    meta.isTreeNode ? 'is-tree-node' : '',
    header.column.getCanSort() ? 'is-sortable' : '',
    sortOrder ? `is-sort-${sortOrder}` : ''
  ];
}

function resolveCellClass(cell: TanStackCell) {
  const meta = engine.getColumnMeta(cell.column);
  const fixedDirection = resolveFixedDirection(meta.fixed);
  return [
    'ob-tanstack-table__td',
    meta.className,
    fixedDirection ? 'is-fixed' : '',
    fixedDirection ? `is-fixed-${fixedDirection}` : '',
    fixedDirection === 'left' && fixedColumnState.value.lastLeftFixedId === cell.column.id
      ? 'is-fixed-left-edge'
      : '',
    fixedDirection === 'right' && fixedColumnState.value.firstRightFixedId === cell.column.id
      ? 'is-fixed-right-edge'
      : '',
    `is-align-${meta.align}`,
    meta.showOverflow ? 'is-overflow' : '',
    meta.isOperationColumn ? 'is-operation' : '',
    meta.isTreeNode ? 'is-tree-node' : ''
  ];
}

function resolveFixedStyle(columnId: string, fixed?: boolean | string | null, isHeader = false) {
  const fixedDirection = resolveFixedDirection(fixed);
  if (!fixedDirection) {
    return {} as CSSProperties;
  }

  const offset =
    fixedDirection === 'left'
      ? (fixedColumnState.value.leftOffsets[columnId] ?? 0)
      : (fixedColumnState.value.rightOffsets[columnId] ?? 0);

  return {
    position: 'sticky',
    ...(fixedDirection === 'left' ? { left: `${offset}px` } : { right: `${offset}px` }),
    zIndex: isHeader ? 6 : 3
  } satisfies CSSProperties;
}

function resolveHeaderStyle(header: TanStackHeader) {
  const meta = engine.getColumnMeta(header.column);
  return {
    ...engine.getColumnStyle(header.column, meta),
    ...resolveFixedStyle(header.column.id, meta.fixed, true)
  } satisfies CSSProperties;
}

function resolveCellStyle(cell: TanStackCell) {
  const meta = engine.getColumnMeta(cell.column);
  return {
    ...engine.getColumnStyle(cell.column, meta),
    ...resolveFixedStyle(cell.column.id, meta.fixed)
  } satisfies CSSProperties;
}

function resolveHeaderSortLabel(header: TanStackHeader) {
  const sortOrder = engine.createSortOrder(header.column);
  if (sortOrder === 'asc') {
    return '↑';
  }
  if (sortOrder === 'desc') {
    return '↓';
  }
  return '';
}

function handleHeaderSort(header: TanStackHeader, event: MouseEvent) {
  if (!header.column.getCanSort()) {
    return;
  }
  event.preventDefault();
  header.column.toggleSorting();
}

function hasExpandedContent(row: TanStackRow) {
  return engine.hasExpandedContent(row);
}

function resolveExpandedContent(row: TanStackRow) {
  return engine.getExpandedContent(row);
}

watch(
  () => props.adaptive,
  (enabled) => {
    if (enabled) {
      bindAdaptiveObserver();
      return;
    }
    unbindAdaptiveObserver();
    adaptiveHeight.value = undefined;
  }
);

watch(
  () => [
    normalizedData.value.length,
    normalizedPagination.value?.currentPage,
    normalizedPagination.value?.pageSize
  ],
  () => {
    if (props.adaptive) {
      setAdaptive();
    }
    if (virtualEnabled.value) {
      rowVirtualizer.value.measure();
    }
  }
);

watch(
  shouldUseFirstLoadSkeleton,
  (enabled) => {
    if (enabled) {
      scheduleShowFirstLoadSkeleton();
      return;
    }
    scheduleHideFirstLoadSkeleton();
  },
  { immediate: true }
);

onMounted(() => {
  bindAdaptiveObserver();
});

onBeforeUnmount(() => {
  unbindAdaptiveObserver();
  hideFirstLoadSkeleton();
});

defineExpose({
  getTableRef,
  setAdaptive,
  clearSelection,
  getSelectedRowKeys,
  setSelectedRowKeys,
  setColumnVisibility,
  toggleColumnVisibility,
  getColumnVisibility,
  setColumnOrder,
  getColumnOrder,
  setColumnSizing,
  resetColumnSizing,
  getColumnSizing
});
</script>

<template>
  <div ref="wrapperRef" :class="wrapperClass" :style="wrapperStyle">
    <div class="ob-tanstack-table__main">
      <div v-if="showFirstLoadSkeleton" class="ob-tanstack-table__skeleton">
        <el-skeleton animated>
          <template #template>
            <div class="ob-tanstack-table__skeleton-head">
              <el-skeleton-item
                v-for="index in skeletonCellCount"
                :key="`head-${index}`"
                variant="text"
                class="ob-tanstack-table__skeleton-cell ob-tanstack-table__skeleton-cell--head"
              />
            </div>

            <div class="ob-tanstack-table__skeleton-body">
              <div
                v-for="row in resolvedSkeletonRows"
                :key="`row-${row}`"
                class="ob-tanstack-table__skeleton-row"
              >
                <el-skeleton-item
                  v-for="index in skeletonCellCount"
                  :key="`row-${row}-col-${index}`"
                  variant="text"
                  class="ob-tanstack-table__skeleton-cell"
                />
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>

      <div
        v-else
        v-loading="loading"
        class="ob-tanstack-table__table-shell"
        :style="{ height: resolvedTableHeight }"
      >
        <div
          ref="tableScrollRef"
          class="ob-tanstack-table__table-scroll"
          :class="{ 'is-empty': tableRows.length === 0 }"
          v-bind="passthroughAttrs"
        >
          <table class="ob-tanstack-table__table">
            <thead class="ob-tanstack-table__thead">
              <tr
                v-for="headerGroup in headerGroups"
                :key="headerGroup.id"
                class="ob-tanstack-table__tr ob-tanstack-table__tr--head"
              >
                <th
                  v-for="header in headerGroup.headers"
                  :key="header.id"
                  :class="resolveHeaderClass(header)"
                  :style="resolveHeaderStyle(header)"
                  :draggable="canDragHeader(header)"
                  scope="col"
                  @dragstart="handleHeaderDragStart(header, $event)"
                  @dragover="handleHeaderDragOver(header, $event)"
                  @drop="handleHeaderDrop(header, $event)"
                  @dragend="handleHeaderDragEnd"
                >
                  <div
                    class="ob-tanstack-table__cell ob-tanstack-table__cell--header"
                    :class="{ 'is-clickable': header.column.getCanSort() }"
                    @click="handleHeaderSort(header, $event)"
                  >
                    <template v-if="!header.isPlaceholder">
                      <FlexRender
                        :render="header.column.columnDef.header"
                        :props="header.getContext()"
                      />
                      <span
                        v-if="resolveHeaderSortLabel(header)"
                        class="ob-tanstack-table__sort-indicator"
                      >
                        {{ resolveHeaderSortLabel(header) }}
                      </span>
                    </template>
                    <div
                      v-if="header.column.getCanResize()"
                      class="ob-tanstack-table__column-resizer"
                      :class="{ 'is-resizing': header.column.getIsResizing() }"
                      @click.stop
                      @mousedown.stop.prevent="header.getResizeHandler()($event)"
                      @touchstart.stop.prevent="header.getResizeHandler()($event)"
                    />
                  </div>
                </th>
              </tr>
            </thead>

            <tbody class="ob-tanstack-table__tbody">
              <template v-if="tableRows.length > 0 && virtualRows.length > 0">
                <tr
                  v-if="virtualPaddingTop > 0"
                  class="ob-tanstack-table__tr ob-tanstack-table__tr--virtual-gap"
                >
                  <td
                    :colspan="Math.max(visibleLeafColumns.length, 1)"
                    :style="{ height: `${virtualPaddingTop}px` }"
                  />
                </tr>

                <template v-for="entry in virtualRowsWithData" :key="entry.virtualRow.key">
                  <tr
                    class="ob-tanstack-table__tr"
                    :class="{
                      'is-striped': stripe && entry.virtualRow.index % 2 === 1
                    }"
                  >
                    <td
                      v-for="cell in entry.row.getVisibleCells()"
                      :key="cell.id"
                      :class="resolveCellClass(cell)"
                      :style="resolveCellStyle(cell)"
                    >
                      <div class="ob-tanstack-table__cell" :title="engine.getCellTitle(cell)">
                        <FlexRender
                          :render="cell.column.columnDef.cell"
                          :props="cell.getContext()"
                        />
                      </div>
                    </td>
                  </tr>

                  <tr
                    v-if="entry.row.getIsExpanded() && hasExpandedContent(entry.row)"
                    class="ob-tanstack-table__tr ob-tanstack-table__tr--expanded"
                  >
                    <td
                      :colspan="visibleLeafColumns.length"
                      class="ob-tanstack-table__expanded-cell"
                    >
                      <div class="ob-tanstack-table__expanded-content">
                        <FlexRender
                          :render="() => resolveExpandedContent(entry.row)"
                          :props="{ row: entry.row }"
                        />
                      </div>
                    </td>
                  </tr>
                </template>

                <tr
                  v-if="virtualPaddingBottom > 0"
                  class="ob-tanstack-table__tr ob-tanstack-table__tr--virtual-gap"
                >
                  <td
                    :colspan="Math.max(visibleLeafColumns.length, 1)"
                    :style="{ height: `${virtualPaddingBottom}px` }"
                  />
                </tr>
              </template>

              <template v-else-if="tableRows.length > 0">
                <template v-for="(row, rowIndex) in tableRows" :key="row.id">
                  <tr
                    class="ob-tanstack-table__tr"
                    :class="{
                      'is-striped': stripe && rowIndex % 2 === 1
                    }"
                  >
                    <td
                      v-for="cell in row.getVisibleCells()"
                      :key="cell.id"
                      :class="resolveCellClass(cell)"
                      :style="resolveCellStyle(cell)"
                    >
                      <div class="ob-tanstack-table__cell" :title="engine.getCellTitle(cell)">
                        <FlexRender
                          :render="cell.column.columnDef.cell"
                          :props="cell.getContext()"
                        />
                      </div>
                    </td>
                  </tr>

                  <tr
                    v-if="row.getIsExpanded() && hasExpandedContent(row)"
                    class="ob-tanstack-table__tr ob-tanstack-table__tr--expanded"
                  >
                    <td
                      :colspan="visibleLeafColumns.length"
                      class="ob-tanstack-table__expanded-cell"
                    >
                      <div class="ob-tanstack-table__expanded-content">
                        <FlexRender :render="() => resolveExpandedContent(row)" :props="{ row }" />
                      </div>
                    </td>
                  </tr>
                </template>
              </template>
            </tbody>
          </table>

          <div v-if="tableRows.length === 0" class="ob-tanstack-table__empty-overlay">
            <div class="ob-tanstack-table__empty-state">
              <div class="ob-tanstack-table__empty-figure">
                <img
                  :src="emptyStateImage"
                  alt=""
                  aria-hidden="true"
                  class="ob-tanstack-table__empty-image"
                />
              </div>
              <p class="ob-tanstack-table__empty-text">暂未生产任何数据</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="pagerProps" class="ob-tanstack-table__pager">
      <el-config-provider :locale="zhCnLocale">
        <el-pagination
          :total="pagerProps.total"
          :current-page="pagerProps.currentPage"
          :page-size="pagerProps.pageSize"
          :page-sizes="pagerProps.pageSizes"
          :background="pagerProps.background"
          :layout="pagerProps.layout"
          :size="pagerProps.size"
          :hide-on-single-page="false"
          @current-change="handleCurrentPageChange"
          @size-change="handlePageSizeChange"
        />
      </el-config-provider>
    </div>
  </div>
</template>

<style scoped>
.ob-tanstack-table {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: var(--ob-table-bg);
  --ob-table-tree-toggle-icon-size: 16px;
  --ob-table-tree-toggle-size: var(--ob-table-tree-toggle-icon-size);
  --ob-table-tree-toggle-gap: 8px;
  --ob-table-tree-toggle-hover-bg: var(--one-fill-color-light, var(--el-fill-color-light));
  --ob-table-tree-toggle-focus-outline: var(--one-color-primary, var(--el-color-primary));
}

.ob-tanstack-table__main {
  display: flex;
  flex: 1;
  width: 100%;
  min-height: 0;
}

.ob-tanstack-table__table-shell,
.ob-tanstack-table__skeleton {
  display: flex;
  flex: 1;
  width: 100%;
  min-height: 0;
}

.ob-tanstack-table__table-shell {
  overflow: hidden;
}

.ob-tanstack-table__table-scroll {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: var(--ob-table-surface-bg);
}

.ob-tanstack-table__table-scroll.is-empty {
  overflow-x: hidden;
}

.ob-tanstack-table__table {
  width: 100%;
  min-width: 100%;
  border-spacing: 0;
  table-layout: var(--ob-tanstack-table-layout, auto);
}

.ob-tanstack-table__th,
.ob-tanstack-table__td {
  position: relative;
  padding: 0;
  background:
    linear-gradient(var(--ob-table-row-bg), var(--ob-table-row-bg)), var(--ob-table-surface-bg);
  border-bottom: 1px solid var(--ob-table-border-color);
}

.ob-tanstack-table__th {
  position: sticky;
  top: 0;
  z-index: 1;
  background:
    linear-gradient(var(--ob-table-header-bg), var(--ob-table-header-bg)),
    var(--ob-table-surface-bg);
}

.ob-tanstack-table__tr:last-child .ob-tanstack-table__td {
  border-bottom: 0;
}

.ob-tanstack-table__cell {
  display: flex;
  align-items: center;
  min-height: var(--ob-table-row-height-default);
  padding: 0 12px;
  font-size: 14px;
  font-weight: 400;
  color: var(--el-text-color-primary);
}

.ob-tanstack-table__cell--header {
  position: relative;
  font-size: 14px;
  font-weight: var(--ob-table-header-font-weight);
  color: var(--ob-table-header-color);
}

.ob-tanstack-table__th.is-tree-node .ob-tanstack-table__cell--header {
  padding-left: calc(12px + var(--ob-table-tree-toggle-size) + var(--ob-table-tree-toggle-gap));
}

.ob-tanstack-table__cell--header.is-clickable {
  cursor: pointer;
}

.ob-tanstack-table__th[draggable='true'] .ob-tanstack-table__cell--header {
  cursor: grab;
}

.ob-tanstack-table__th[draggable='true']:active .ob-tanstack-table__cell--header {
  cursor: grabbing;
}

.ob-tanstack-table__column-resizer {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 100%;
  cursor: col-resize;
  user-select: none;
  touch-action: none;
}

.ob-tanstack-table__column-resizer::before {
  position: absolute;
  top: 50%;
  right: 3px;
  width: 2px;
  height: 60%;
  background: transparent;
  content: '';
  transform: translateY(-50%);
}

.ob-tanstack-table__column-resizer:hover::before,
.ob-tanstack-table__column-resizer.is-resizing::before {
  background: var(--el-color-primary);
}

.ob-tanstack-table__sort-indicator {
  margin-left: 6px;
  color: var(--ob-table-header-color);
  font-size: 14px;
  line-height: 1;
}

.is-align-left .ob-tanstack-table__cell {
  justify-content: flex-start;
  text-align: left;
}

.is-align-center .ob-tanstack-table__cell {
  justify-content: center;
  text-align: center;
}

.is-align-right .ob-tanstack-table__cell {
  justify-content: flex-end;
  text-align: right;
}

.ob-tanstack-table__tr.is-striped .ob-tanstack-table__td {
  background:
    linear-gradient(var(--ob-table-row-striped-bg), var(--ob-table-row-striped-bg)),
    var(--ob-table-surface-bg);
}

.ob-tanstack-table__th.is-fixed,
.ob-tanstack-table__td.is-fixed {
  background:
    linear-gradient(var(--ob-table-row-bg), var(--ob-table-row-bg)), var(--ob-table-surface-bg);
}

.ob-tanstack-table__th.is-fixed {
  background:
    linear-gradient(var(--ob-table-header-bg), var(--ob-table-header-bg)),
    var(--ob-table-surface-bg);
}

.ob-tanstack-table__tr.is-striped .ob-tanstack-table__td.is-fixed {
  background:
    linear-gradient(var(--ob-table-row-striped-bg), var(--ob-table-row-striped-bg)),
    var(--ob-table-surface-bg);
}

.ob-tanstack-table__th.is-fixed-left-edge::after,
.ob-tanstack-table__td.is-fixed-left-edge::after {
  position: absolute;
  top: 0;
  right: -1px;
  width: 14px;
  height: 100%;
  pointer-events: none;
  content: '';
  box-shadow: var(--ob-table-fixed-left-shadow);
}

.ob-tanstack-table__th.is-fixed-right-edge::before,
.ob-tanstack-table__td.is-fixed-right-edge::before {
  position: absolute;
  top: 0;
  left: -1px;
  width: 14px;
  height: 100%;
  pointer-events: none;
  content: '';
  box-shadow: var(--ob-table-fixed-right-shadow);
}

.ob-tanstack-table__checkbox,
.ob-tanstack-table__expand-toggle,
.ob-tanstack-table__tree-toggle-icon {
  cursor: pointer;
}

.ob-tanstack-table__expand-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--ob-table-tree-toggle-size);
  height: var(--ob-table-tree-toggle-size);
  margin-right: 8px;
  background: transparent;
  border: 0;
  border-radius: 4px;
  transition: background-color 180ms ease;
}

.ob-tanstack-table__tree-cell {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}

.ob-tanstack-table__tree-placeholder {
  display: inline-block;
  width: var(--ob-table-tree-toggle-icon-size);
  flex: 0 0 var(--ob-table-tree-toggle-icon-size);
  margin-right: var(--ob-table-tree-toggle-gap);
}

.ob-tanstack-table__tree-toggle-icon {
  margin-right: var(--ob-table-tree-toggle-gap);
  width: var(--ob-table-tree-toggle-icon-size);
  height: var(--ob-table-tree-toggle-icon-size);
  flex: 0 0 var(--ob-table-tree-toggle-icon-size);
  display: block;
  border-radius: 4px;
  transition:
    background-color 180ms ease,
    opacity 180ms ease;
}

.ob-tanstack-table__tree-toggle-icon:hover {
  background: var(--ob-table-tree-toggle-hover-bg);
}

.ob-tanstack-table__tree-toggle-icon:focus-visible {
  outline: 2px solid var(--ob-table-tree-toggle-focus-outline);
  outline-offset: 1px;
}

.ob-tanstack-table__tree-toggle-icon.is-loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.ob-tanstack-table__tree-content {
  min-width: 0;
}

.is-overflow .ob-tanstack-table__cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ob-tanstack-table__expanded-cell {
  padding: 0;
}

.ob-tanstack-table__expanded-content {
  padding: 16px;
  background: var(--ob-table-column-hover-bg);
}

.ob-tanstack-table__tr--virtual-gap td {
  padding: 0;
  border: 0;
  background: transparent;
}

.ob-tanstack-table__empty {
  padding: 0;
}

.ob-tanstack-table__empty-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(var(--ob-table-row-height-default) + 12px) 0 24px;
  pointer-events: none;
}

.ob-tanstack-table__empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 280px;
  box-sizing: border-box;
  padding: 0 24px;
}

.ob-tanstack-table__empty-figure {
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(284px, calc(100% - 48px));
  max-width: 100%;
  height: 220px;
  border: 1px dashed var(--el-border-color);
}

.ob-tanstack-table__empty-image {
  width: min(248px, 100%);
  max-height: 100%;
  object-fit: contain;
}

.ob-tanstack-table__empty-text {
  margin: 16px 0 0;
  font-family: 'PingFang SC', 'PingFangSC', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--one-text-color-secondary);
  text-align: center;
  letter-spacing: 0;
}

.ob-tanstack-table__skeleton {
  padding: 0 var(--ob-table-skeleton-padding-inline) var(--ob-table-skeleton-padding-bottom);
  overflow: hidden;
  background: var(--ob-table-skeleton-bg);
}

.ob-tanstack-table__skeleton :deep(.el-skeleton) {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--ob-table-skeleton-block-gap);
  width: 100%;
}

.ob-tanstack-table__skeleton-head,
.ob-tanstack-table__skeleton-row {
  display: grid;
  gap: var(--ob-table-skeleton-grid-gap);
  align-items: center;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
}

.ob-tanstack-table__skeleton-head {
  padding: 12px 0;
}

.ob-tanstack-table__skeleton-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--ob-table-skeleton-row-gap);
}

.ob-tanstack-table__skeleton-row {
  min-height: var(--ob-table-skeleton-row-min-height);
}

.ob-tanstack-table__skeleton-cell {
  width: 100%;
  height: var(--ob-table-skeleton-cell-height);
}

.ob-tanstack-table__skeleton-cell--head {
  width: var(--ob-table-skeleton-head-cell-width);
  height: var(--ob-table-skeleton-head-cell-height);
}

.ob-tanstack-table__pager {
  flex-shrink: 0;
  padding-top: var(--ob-table-pager-padding-top);
  background: var(--ob-table-pager-bg);
  border-top: 1px solid var(--ob-table-pager-border-color);
}

.ob-tanstack-table__pager :deep(.el-pagination) {
  position: relative;
  display: flex;
  justify-content: flex-end;
  min-height: var(--ob-table-pager-min-height);
  padding-left: var(--ob-table-pager-content-padding-left);
}

.ob-tanstack-table__pager :deep(.el-pagination__total) {
  position: absolute;
  top: 50%;
  left: var(--ob-table-pager-total-left);
  margin: 0;
  color: var(--ob-table-pager-text-color);
  transform: translateY(-50%);
}
</style>
