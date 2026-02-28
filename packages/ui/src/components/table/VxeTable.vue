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
  type CSSProperties,
  type VNodeChild
} from 'vue';
import { VxePager } from 'vxe-pc-ui';
import { VxeGrid } from 'vxe-table';
import type { VxeGridDefines, VxeGridInstance } from 'vxe-table';
import type {
  AdaptiveConfig,
  TableAlign,
  TableColumn,
  TableColumnList,
  TableColumnRendererParams,
  TablePagination,
  VxeVirtualConfig
} from './types';

defineOptions({
  name: 'VxeTable',
  inheritAttrs: false
});

type RowRecord = Record<string, unknown>;
type PageChangeParams = {
  type?: 'current' | 'size' | string;
  pageSize?: number;
  currentPage?: number;
};

type VxeEventParams = Record<string, unknown>;
type TableCompatInstance = VxeGridInstance & {
  getCheckboxRecords?: () => RowRecord[];
  clearCheckboxRow?: () => Promise<unknown>;
  clearSelection?: () => Promise<void>;
};

interface ObVxeTableProps {
  data?: RowRecord[];
  columns?: TableColumnList;
  loading?: boolean;
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
}

const props = withDefaults(defineProps<ObVxeTableProps>(), {
  data: () => [],
  columns: () => [],
  loading: false,
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
  virtualConfig: undefined
});

const emit = defineEmits<{
  (e: 'selection-change', selection: RowRecord[]): void;
  (e: 'page-size-change', size: number): void;
  (e: 'page-current-change', page: number): void;
  (e: 'sort-change', payload: VxeEventParams): void;
}>();

const attrs = useAttrs();
const slots = useSlots();

const wrapperRef = ref<HTMLDivElement>();
const gridRef = ref<TableCompatInstance | null>(null);
const adaptiveHeight = ref<number>();
let resizeObserver: ResizeObserver | null = null;

const wrapperClass = computed(() => ['ob-vxe-table', attrs.class]);
const wrapperStyle = computed<CSSProperties>(() => {
  const style = (attrs.style || {}) as CSSProperties;
  return {
    ...style,
    '--ob-vxe-table-layout': props.tableLayout
  } as CSSProperties;
});

const passthroughAttrs = computed(() => {
  const blockedKeys = new Set([
    'class',
    'style',
    'data',
    'columns',
    'loading',
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
    'scrollbarConfig'
  ]);

  return Object.fromEntries(
    Object.entries(attrs).filter(([key]) => !blockedKeys.has(key))
  );
});

const scrollYConfig = computed<Record<string, unknown> | undefined>(() => {
  if (!props.virtualConfig) return undefined;
  const enabled = props.virtualConfig.enabled ?? Boolean(props.virtualConfig.y);
  if (!enabled) return undefined;

  return {
    enabled: true,
    ...(props.virtualConfig.y || {})
  };
});

const scrollXConfig = computed<Record<string, unknown> | undefined>(() => {
  if (!props.virtualConfig) return undefined;
  const enabled = props.virtualConfig.enabled ?? Boolean(props.virtualConfig.x);
  if (!enabled) return undefined;

  return {
    enabled: true,
    ...(props.virtualConfig.x || {})
  };
});

const resolvedScrollbarConfig = computed<Record<string, unknown>>(() => {
  const defaultConfig = {
    x: { visible: 'auto' },
    y: { visible: 'auto' }
  };

  const attrsRecord = attrs as Record<string, unknown>;
  const userConfig = attrsRecord.scrollbarConfig as
    | {
        x?: Record<string, unknown>;
        y?: Record<string, unknown>;
        [key: string]: unknown;
      }
    | undefined;

  if (!userConfig || typeof userConfig !== 'object') {
    return defaultConfig;
  }

  return {
    ...defaultConfig,
    ...userConfig,
    x: {
      ...defaultConfig.x,
      ...(userConfig.x || {})
    },
    y: {
      ...defaultConfig.y,
      ...(userConfig.y || {})
    }
  };
});

function resolveColumnField(prop: TableColumn['prop'], index: number): string | undefined {
  if (typeof prop === 'function') {
    const result = prop(index);
    return typeof result === 'string' && result.length > 0 ? result : undefined;
  }
  return typeof prop === 'string' && prop.length > 0 ? prop : undefined;
}

function resolveColumnHidden(column: TableColumn): boolean {
  if (typeof column.hide === 'function') {
    return Boolean(column.hide(column));
  }
  return Boolean(column.hide);
}

function resolveColumnType(type?: TableColumn['type']): string | undefined {
  if (type === 'selection') return 'checkbox';
  if (type === 'index') return 'seq';
  if (type === 'expand') return 'expand';
  return undefined;
}

function isOperationColumn(column: TableColumn, index: number): boolean {
  const field = resolveColumnField(column.prop, index) || '';
  const slotName = column.slot || '';
  const label = column.label || '';
  const candidateSet = new Set(['operation', 'action', 'actions']);

  if (candidateSet.has(field)) return true;
  if (candidateSet.has(slotName)) return true;
  return label.includes('操作');
}

function resolveColumnOverflow(column: TableColumn, index: number): boolean | string | undefined {
  // 操作列包含按钮/下拉，启用 tooltip 会影响点击和下拉交互，默认关闭。
  if (isOperationColumn(column, index)) return undefined;

  const showOverflow = column.showOverflowTooltip ?? props.showOverflowTooltip;
  return showOverflow ? ('tooltip' as const) : undefined;
}

function createRendererParams(
  column: TableColumn,
  params: VxeEventParams
): TableColumnRendererParams {
  const rowIndex = Number(params.$rowIndex ?? params.rowIndex ?? 0);
  return {
    row: (params.row || {}) as RowRecord,
    column,
    $index: rowIndex,
    index: rowIndex,
    props: props as Record<string, unknown>,
    attrs: attrs as Record<string, unknown>
  };
}

function getColumnDefaultValue(column: TableColumn, params: VxeEventParams, index: number): VNodeChild {
  if (typeof params.cellValue !== 'undefined') {
    return params.cellValue as VNodeChild;
  }

  const field = resolveColumnField(column.prop, index);
  if (!field) return '';

  const row = params.row as RowRecord | undefined;
  const value = row ? row[field] : '';
  return (value ?? '') as VNodeChild;
}

function createColumnSlots(column: TableColumn, index: number) {
  const columnSlots: Record<string, (params: VxeEventParams) => VNodeChild> = {};

  if (column.slot || column.cellRenderer) {
    columnSlots.default = (params: VxeEventParams) => {
      if (column.slot && slots[column.slot]) {
        return slots[column.slot]?.(params) as unknown as VNodeChild;
      }

      if (column.cellRenderer) {
        return column.cellRenderer(createRendererParams(column, params));
      }

      return getColumnDefaultValue(column, params, index);
    };
  }

  if (column.headerSlot || column.headerRenderer) {
    columnSlots.header = (params: VxeEventParams) => {
      if (column.headerSlot && slots[column.headerSlot]) {
        return slots[column.headerSlot]?.(params) as unknown as VNodeChild;
      }

      if (column.headerRenderer) {
        return column.headerRenderer({
          column,
          props: props as Record<string, unknown>,
          attrs: attrs as Record<string, unknown>
        });
      }

      return (column.label || '') as VNodeChild;
    };
  }

  return columnSlots;
}

function createSeqMethod(column: TableColumn) {
  return ({ rowIndex }: { rowIndex: number }) => {
    if (typeof column.index === 'function') {
      return column.index(rowIndex);
    }
    if (typeof column.index === 'number') {
      return rowIndex + column.index;
    }
    return rowIndex + 1;
  };
}

function convertColumns(columns: TableColumnList): Record<string, unknown>[] {
  return columns.map((column, index) => {
    const mappedColumn: Record<string, unknown> = { ...column };

    const type = resolveColumnType(column.type);
    mappedColumn.title = column.label;
    mappedColumn.field = resolveColumnField(column.prop, index);
    mappedColumn.type = type;
    mappedColumn.showOverflow = resolveColumnOverflow(column, index);
    mappedColumn.align = column.align ?? props.alignWhole;
    mappedColumn.headerAlign = column.headerAlign ?? props.headerAlign ?? props.alignWhole;
    mappedColumn.visible = !resolveColumnHidden(column);

    delete mappedColumn.label;
    delete mappedColumn.prop;
    delete mappedColumn.slot;
    delete mappedColumn.headerSlot;
    delete mappedColumn.cellRenderer;
    delete mappedColumn.headerRenderer;
    delete mappedColumn.hide;
    delete mappedColumn.showOverflowTooltip;
    delete mappedColumn.children;

    const mappedChildren = Array.isArray(column.children) ? convertColumns(column.children) : undefined;
    if (mappedChildren && mappedChildren.length > 0) {
      mappedColumn.children = mappedChildren;
    }

    if (type === 'seq') {
      mappedColumn.seqMethod = createSeqMethod(column);
    }

    const columnSlots = createColumnSlots(column, index);
    if (Object.keys(columnSlots).length > 0) {
      mappedColumn.slots = columnSlots;
    }

    return mappedColumn;
  });
}

const vxeColumns = computed<Record<string, unknown>[]>(() => convertColumns(props.columns));

function resolvePagerLayouts(layout?: string): Array<'Total' | 'Sizes' | 'PrevPage' | 'Number' | 'NextPage' | 'FullJump'> {
  if (!layout) {
    return ['Total', 'Sizes', 'PrevPage', 'Number', 'NextPage', 'FullJump'];
  }

  const layoutMap: Record<string, 'Total' | 'Sizes' | 'PrevPage' | 'Number' | 'NextPage' | 'FullJump'> = {
    total: 'Total',
    sizes: 'Sizes',
    prev: 'PrevPage',
    pager: 'Number',
    next: 'NextPage',
    jumper: 'FullJump'
  };

  const layouts = layout
    .split(',')
    .map((item) => item.trim())
    .map((item) => layoutMap[item])
    .filter((item): item is 'Total' | 'Sizes' | 'PrevPage' | 'Number' | 'NextPage' | 'FullJump' =>
      Boolean(item)
    );

  return layouts.length > 0 ? layouts : ['Total', 'Sizes', 'PrevPage', 'Number', 'NextPage', 'FullJump'];
}

const normalizedPagination = computed<TablePagination | null>(() => {
  if (!props.pagination) return null;
  return props.pagination;
});

const pagerProps = computed<Record<string, unknown> | null>(() => {
  if (!normalizedPagination.value) return null;

  const pagerSmall = props.paginationSmall ?? attrs.size === 'small';

  return {
    autoHidden: false,
    total: Number(normalizedPagination.value.total ?? 0),
    currentPage: Number(normalizedPagination.value.currentPage ?? 1),
    pageSize: Number(normalizedPagination.value.pageSize ?? 10),
    pageSizes:
      Array.isArray(normalizedPagination.value.pageSizes) && normalizedPagination.value.pageSizes.length > 0
        ? normalizedPagination.value.pageSizes
        : [10, 20, 50, 100],
    background: normalizedPagination.value.background ?? true,
    layouts: resolvePagerLayouts(normalizedPagination.value.layout),
    size: pagerSmall ? 'small' : undefined
  };
});

const tableShowOverflow = computed<'tooltip' | undefined>(() =>
  props.showOverflowTooltip ? 'tooltip' : undefined
);

const rowConfig = computed<Record<string, unknown> | undefined>(() => {
  if (!props.rowKey) return undefined;
  return {
    keyField: props.rowKey
  };
});

const gridHeight = computed<number | undefined>(() => {
  if (!props.adaptive) return undefined;
  if (props.adaptiveConfig?.fixHeader === false) return undefined;
  return adaptiveHeight.value;
});

const resolvedGridHeight = computed<number | string | undefined>(() => {
  if (typeof gridHeight.value === 'number') {
    return gridHeight.value;
  }

  // 默认撑满容器高度，让表体在容器内独立滚动（无分页树表同样生效）
  return '100%';
});




function collectSelection() {
  const table = gridRef.value;
  const rows = table?.getCheckboxRecords?.();
  emit('selection-change', Array.isArray(rows) ? rows : []);
}

function handlePageChange(params: PageChangeParams) {
  const eventType = params.type;
  if (eventType === 'size') {
    emit('page-size-change', Number(params.pageSize ?? 10));
    return;
  }
  emit('page-current-change', Number(params.currentPage ?? 1));
}

function handleSortChange(params: VxeGridDefines.SortChangeEventParams) {
  emit('sort-change', {
    ...params,
    prop: params.field
  });
}

function updateAdaptiveHeight() {
  if (!props.adaptive || !wrapperRef.value || props.adaptiveConfig?.fixHeader === false) {
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

async function clearSelection() {
  const table = gridRef.value;
  if (table?.clearCheckboxRow) {
    await table.clearCheckboxRow();
  }
  emit('selection-change', []);
}

function getTableRef() {
  const table = gridRef.value as unknown as Record<string, unknown> | null;
  if (!table) return null;

  if (typeof table.clearSelection !== 'function') {
    table.clearSelection = () => clearSelection();
  }

  return table;
}

function bindAdaptiveObserver() {
  if (!props.adaptive || !wrapperRef.value) return;

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
  () => [props.data.length, normalizedPagination.value?.currentPage, normalizedPagination.value?.pageSize],
  () => {
    if (props.adaptive) {
      setAdaptive();
    }
  }
);

onMounted(() => {
  bindAdaptiveObserver();
});

onBeforeUnmount(() => {
  unbindAdaptiveObserver();
});

defineExpose({
  getTableRef,
  setAdaptive,
  clearSelection
});
</script>

<template>
  <div ref="wrapperRef" :class="wrapperClass" :style="wrapperStyle">
    <div class="ob-vxe-table__main">
      <VxeGrid
        ref="gridRef"
        :data="data"
        :columns="vxeColumns"
        :loading="loading"
        :stripe="stripe"
        :border="border"
        :height="resolvedGridHeight"
        :show-overflow="tableShowOverflow"
        :align="alignWhole"
        :header-align="headerAlign || alignWhole"
        :row-config="rowConfig"
        :tree-config="treeConfig"
        :scroll-y="scrollYConfig"
        :scroll-x="scrollXConfig"
        :scrollbar-config="resolvedScrollbarConfig"
        :loading-config="{icon: 'vxe-icon-indicator roll', text: '正在拼命加载中...'}"
        v-bind="passthroughAttrs"
        @checkbox-change="collectSelection"
        @checkbox-all="collectSelection"
        @sort-change="handleSortChange"
      />
    </div>

    <div v-if="pagerProps" class="ob-vxe-table__pager">
      <VxePager v-bind="pagerProps" @page-change="handlePageChange" />
    </div>
  </div>
</template>

<style scoped>
.ob-vxe-table {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: var(--el-bg-color);
}

.ob-vxe-table__main {
  display: flex;
  flex: 1;
  width: 100%;
  min-height: 0;
}

.ob-vxe-table__pager {
  flex-shrink: 0;
  padding-top: 8px;
  background: var(--vxe-ui-layout-background-color);
  border-top: 1px solid var(--vxe-ui-table-border-color);
}

.ob-vxe-table :deep(.vxe-grid) {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  min-height: 0;
}

.ob-vxe-table :deep(.vxe-grid--wrapper),
.ob-vxe-table :deep(.vxe-grid--layout-wrapper) {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.ob-vxe-table :deep(.vxe-grid--layout-body-wrapper) {
  display: flex;
  flex-direction: row;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.ob-vxe-table :deep(.vxe-grid--layout-body-content-wrapper) {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.ob-vxe-table :deep(.vxe-grid--layout-body-wrapper),
.ob-vxe-table :deep(.vxe-grid--layout-body-content-wrapper),
.ob-vxe-table :deep(.vxe-grid--table-wrapper) {
  min-height: 0;
}

.ob-vxe-table :deep(.vxe-grid--table-container) {
  display: flex;
  flex: 1;
  width: 100%;
  min-height: 0;
}


.ob-vxe-table :deep(.vxe-grid--table-wrapper .vxe-table) {
  height: 100%;
  min-height: 0;
}

.ob-vxe-table :deep(.vxe-table--header-wrapper),
.ob-vxe-table :deep(.vxe-table--body-wrapper),
.ob-vxe-table :deep(.vxe-table--fixed-left-wrapper),
.ob-vxe-table :deep(.vxe-table--fixed-right-wrapper) {
  border-left: 0;
  border-right: 0;
}


.ob-vxe-table :deep(.vxe-table--header-wrapper table),
.ob-vxe-table :deep(.vxe-table--body-wrapper table) {
  min-width: 100%;
  table-layout: var(--ob-vxe-table-layout, fixed);
}

.ob-vxe-table :deep(.vxe-table--render-default) {
  width: 100%;
  height: 100%;
  min-width: 0;
}

.ob-vxe-table :deep(.vxe-table--viewport-wrapper),
.ob-vxe-table :deep(.vxe-table--main-wrapper),
.ob-vxe-table :deep(.vxe-table--body-wrapper),
.ob-vxe-table :deep(.vxe-table--body-inner-wrapper) {
  min-width: 0;
}

.ob-vxe-table :deep(.vxe-header--column) {
  background: var(--vxe-ui-table-header-background-color);
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.ob-vxe-table :deep(.vxe-header--column .vxe-cell) {
  font-weight: 600;
}

.ob-vxe-table :deep(.vxe-table--render-default .vxe-table--border-line) {
  display: none;
}

.ob-vxe-table :deep(.vxe-table--render-default .vxe-header--column),
.ob-vxe-table :deep(.vxe-table--render-default .vxe-body--column) {
  border-left: 0;
  border-right: 0;
}

.ob-vxe-table :deep(.vxe-body--column) {
  background: var(--vxe-ui-layout-background-color);
  border-bottom: 1px solid var(--vxe-ui-table-border-color);
}

.ob-vxe-table :deep(.vxe-body--row:last-child .vxe-body--column) {
  border-bottom: 0;
}

/* 虚拟滚动条：默认隐藏，鼠标悬浮表格时显示 */
.ob-vxe-table :deep(.vxe-table--scroll-x-virtual),
.ob-vxe-table :deep(.vxe-table--scroll-y-virtual) {
  pointer-events: none;
  visibility: hidden !important;
  opacity: 0;
  border: 0 !important;
  background: transparent !important;
  background-image: none !important;
  transition: opacity 0.16s ease;
}

.ob-vxe-table :deep(.vxe-table--scroll-x-virtual),
.ob-vxe-table :deep(.vxe-table--scroll-x-wrapper),
.ob-vxe-table :deep(.vxe-table--scroll-x-handle) {
  height: var(--ob-vxe-scrollbar-hit-size);
}

.ob-vxe-table :deep(.vxe-table--scroll-y-virtual),
.ob-vxe-table :deep(.vxe-table--scroll-y-wrapper),
.ob-vxe-table :deep(.vxe-table--scroll-y-handle) {
  width: var(--ob-vxe-scrollbar-hit-size);
}

.ob-vxe-table :deep(.vxe-table:hover .vxe-table--scroll-x-virtual),
.ob-vxe-table :deep(.vxe-table:hover .vxe-table--scroll-y-virtual) {
  pointer-events: auto;
  visibility: visible !important;
  opacity: 1;
}

.ob-vxe-table :deep(.vxe-table--scroll-x-handle),
.ob-vxe-table :deep(.vxe-table--scroll-y-handle) {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.ob-vxe-table :deep(.vxe-table--scroll-x-wrapper),
.ob-vxe-table :deep(.vxe-table--scroll-y-wrapper),
.ob-vxe-table :deep(.vxe-table--scroll-x-handle),
.ob-vxe-table :deep(.vxe-table--scroll-y-handle),
.ob-vxe-table :deep(.vxe-table--scroll-x-handle-appearance),
.ob-vxe-table :deep(.vxe-table--scroll-y-handle-appearance),
.ob-vxe-table :deep(.vxe-table--scroll-x-left-corner),
.ob-vxe-table :deep(.vxe-table--scroll-x-right-corner),
.ob-vxe-table :deep(.vxe-table--scroll-y-top-corner),
.ob-vxe-table :deep(.vxe-table--scroll-y-bottom-corner) {
  border: 0 !important;
  box-shadow: none !important;
  background-image: none !important;
  background: transparent !important;
}

.ob-vxe-table :deep(.vxe-table--scroll-x-left-corner),
.ob-vxe-table :deep(.vxe-table--scroll-x-right-corner),
.ob-vxe-table :deep(.vxe-table--scroll-y-top-corner),
.ob-vxe-table :deep(.vxe-table--scroll-y-bottom-corner) {
  display: none !important;
}

.ob-vxe-table :deep(.vxe-table--scroll-x-left-corner::before),
.ob-vxe-table :deep(.vxe-table--scroll-x-right-corner::before),
.ob-vxe-table :deep(.vxe-table--scroll-y-top-corner::before),
.ob-vxe-table :deep(.vxe-table--scroll-y-bottom-corner::before) {
  display: none !important;
}

.ob-vxe-table :deep(.vxe-table--scroll-x-handle::-webkit-scrollbar) {
  height: var(--ob-vxe-scrollbar-hit-size);
  background: transparent;
}

.ob-vxe-table :deep(.vxe-table--scroll-y-handle::-webkit-scrollbar) {
  width: var(--ob-vxe-scrollbar-hit-size);
  background: transparent;
}

.ob-vxe-table :deep(.vxe-table--scroll-x-handle::-webkit-scrollbar-track),
.ob-vxe-table :deep(.vxe-table--scroll-y-handle::-webkit-scrollbar-track) {
  border-radius: var(--ob-vxe-scrollbar-radius);
  background: var(--ob-vxe-scrollbar-track-color);
}

.ob-vxe-table :deep(.vxe-table--scroll-x-handle::-webkit-scrollbar-thumb),
.ob-vxe-table :deep(.vxe-table--scroll-y-handle::-webkit-scrollbar-thumb) {
  border: var(--ob-vxe-scrollbar-gap) solid transparent;
  border-radius: var(--ob-vxe-scrollbar-radius);
  background-clip: padding-box;
  background-color: transparent;
  transition: background-color 0.2s ease;
}

.ob-vxe-table :deep(.vxe-table:hover .vxe-table--scroll-x-handle),
.ob-vxe-table :deep(.vxe-table:hover .vxe-table--scroll-y-handle) {
  scrollbar-color: var(--ob-vxe-scrollbar-thumb-color) transparent;
}

.ob-vxe-table :deep(.vxe-table:hover .vxe-table--scroll-x-handle::-webkit-scrollbar-thumb),
.ob-vxe-table :deep(.vxe-table:hover .vxe-table--scroll-y-handle::-webkit-scrollbar-thumb) {
  background-color: var(--ob-vxe-scrollbar-thumb-color);
}

.ob-vxe-table :deep(.vxe-table--scroll-x-handle:hover),
.ob-vxe-table :deep(.vxe-table--scroll-y-handle:hover) {
  scrollbar-color: var(--ob-vxe-scrollbar-thumb-hover-color) transparent;
}

.ob-vxe-table :deep(.vxe-table--scroll-x-handle:hover::-webkit-scrollbar-thumb),
.ob-vxe-table :deep(.vxe-table--scroll-y-handle:hover::-webkit-scrollbar-thumb) {
  background-color: var(--ob-vxe-scrollbar-thumb-hover-color);
}

.ob-vxe-table :deep(.vxe-table--scroll-x-handle:active::-webkit-scrollbar-thumb),
.ob-vxe-table :deep(.vxe-table--scroll-y-handle:active::-webkit-scrollbar-thumb) {
  background-color: var(--ob-vxe-scrollbar-thumb-active-color);
}

.ob-vxe-table :deep(.vxe-table--render-default .vxe-table--fixed-left-wrapper),
.ob-vxe-table :deep(.vxe-table--render-default .vxe-table--fixed-right-wrapper) {
  transition: box-shadow 0.24s ease;
}

.ob-vxe-table__pager :deep(.vxe-pager) {
  position: relative;
  justify-content: flex-end;
  min-height: 32px;
  padding-left: 120px;
}

.ob-vxe-table__pager :deep(.vxe-pager--total) {
  position: absolute;
  left: 4px;
  top: 50%;
  margin: 0;
  transform: translateY(-50%);
  color: var(--el-text-color-regular);
}
</style>
