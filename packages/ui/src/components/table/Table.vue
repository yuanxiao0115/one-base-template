<script setup lang="ts">
import {
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  useSlots,
  watch,
  type CSSProperties,
  type PropType,
  type Slots,
  type VNodeChild
} from 'vue';
import zhCnLocale from 'element-plus/es/locale/lang/zh-cn';
import type { TableInstance } from 'element-plus';
import { ElTableColumn, ElTooltip } from 'element-plus';
import emptyStateImage from './assets/table-empty-state.webp';
import type {
  AdaptiveConfig,
  TableAlign,
  TableColumn,
  TableColumnList,
  TableColumnRendererParams,
  TablePagination
} from './types';

defineOptions({
  name: 'Table',
  inheritAttrs: false
});

type RowRecord = Record<string, unknown>;

type VxeEventParams = Record<string, unknown>;

type ElementTableSize = '' | 'default' | 'small' | 'large' | undefined;

interface PageChangeParams {
  pageSize?: number;
  currentPage?: number;
}

interface ObElementTableProps {
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
  showEmptyValue?: boolean;
  emptyValueText?: string;
  emptyText?: string;
  alignWhole?: TableAlign;
  headerAlign?: TableAlign;
  stripe?: boolean;
  border?: boolean;
  adaptive?: boolean;
  adaptiveConfig?: AdaptiveConfig;
  treeConfig?: Record<string, unknown>;
  reserveSelection?: boolean;
}

interface ElementTableRuntimeProps {
  alignWhole: TableAlign;
  headerAlign?: TableAlign;
  showOverflowTooltip: boolean;
  showEmptyValue: boolean;
  emptyValueText: string;
  size?: ElementTableSize;
  reserveSelection: boolean;
}

interface ElementPagerProps {
  total: number;
  currentPage: number;
  pageSize: number;
  pageSizes: number[];
  background: boolean;
  layout: string;
  size?: ElementTableSize;
}

interface ElementTableBindingProps {
  data: RowRecord[];
  stripe: boolean;
  border: boolean;
  rowKey: string;
  tableLayout: 'fixed' | 'auto';
  height: number | string | undefined;
  defaultExpandAll: boolean;
  treeProps: {
    children: string;
    hasChildren: string;
  };
  lazy: boolean;
  load?: (row: RowRecord, treeNode: unknown, resolve: (rows: RowRecord[]) => void) => void;
  indent: number;
  emptyText: string;
  [key: string]: unknown;
}

interface TreeLoadMethodParams {
  row: RowRecord;
  treeNode?: unknown;
  resolve?: (rows: RowRecord[]) => void;
}

type TreeLoadMethod = (
  params: TreeLoadMethodParams
) => Promise<RowRecord[] | void> | RowRecord[] | void;

interface ColumnBridgeScope {
  row: RowRecord;
  column?: Record<string, unknown>;
  $index: number;
  store?: Record<string, unknown>;
}

const props = withDefaults(defineProps<ObElementTableProps>(), {
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
  showEmptyValue: true,
  emptyValueText: '---',
  emptyText: '暂未生产任何数据',
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
const tableRef = ref<TableInstance | null>(null);
const adaptiveHeight = ref<number>();
let resizeObserver: ResizeObserver | null = null;

type TableCompatInstance = TableInstance & {
  clearSelection?: () => void;
};

function resolveTableSize(attrsRecord: Record<string, unknown>): ElementTableSize {
  const size = attrsRecord.size;
  if (size === '' || size === 'default' || size === 'small' || size === 'large') {
    return size;
  }
  return undefined;
}

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

function isOperationColumn(column: TableColumn, index: number): boolean {
  const field = resolveColumnField(column.prop, index) || '';
  const slotName = column.slot || '';
  const label = column.label || '';
  const candidateSet = new Set(['operation', 'action', 'actions']);

  if (candidateSet.has(field)) {
    return true;
  }
  if (candidateSet.has(slotName)) {
    return true;
  }
  return label.includes('操作');
}

function resolveColumnShowOverflow(
  column: TableColumn,
  props: Pick<ObElementTableProps, 'showOverflowTooltip'>
): boolean {
  return Boolean(column.showOverflowTooltip ?? column.ellipsis ?? props.showOverflowTooltip);
}

function resolveColumnShowEmptyValue(
  column: TableColumn,
  props: Pick<ObElementTableProps, 'showEmptyValue'>
): boolean {
  return Boolean(column.showEmptyValue ?? props.showEmptyValue);
}

function resolveColumnEmptyValueText(
  column: TableColumn,
  props: Pick<ObElementTableProps, 'emptyValueText'>
): string {
  return column.emptyValueText ?? props.emptyValueText ?? '---';
}

function resolveCellDisplayValue(
  value: unknown,
  showEmptyValue: boolean,
  emptyValueText: string
): string | number | VNodeChild {
  const isEmptyString = typeof value === 'string' && value.trim().length === 0;
  if (value == null || isEmptyString) {
    if (!showEmptyValue) {
      return '';
    }
    return emptyValueText;
  }
  return value as string | number | VNodeChild;
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

function resolveTreeLoadMethod(treeConfig?: Record<string, unknown>): TreeLoadMethod | null {
  const loadMethod = treeConfig?.loadMethod;
  return typeof loadMethod === 'function' ? (loadMethod as TreeLoadMethod) : null;
}

function resolvePagerLayout(layout?: string): string {
  const defaultLayout = ['total', 'sizes', 'prev', 'pager', 'next', 'jumper'];
  if (!layout) {
    return defaultLayout.join(', ');
  }

  const layoutSet = new Set(defaultLayout);
  const resolvedLayout = layout
    .split(',')
    .map((item) => item.trim())
    .filter((item) => layoutSet.has(item));

  return resolvedLayout.length > 0 ? resolvedLayout.join(', ') : defaultLayout.join(', ');
}

const normalizedData = computed<RowRecord[]>(() => (Array.isArray(props.data) ? props.data : []));
const normalizedColumns = computed<TableColumnList>(() =>
  Array.isArray(props.columns) ? props.columns : []
);

const wrapperClass = computed(() => ['ob-table', attrs.class]);
const wrapperStyle = computed<CSSProperties>(() => {
  const style = (attrs.style || {}) as CSSProperties;
  return {
    ...style,
    '--ob-table-layout': props.tableLayout
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
    'showEmptyValue',
    'emptyValueText',
    'emptyText',
    'alignWhole',
    'headerAlign',
    'stripe',
    'border',
    'adaptive',
    'adaptiveConfig',
    'treeConfig',
    'reserveSelection'
  ]);

  return Object.fromEntries(Object.entries(attrs).filter(([key]) => !blockedKeys.has(key)));
});

const attrsRecord = computed(() => attrs as Record<string, unknown>);

const runtimeTableProps = computed<ElementTableRuntimeProps>(() => ({
  alignWhole: props.alignWhole,
  headerAlign: props.headerAlign,
  showOverflowTooltip: props.showOverflowTooltip,
  showEmptyValue: props.showEmptyValue,
  emptyValueText: props.emptyValueText,
  size: resolveTableSize(attrsRecord.value),
  reserveSelection: props.reserveSelection
}));

const visibleColumns = computed(() =>
  normalizedColumns.value.filter((column) => !resolveColumnHidden(column))
);

const normalizedPagination = computed<TablePagination | null>(() => {
  if (!props.pagination) {
    return null;
  }
  return props.pagination;
});

const pagerProps = computed<ElementPagerProps | null>(() => {
  if (!normalizedPagination.value) {
    return null;
  }

  const pagerSmall = props.paginationSmall ?? attrs.size === 'small';

  return {
    total: Number(normalizedPagination.value.total ?? 0),
    currentPage: Number(normalizedPagination.value.currentPage ?? 1),
    pageSize: Number(normalizedPagination.value.pageSize ?? 10),
    pageSizes:
      Array.isArray(normalizedPagination.value.pageSizes) &&
      normalizedPagination.value.pageSizes.length > 0
        ? normalizedPagination.value.pageSizes
        : [10, 20, 50, 100],
    background: normalizedPagination.value.background ?? true,
    layout: resolvePagerLayout(normalizedPagination.value.layout),
    size: pagerSmall ? 'small' : undefined
  };
});

const resolvedEmptyText = computed(() => {
  const content = props.emptyText?.trim();
  return content && content.length > 0 ? content : '暂未生产任何数据';
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

const resolvedTableHeight = computed<number | string | undefined>(() => {
  if (typeof gridHeight.value === 'number') {
    return gridHeight.value;
  }
  return '100%';
});

const childrenField = computed(() => resolveTreeChildrenField(props.treeConfig));
const hasChildField = computed(() => resolveTreeHasChildField(props.treeConfig));
const isLazyTree = computed(
  () => props.treeConfig?.lazy === true && Boolean(resolveTreeLoadMethod(props.treeConfig))
);
const treeProps = computed(() => ({
  children: childrenField.value,
  hasChildren: hasChildField.value
}));
const defaultExpandAll = computed(() => props.treeConfig?.expandAll === true);
const indent = computed(() => Number(props.treeConfig?.indent ?? 16));

const elementTableProps = computed<ElementTableBindingProps>(() => ({
  ...passthroughAttrs.value,
  data: normalizedData.value,
  stripe: props.stripe,
  border: props.border,
  rowKey: props.rowKey,
  tableLayout: props.tableLayout,
  height: resolvedTableHeight.value,
  defaultExpandAll: defaultExpandAll.value,
  treeProps: treeProps.value,
  lazy: isLazyTree.value,
  load: isLazyTree.value ? handleTreeLoad : undefined,
  indent: indent.value,
  emptyText: resolvedEmptyText.value
}));

function getRowValue(row: RowRecord, field?: string) {
  if (!field) {
    return '';
  }
  return row[field];
}

function createRendererParams(
  column: TableColumn,
  row: RowRecord,
  rowIndex: number
): TableColumnRendererParams {
  return {
    row,
    column,
    $index: rowIndex,
    index: rowIndex,
    size: runtimeTableProps.value.size,
    props: props as Record<string, unknown>,
    attrs: attrsRecord.value
  };
}

function renderValueWithOverflow(
  displayValue: VNodeChild,
  showOverflowTooltip: boolean,
  isOperation: boolean
) {
  if (typeof displayValue !== 'string' && typeof displayValue !== 'number') {
    return displayValue;
  }

  const text = String(displayValue);
  const content = h(
    'span',
    {
      class: ['ob-table__cell-text', showOverflowTooltip && !isOperation ? 'is-ellipsis' : '']
    },
    text
  );

  if (!showOverflowTooltip || isOperation || text.length === 0) {
    return content;
  }

  return h(
    ElTooltip,
    {
      content: text,
      placement: 'top',
      showAfter: 300
    },
    {
      default: () => content
    }
  );
}

function renderDefaultCellContent(
  column: TableColumn,
  row: RowRecord,
  rowIndex: number,
  columnIndex: number
) {
  const field = resolveColumnField(column.prop, columnIndex);
  const value = getRowValue(row, field);
  const showEmptyValue = resolveColumnShowEmptyValue(column, props);
  const emptyValueText = resolveColumnEmptyValueText(column, props);
  const displayValue = resolveCellDisplayValue(value, showEmptyValue, emptyValueText);
  const showOverflowTooltip = resolveColumnShowOverflow(column, props);
  return renderValueWithOverflow(
    displayValue,
    showOverflowTooltip,
    isOperationColumn(column, columnIndex)
  );
}

function renderColumnHeader(column: TableColumn) {
  if (column.headerSlot && slots[column.headerSlot]) {
    return slots[column.headerSlot]?.({
      column,
      props: props as Record<string, unknown>,
      attrs: attrsRecord.value
    }) as unknown as VNodeChild;
  }

  if (column.headerRenderer) {
    return column.headerRenderer({
      column,
      props: props as Record<string, unknown>,
      attrs: attrsRecord.value
    });
  }

  return column.label || '';
}

function resolveColumnType(type?: TableColumn['type']) {
  if (type === 'selection') {
    return 'selection';
  }
  if (type === 'index') {
    return 'index';
  }
  if (type === 'expand') {
    return 'expand';
  }
  return undefined;
}

function createSeqMethod(column: TableColumn) {
  return (index: number) => {
    if (typeof column.index === 'function') {
      return column.index(index);
    }
    if (typeof column.index === 'number') {
      return index + column.index;
    }
    return index + 1;
  };
}

const ElementTableColumnBridge = defineComponent({
  name: 'ElementTableColumnBridge',
  props: {
    column: {
      type: Object as PropType<TableColumn>,
      required: true
    },
    columnIndex: {
      type: Number,
      required: true
    },
    tableProps: {
      type: Object as PropType<ElementTableRuntimeProps>,
      required: true
    },
    tableSlots: {
      type: Object as PropType<Slots>,
      required: true
    }
  },
  setup(bridgeProps) {
    function renderColumnCell(scope: ColumnBridgeScope) {
      const column = bridgeProps.column;
      const row = (scope.row || {}) as RowRecord;
      const rowIndex = Number(scope.$index ?? 0);

      if (column.slot && bridgeProps.tableSlots[column.slot]) {
        return bridgeProps.tableSlots[column.slot]?.({
          ...scope,
          size: bridgeProps.tableProps.size
        }) as unknown as VNodeChild;
      }

      if (column.cellRenderer) {
        return column.cellRenderer(createRendererParams(column, row, rowIndex));
      }

      return renderDefaultCellContent(column, row, rowIndex, bridgeProps.columnIndex);
    }

    return () => {
      const column = bridgeProps.column;
      const columnIndex = bridgeProps.columnIndex;
      const mappedColumn: Record<string, unknown> = { ...column };
      const type = resolveColumnType(column.type);
      const field = resolveColumnField(column.prop, columnIndex);
      const childColumns = Array.isArray(column.children)
        ? column.children.filter((child) => !resolveColumnHidden(child))
        : [];

      mappedColumn.type = type;
      mappedColumn.prop = field;
      mappedColumn.label = column.label;
      mappedColumn.width = column.width;
      mappedColumn.minWidth = column.minWidth;
      mappedColumn.fixed = column.fixed;
      mappedColumn.sortable = column.sortable;
      mappedColumn.align = column.align ?? bridgeProps.tableProps.alignWhole;
      mappedColumn.headerAlign =
        column.headerAlign ??
        bridgeProps.tableProps.headerAlign ??
        bridgeProps.tableProps.alignWhole;
      mappedColumn.className = column.className;
      mappedColumn.showOverflowTooltip = false;

      mappedColumn.slot = undefined;
      mappedColumn.headerSlot = undefined;
      mappedColumn.cellRenderer = undefined;
      mappedColumn.headerRenderer = undefined;
      mappedColumn.hide = undefined;
      mappedColumn.children = undefined;
      mappedColumn.ellipsis = undefined;
      mappedColumn.showEmptyValue = undefined;
      mappedColumn.emptyValueText = undefined;
      mappedColumn.treeNode = undefined;

      if (type === 'selection') {
        mappedColumn.reserveSelection = bridgeProps.tableProps.reserveSelection;
      }

      if (type === 'index') {
        mappedColumn.index = createSeqMethod(column);
      }

      const componentSlots: Record<string, (scope?: ColumnBridgeScope) => VNodeChild> = {};

      if (column.headerSlot || column.headerRenderer) {
        componentSlots.header = () => renderColumnHeader(column);
      }

      if (childColumns.length > 0) {
        componentSlots.default = () =>
          childColumns.map((child, childIndex) =>
            h(ElementTableColumnBridge, {
              key: `${field || column.label || 'column'}-${childIndex}`,
              column: child,
              columnIndex: childIndex,
              tableProps: bridgeProps.tableProps,
              tableSlots: bridgeProps.tableSlots
            })
          );
      } else if (type === 'expand' || column.slot || column.cellRenderer || field) {
        componentSlots.default = (scope?: ColumnBridgeScope) =>
          renderColumnCell((scope || { row: {}, $index: 0 }) as ColumnBridgeScope);
      }

      return h(ElTableColumn, mappedColumn, componentSlots);
    };
  }
});

function collectSelection(selection: RowRecord[]) {
  emit('selection-change', Array.isArray(selection) ? selection : []);
}

function handlePageChange(params: PageChangeParams) {
  if (typeof params.pageSize === 'number') {
    emit('page-size-change', params.pageSize);
  }
  if (typeof params.currentPage === 'number') {
    emit('page-current-change', params.currentPage);
  }
}

function handlePageSizeChange(pageSize: number) {
  handlePageChange({ pageSize });
}

function handleCurrentPageChange(currentPage: number) {
  handlePageChange({ currentPage });
}

function handleSortChange(payload: Record<string, unknown>) {
  emit('sort-change', payload as VxeEventParams);
}

function handleTreeLoad(row: RowRecord, treeNode: unknown, resolve: (rows: RowRecord[]) => void) {
  const loadMethod = resolveTreeLoadMethod(props.treeConfig);
  if (!loadMethod) {
    resolve([]);
    return;
  }

  Promise.resolve(loadMethod({ row, treeNode, resolve }))
    .then((rows) => {
      resolve(Array.isArray(rows) ? rows : []);
    })
    .catch(() => {
      resolve([]);
    });
}

function unbindAdaptiveObserver() {
  resizeObserver?.disconnect();
  resizeObserver = null;
}

function bindAdaptiveObserver() {
  if (!props.adaptive || typeof ResizeObserver === 'undefined') {
    return;
  }

  const target = wrapperRef.value;
  if (!target) {
    return;
  }

  const resize = () => {
    const paginationHeight = normalizedPagination.value ? 52 : 0;
    const fallbackOffset = props.adaptiveConfig?.offsetBottom ?? 110;
    const nextHeight = target.clientHeight - paginationHeight - 1;
    adaptiveHeight.value = nextHeight > 120 ? nextHeight : target.clientHeight - fallbackOffset;
    void nextTick(() => {
      tableRef.value?.doLayout();
    });
  };

  resizeObserver = new ResizeObserver(() => {
    const timeout = props.adaptiveConfig?.timeout ?? 16;
    window.setTimeout(resize, timeout);
  });

  resizeObserver.observe(target);
  resize();
}

function setAdaptive() {
  if (!props.adaptive) {
    void nextTick(() => {
      tableRef.value?.doLayout();
    });
    return;
  }
  bindAdaptiveObserver();
}

async function clearSelection() {
  tableRef.value?.clearSelection();
  await nextTick();
}

function getTableRef() {
  const table = tableRef.value as TableCompatInstance | null;
  if (!table) {
    return null;
  }
  table.clearSelection = () => {
    tableRef.value?.clearSelection();
  };
  return table;
}

function showSkeletonNow() {
  if (showFirstLoadSkeleton.value) {
    return;
  }
  skeletonShownAt.value = Date.now();
  showFirstLoadSkeleton.value = true;
}

function hideFirstLoadSkeleton() {
  showFirstLoadSkeleton.value = false;
  skeletonShownAt.value = 0;
}

function clearSkeletonTimers() {
  if (skeletonDelayTimer) {
    clearTimeout(skeletonDelayTimer);
    skeletonDelayTimer = null;
  }
  if (skeletonHideTimer) {
    clearTimeout(skeletonHideTimer);
    skeletonHideTimer = null;
  }
}

function scheduleShowFirstLoadSkeleton() {
  if (showFirstLoadSkeleton.value || skeletonDelayTimer) {
    return;
  }
  clearTimeout(skeletonHideTimer as ReturnType<typeof setTimeout>);
  skeletonHideTimer = null;
  skeletonDelayTimer = setTimeout(() => {
    skeletonDelayTimer = null;
    if (shouldUseFirstLoadSkeleton.value) {
      showSkeletonNow();
    }
  }, props.skeletonDelayMs);
}

function scheduleHideFirstLoadSkeleton() {
  if (skeletonDelayTimer) {
    clearTimeout(skeletonDelayTimer);
    skeletonDelayTimer = null;
  }
  if (!showFirstLoadSkeleton.value) {
    return;
  }

  const elapsed = Date.now() - skeletonShownAt.value;
  const remaining = Math.max(props.skeletonMinDurationMs - elapsed, 0);
  if (remaining <= 0) {
    hideFirstLoadSkeleton();
    return;
  }

  if (skeletonHideTimer) {
    clearTimeout(skeletonHideTimer);
  }
  skeletonHideTimer = setTimeout(() => {
    skeletonHideTimer = null;
    hideFirstLoadSkeleton();
  }, remaining);
}

watch(
  () => props.columns,
  () => {
    setAdaptive();
  },
  { deep: true }
);

watch(
  () => [normalizedData.value.length, normalizedPagination.value?.total ?? 0],
  () => {
    void nextTick(() => {
      tableRef.value?.doLayout();
      setAdaptive();
    });
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
  clearSkeletonTimers();
  unbindAdaptiveObserver();
  hideFirstLoadSkeleton();
});

defineExpose({
  getTableRef,
  setAdaptive,
  clearSelection
});
</script>

<template>
  <div ref="wrapperRef" :class="wrapperClass" :style="wrapperStyle">
    <div class="ob-table__main">
      <div v-if="showFirstLoadSkeleton" class="ob-table__skeleton">
        <el-skeleton animated>
          <template #template>
            <div class="ob-table__skeleton-head">
              <el-skeleton-item
                v-for="index in skeletonCellCount"
                :key="`head-${index}`"
                variant="text"
                class="ob-table__skeleton-cell ob-table__skeleton-cell--head"
              />
            </div>

            <div class="ob-table__skeleton-body">
              <div
                v-for="rowIndex in resolvedSkeletonRows"
                :key="`row-${rowIndex}`"
                class="ob-table__skeleton-row"
              >
                <el-skeleton-item
                  v-for="cellIndex in skeletonCellCount"
                  :key="`cell-${rowIndex}-${cellIndex}`"
                  variant="text"
                  class="ob-table__skeleton-cell"
                />
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>

      <div
        v-else
        class="ob-table__table-shell"
        :class="{ 'is-empty': normalizedData.length === 0 }"
      >
        <el-table
          ref="tableRef"
          v-loading="loading"
          class="ob-table__table"
          v-bind="elementTableProps"
          @selection-change="collectSelection"
          @sort-change="handleSortChange"
        >
          <template #empty>
            <div class="ob-table__empty">
              <img class="ob-table__empty-image" :src="emptyStateImage" alt="暂无数据" />
              <p class="ob-table__empty-text">{{ resolvedEmptyText }}</p>
            </div>
          </template>

          <ElementTableColumnBridge
            v-for="(column, index) in visibleColumns"
            :key="`${String(column.prop || column.label || 'column')}-${index}`"
            :column="column"
            :column-index="index"
            :table-props="runtimeTableProps"
            :table-slots="slots"
          />
        </el-table>
      </div>
    </div>

    <div v-if="pagerProps" class="ob-table__pager">
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
.ob-table {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: var(--ob-table-bg);
}

.ob-table__main {
  display: flex;
  flex: 1;
  min-height: 0;
}

.ob-table__skeleton {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  padding: 0 var(--ob-table-skeleton-padding-inline) var(--ob-table-skeleton-padding-bottom);
  overflow: hidden;
  background: var(--ob-table-skeleton-bg);
}

.ob-table__skeleton :deep(.el-skeleton) {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--ob-table-skeleton-block-gap);
  width: 100%;
}

.ob-table__skeleton-head,
.ob-table__skeleton-row {
  display: grid;
  gap: var(--ob-table-skeleton-grid-gap);
  align-items: center;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
}

.ob-table__skeleton-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--ob-table-skeleton-row-gap);
}

.ob-table__skeleton-row {
  min-height: var(--ob-table-skeleton-row-min-height);
}

.ob-table__skeleton-cell {
  width: 100%;
  height: var(--ob-table-skeleton-cell-height);
}

.ob-table__skeleton-cell--head {
  width: var(--ob-table-skeleton-head-cell-width);
  height: var(--ob-table-skeleton-head-cell-height);
}

.ob-table__table-shell {
  width: 100%;
  min-height: 0;
  background: var(--ob-table-surface-bg);
}

.ob-table__table-shell.is-empty {
  overflow-x: hidden;
}

.ob-table__table {
  width: 100%;
  height: 100%;
  min-height: 0;
  font-size: var(--ob-table-font-size);
}

.ob-table__cell-text {
  display: inline-block;
  width: 100%;
  min-width: 0;
}

.ob-table__cell-text.is-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ob-table__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 48px 0;
}

.ob-table__empty-image {
  width: 180px;
  max-width: 100%;
  object-fit: contain;
}

.ob-table__empty-text {
  margin: 0;
  font-family:
    PingFang SC,
    sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--el-text-color-regular);
  letter-spacing: 0;
  text-align: center;
}

.ob-table__pager {
  flex-shrink: 0;
  padding-top: var(--ob-table-pager-padding-top);
  background: var(--ob-table-pager-bg);
  border-top: 1px solid var(--ob-table-pager-border-color);
}

.ob-table :deep(.el-table) {
  --el-table-border-color: var(--ob-table-border-color);
  --el-table-header-bg-color: var(--ob-table-header-bg);
  --el-table-row-hover-bg-color: var(--ob-table-row-hover-bg);
  --el-table-current-row-bg-color: var(--ob-table-row-current-bg);
  --el-fill-color-lighter: var(--ob-table-header-bg);
  color: var(--ob-table-body-color);
}

.ob-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.ob-table :deep(.el-table__header-wrapper th.el-table__cell) {
  height: var(--ob-table-row-height-default);
  padding: 0;
  background: var(--ob-table-header-bg);
  color: var(--ob-table-header-color);
  font-size: var(--ob-table-font-size);
  font-weight: var(--ob-table-header-font-weight);
  border-bottom: 1px solid var(--ob-table-border-color);
}

.ob-table :deep(.el-table__header-wrapper .cell) {
  line-height: 20px;
  font-weight: var(--ob-table-header-font-weight);
}

.ob-table :deep(.el-table__body-wrapper td.el-table__cell) {
  height: var(--ob-table-row-height-default);
  padding: 0;
  font-size: var(--ob-table-font-size);
  font-weight: var(--ob-table-body-font-weight);
  color: var(--ob-table-body-color);
  background: var(--ob-table-row-bg);
  border-bottom: 1px solid var(--ob-table-border-color);
}

.ob-table :deep(.el-table__body tr:last-child td.el-table__cell) {
  border-bottom: none;
}

.ob-table :deep(.el-table__body-wrapper .cell) {
  line-height: 20px;
  font-weight: var(--ob-table-body-font-weight);
}

.ob-table :deep(.el-table__fixed),
.ob-table :deep(.el-table__fixed-right) {
  box-shadow: none;
}

.ob-table :deep(.el-table__fixed::before),
.ob-table :deep(.el-table__fixed-right::before) {
  display: none;
}

.ob-table :deep(.el-table__fixed .el-table__fixed-header-wrapper),
.ob-table :deep(.el-table__fixed-right .el-table__fixed-header-wrapper),
.ob-table :deep(.el-table__fixed .el-table__fixed-body-wrapper),
.ob-table :deep(.el-table__fixed-right .el-table__fixed-body-wrapper) {
  background: var(--ob-table-surface-bg);
}

.ob-table :deep(.el-table__body-wrapper::-webkit-scrollbar),
.ob-table :deep(.el-scrollbar__bar.is-horizontal),
.ob-table :deep(.el-scrollbar__bar.is-vertical) {
  width: var(--ob-table-scrollbar-size);
  height: var(--ob-table-scrollbar-size);
}

.ob-table :deep(.el-scrollbar__thumb) {
  background: var(--ob-table-scrollbar-thumb-color);
  border-radius: var(--ob-table-scrollbar-radius);
}

.ob-table :deep(.el-scrollbar__thumb:hover) {
  background: var(--ob-table-scrollbar-thumb-hover-color);
}

.ob-table__pager :deep(.el-pagination) {
  position: relative;
  justify-content: flex-end;
  min-height: var(--ob-table-pager-min-height);
  padding-left: var(--ob-table-pager-content-padding-left);
}

.ob-table__pager :deep(.el-pagination__total) {
  position: absolute;
  left: var(--ob-table-pager-total-left);
  top: 50%;
  margin: 0;
  transform: translateY(-50%);
  color: var(--ob-table-pager-text-color);
}
</style>
