<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  useSlots,
  watch,
  type CSSProperties
} from 'vue';
import enLocale from 'element-plus/es/locale/lang/en';
import zhCnLocale from 'element-plus/es/locale/lang/zh-cn';
import zhTwLocale from 'element-plus/es/locale/lang/zh-tw';
import type { TableInstance } from 'element-plus';
import emptyStateImage from './assets/table-empty-state.webp';
import type {
  AdaptiveConfig,
  TableAlign,
  TableColumn,
  TableColumnList,
  TableLoadingConfig,
  TableLocaleInput,
  TableLocaleObject,
  TablePaginationAlign,
  TablePagination,
  TableRowDragConfig,
  TableRowDragSortPayload
} from './types';
import {
  normalizeTreeRows,
  resolveColumnHidden,
  resolvePagerLayout,
  resolveTreeChildrenField,
  resolveTreeHasChildField,
  resolveTreeLoadMethod
} from './internal/table-helpers';
import {
  createElementTableColumnBridge,
  type TableColumnBridgeRuntimeProps
} from './internal/use-table-column-bridge';
import { useTableSkeleton } from './internal/use-table-skeleton';
import { useTableRowDragSort } from './internal/use-table-row-drag-sort';
import { useTableLayout } from './internal/use-table-layout';

defineOptions({
  name: 'Table',
  inheritAttrs: false
});

type RowRecord = Record<string, unknown>;

type VxeEventParams = Record<string, unknown>;

type ElementTableSize = '' | 'default' | 'small' | 'large' | undefined;

type TableCompatInstance = TableInstance & {
  clearSelection?: () => void;
  tableKey?: string | number;
};

const tableRefRegistry = new Map<string, TableCompatInstance>();
const duplicatedTableKeyWarnedSet = new Set<string>();

interface PageChangeParams {
  pageSize?: number;
  currentPage?: number;
}

interface ObElementTableProps {
  data?: RowRecord[];
  columns?: TableColumnList;
  loading?: boolean;
  loadingConfig?: TableLoadingConfig;
  enableFirstLoadSkeleton?: boolean;
  skeletonRows?: number;
  skeletonDelayMs?: number;
  skeletonMinDurationMs?: number;
  pagination?: TablePagination | false | null;
  paginationSmall?: boolean;
  rowKey?: string;
  tableKey?: string | number;
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
  rowHoverBgColor?: string;
  locale?: TableLocaleInput;
  rowDrag?: boolean;
  rowDragConfig?: TableRowDragConfig;
  tooltipRenderThreshold?: number;
}

interface ElementPagerProps {
  total: number;
  currentPage?: number;
  pageSize?: number;
  pageSizes: number[];
  background: boolean;
  layout: string;
  size?: 'default' | 'small' | 'large';
  align: TablePaginationAlign;
  className?: string;
  style?: CSSProperties;
  defaultPageSize?: number;
  defaultCurrentPage?: number;
  pageCount?: number;
  pagerCount?: number;
  popperClass?: string;
  prevText?: string;
  nextText?: string;
  disabled?: boolean;
  hideOnSinglePage?: boolean;
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
  headerRowStyle?: TableStyleValue;
  headerCellStyle?: TableStyleValue;
  cellStyle?: TableStyleValue;
  [key: string]: unknown;
}

type TableStyleFnParams = Record<string, unknown>;
type TableStyleFn = (params: TableStyleFnParams) => CSSProperties;
type TableStyleValue = CSSProperties | TableStyleFn;

const props = withDefaults(defineProps<ObElementTableProps>(), {
  data: () => [],
  columns: () => [],
  loading: false,
  loadingConfig: () => ({}),
  enableFirstLoadSkeleton: true,
  skeletonRows: 8,
  skeletonDelayMs: 120,
  skeletonMinDurationMs: 200,
  pagination: null,
  paginationSmall: undefined,
  rowKey: 'id',
  tableLayout: 'fixed',
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
  reserveSelection: false,
  rowHoverBgColor: '',
  locale: 'zhCn',
  rowDrag: false,
  rowDragConfig: () => ({}),
  tooltipRenderThreshold: 0
});

const emit = defineEmits<{
  (e: 'selection-change', selection: RowRecord[]): void;
  (e: 'page-current-change' | 'page-size-change', page: number): void;
  (e: 'sort-change', payload: VxeEventParams): void;
  (e: 'row-drag-sort', payload: TableRowDragSortPayload): void;
}>();

const attrs = useAttrs();
const slots = useSlots();

const wrapperRef = ref<HTMLDivElement>();
const tableRef = ref<TableInstance | null>(null);
const registeredTableKey = ref<string | null>(null);

function resolveTableSize(attrsRecord: Record<string, unknown>): ElementTableSize {
  const size = attrsRecord.size;
  if (size === '' || size === 'default' || size === 'small' || size === 'large') {
    return size;
  }
  return undefined;
}

function resolveLocale(locale: TableLocaleInput): TableLocaleObject {
  if (locale === 'en') {
    return enLocale as unknown as TableLocaleObject;
  }
  if (locale === 'zhTw') {
    return zhTwLocale as unknown as TableLocaleObject;
  }
  if (locale === 'zhCn') {
    return zhCnLocale as unknown as TableLocaleObject;
  }
  if (locale && typeof locale === 'object') {
    return locale;
  }
  return zhCnLocale as unknown as TableLocaleObject;
}

const normalizedData = computed<RowRecord[]>(() => (Array.isArray(props.data) ? props.data : []));
const normalizedColumns = computed<TableColumnList>(() =>
  Array.isArray(props.columns) ? props.columns : []
);

const wrapperClass = computed(() => [
  'ob-table',
  { 'is-row-drag': rowDragEnabled.value },
  attrs.class
]);
const wrapperStyle = computed<CSSProperties>(() => {
  const style = (attrs.style || {}) as CSSProperties;
  const hoverBgColor =
    typeof props.rowHoverBgColor === 'string' ? props.rowHoverBgColor.trim() : '';
  return {
    ...style,
    '--ob-table-layout': props.tableLayout,
    ...(hoverBgColor ? { '--ob-table-row-hover-bg': hoverBgColor } : {})
  } as CSSProperties;
});

const blockedAttrKeys = new Set([
  'class',
  'style',
  'data',
  'columns',
  'loading',
  'loadingConfig',
  'enableFirstLoadSkeleton',
  'skeletonRows',
  'skeletonDelayMs',
  'skeletonMinDurationMs',
  'pagination',
  'paginationSmall',
  'rowKey',
  'tableKey',
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
  'reserveSelection',
  'rowHoverBgColor',
  'locale',
  'rowDrag',
  'rowDragConfig',
  'tooltipRenderThreshold'
]);

const passthroughAttrs = computed(() => {
  return Object.fromEntries(Object.entries(attrs).filter(([key]) => !blockedAttrKeys.has(key)));
});

const attrsRecord = computed(() => attrs as Record<string, unknown>);
const componentInstance = getCurrentInstance();
const fallbackTableKey = `ob-table-${componentInstance?.uid ?? Math.random().toString(36).slice(2)}`;
const resolvedTableKey = computed(() => props.tableKey ?? fallbackTableKey);
const tableRegistryKey = computed(() => String(resolvedTableKey.value));

const runtimeTableProps = computed<TableColumnBridgeRuntimeProps>(() => ({
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

function resolveColumnWatchToken(value: unknown): string {
  if (value == null) {
    return '';
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (typeof value === 'function') {
    return `fn:${value.name || 'anonymous'}`;
  }
  if (Array.isArray(value)) {
    return value.map((item) => resolveColumnWatchToken(item)).join(',');
  }
  if (typeof value === 'object') {
    return `obj:${Object.keys(value as Record<string, unknown>)
      .sort()
      .join(',')}`;
  }
  return '';
}

function resolveColumnLayoutSignature(column: TableColumn, index: number): string {
  const columnRecord = column as Record<string, unknown>;
  const signatureParts = [
    column.type,
    resolveColumnWatchToken(column.prop),
    column.label,
    resolveColumnWatchToken(column.width),
    resolveColumnWatchToken(column.minWidth),
    resolveColumnWatchToken(columnRecord.minwidth),
    resolveColumnWatchToken(columnRecord['min-width']),
    resolveColumnWatchToken(column.fixed),
    resolveColumnWatchToken(column.sortable),
    resolveColumnWatchToken(column.align),
    resolveColumnWatchToken(column.headerAlign),
    resolveColumnWatchToken(column.slot),
    resolveColumnWatchToken(column.headerSlot),
    resolveColumnWatchToken(column.filterIconSlot),
    resolveColumnWatchToken(column.expandSlot),
    resolveColumnWatchToken(column.hide),
    resolveColumnWatchToken(column.ellipsis),
    resolveColumnWatchToken(column.showOverflowTooltip),
    resolveColumnWatchToken(column.showEmptyValue),
    resolveColumnWatchToken(column.emptyValueText),
    resolveColumnWatchToken(column.treeNode),
    resolveColumnWatchToken(column.className),
    resolveColumnWatchToken(column.reserveSelection),
    resolveColumnWatchToken(column.cellRenderer),
    resolveColumnWatchToken(column.headerRenderer),
    resolveColumnWatchToken(column.formatter)
  ];
  if (!Array.isArray(column.children) || column.children.length === 0) {
    return `${index}:${signatureParts.join('|')}`;
  }
  return `${index}:${signatureParts.join('|')}:[${column.children
    .map((child, childIndex) => resolveColumnLayoutSignature(child, childIndex))
    .join(';')}]`;
}

const columnsLayoutSignature = computed(() =>
  normalizedColumns.value
    .map((column, index) => resolveColumnLayoutSignature(column, index))
    .join('||')
);

const normalizedPagination = computed<TablePagination | null>(() => {
  if (!props.pagination) {
    return null;
  }
  return props.pagination;
});

function resolvePaginationAlign(align?: string): TablePaginationAlign {
  if (align === 'left' || align === 'center' || align === 'right') {
    return align;
  }
  return 'right';
}

function resolvePaginationSize(pagination: TablePagination): ElementPagerProps['size'] {
  if (props.paginationSmall === true) {
    return 'small';
  }
  if (props.paginationSmall === false) {
    return undefined;
  }
  if (pagination.size === 'default' || pagination.size === 'small' || pagination.size === 'large') {
    return pagination.size;
  }
  if (pagination.small === true) {
    return 'small';
  }
  const size = attrs.size;
  if (size === 'small' || size === 'default' || size === 'large') {
    return size;
  }
  return undefined;
}

const pagerProps = computed<ElementPagerProps | null>(() => {
  if (!normalizedPagination.value) {
    return null;
  }

  const rawCurrentPage = Number(normalizedPagination.value.currentPage);
  const rawPageSize = Number(normalizedPagination.value.pageSize);
  const hasControlledCurrentPage = Number.isFinite(rawCurrentPage) && rawCurrentPage > 0;
  const hasControlledPageSize = Number.isFinite(rawPageSize) && rawPageSize > 0;
  const currentPage = hasControlledCurrentPage ? rawCurrentPage : undefined;
  const pageSize = hasControlledPageSize ? rawPageSize : undefined;
  const total = Number(normalizedPagination.value.total ?? 0);
  const align = resolvePaginationAlign(normalizedPagination.value.align);
  const customStyle =
    normalizedPagination.value.style && typeof normalizedPagination.value.style === 'object'
      ? normalizedPagination.value.style
      : undefined;
  const mergedStyle: CSSProperties = {
    ...customStyle,
    ...(align !== 'right' && !customStyle?.justifyContent
      ? {
          justifyContent:
            align === 'left' ? 'flex-start' : align === 'center' ? 'center' : 'flex-end'
        }
      : {})
  };

  return {
    total,
    currentPage,
    pageSize,
    pageSizes:
      Array.isArray(normalizedPagination.value.pageSizes) &&
      normalizedPagination.value.pageSizes.length > 0
        ? normalizedPagination.value.pageSizes
        : [10, 20, 50, 100],
    background: normalizedPagination.value.background ?? true,
    layout: resolvePagerLayout(normalizedPagination.value.layout),
    size: resolvePaginationSize(normalizedPagination.value),
    align,
    className:
      typeof normalizedPagination.value.class === 'string'
        ? normalizedPagination.value.class
        : undefined,
    style: mergedStyle,
    defaultPageSize: hasControlledPageSize ? undefined : normalizedPagination.value.defaultPageSize,
    defaultCurrentPage: hasControlledCurrentPage
      ? undefined
      : normalizedPagination.value.defaultCurrentPage,
    pageCount: total > 0 ? undefined : normalizedPagination.value.pageCount,
    pagerCount: normalizedPagination.value.pagerCount,
    popperClass: normalizedPagination.value.popperClass,
    prevText: normalizedPagination.value.prevText,
    nextText: normalizedPagination.value.nextText,
    disabled: normalizedPagination.value.disabled,
    hideOnSinglePage: normalizedPagination.value.hideOnSinglePage
  };
});

const pagerWrapperClass = computed(() =>
  pagerProps.value ? ['ob-table__pager', `is-align-${pagerProps.value.align}`] : ['ob-table__pager']
);

const resolvedLocale = computed(() => resolveLocale(props.locale) as unknown as typeof zhCnLocale);

const loadingDirectiveProps = computed<Record<string, string | undefined>>(() => ({
  'element-loading-text': props.loadingConfig?.text,
  'element-loading-spinner': props.loadingConfig?.spinner,
  'element-loading-svg': props.loadingConfig?.svg,
  'element-loading-svg-view-box': props.loadingConfig?.viewBox,
  'element-loading-background': props.loadingConfig?.background
}));

const resolvedEmptyText = computed(() => {
  const content = props.emptyText?.trim();
  return content && content.length > 0 ? content : '暂未生产任何数据';
});
const liveStatusText = computed(() => {
  if (props.loading) {
    return '表格加载中';
  }
  if (normalizedData.value.length === 0) {
    return resolvedEmptyText.value;
  }
  return '';
});
const { showFirstLoadSkeleton, resolvedSkeletonRows, skeletonCellCount } = useTableSkeleton({
  enabled: computed(() => props.enableFirstLoadSkeleton),
  loading: computed(() => props.loading),
  dataLength: computed(() => normalizedData.value.length),
  columns: normalizedColumns,
  skeletonRows: computed(() => props.skeletonRows),
  skeletonDelayMs: computed(() => props.skeletonDelayMs),
  skeletonMinDurationMs: computed(() => props.skeletonMinDurationMs)
});
const {
  adaptiveHeight,
  getTableDoms,
  resolveTableBodyTbody,
  applyRowHoverBgColor,
  setHeaderSticky,
  scheduleAdaptiveResize,
  setAdaptive,
  disposeLayout
} = useTableLayout({
  wrapperRef,
  tableRef,
  adaptiveEnabled: computed(() => props.adaptive),
  adaptiveConfig: computed(() => props.adaptiveConfig),
  hasPagination: computed(() => Boolean(normalizedPagination.value))
});

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
const defaultExpandAll = computed(() => props.treeConfig?.defaultExpandAll === true);
const indent = computed(() => Number(props.treeConfig?.indent ?? 16));

const normalizedTreeData = computed<RowRecord[]>(() => {
  if (!props.treeConfig) {
    return normalizedData.value;
  }

  return normalizeTreeRows(normalizedData.value, {
    childrenField: childrenField.value,
    hasChildField: hasChildField.value,
    lazy: isLazyTree.value
  });
});

const rowDragEnabled = computed(
  () =>
    props.rowDrag === true &&
    !props.loading &&
    !props.treeConfig &&
    normalizedTreeData.value.length > 0
);

const enableRichCellTooltip = computed(() => {
  const threshold = Number(props.tooltipRenderThreshold ?? 0);
  if (!Number.isFinite(threshold) || threshold <= 0) {
    return false;
  }
  return normalizedTreeData.value.length <= threshold;
});

const defaultHeaderRowStyle = computed<CSSProperties>(() => ({
  height: `${varAsNumber('--ob-table-row-height-default', 56)}px`
}));

const defaultHeaderCellStyle = computed<CSSProperties>(() => ({
  height: `${varAsNumber('--ob-table-row-height-default', 56)}px`,
  fontSize: `${varAsNumber('--ob-table-font-size', 14)}px`,
  fontWeight: varAsNumber('--ob-table-header-font-weight', 600),
  color: 'var(--ob-table-header-color)',
  background: 'var(--ob-table-header-bg)'
}));

const defaultBodyCellStyle = computed<CSSProperties>(() => ({
  fontSize: `${varAsNumber('--ob-table-font-size', 14)}px`,
  fontWeight: varAsNumber('--ob-table-body-font-weight', 500),
  color: 'var(--ob-table-body-color)'
}));

const resolvedHeaderRowStyle = computed<TableStyleValue>(() =>
  resolveTableStyleValue(attrsRecord.value.headerRowStyle, defaultHeaderRowStyle.value)
);

const resolvedHeaderCellStyle = computed<TableStyleValue>(() =>
  resolveTableStyleValue(attrsRecord.value.headerCellStyle, defaultHeaderCellStyle.value)
);

const resolvedCellStyle = computed<TableStyleValue>(() =>
  resolveTableStyleValue(attrsRecord.value.cellStyle, defaultBodyCellStyle.value)
);

const elementTableProps = computed<ElementTableBindingProps>(() => ({
  ...loadingDirectiveProps.value,
  ...passthroughAttrs.value,
  data: normalizedTreeData.value,
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
  emptyText: resolvedEmptyText.value,
  headerRowStyle: resolvedHeaderRowStyle.value,
  headerCellStyle: resolvedHeaderCellStyle.value,
  cellStyle: resolvedCellStyle.value
}));

function resolveTableStyleValue(styleValue: unknown, defaultStyle: CSSProperties): TableStyleValue {
  if (typeof styleValue === 'function') {
    const customStyle = styleValue as TableStyleFn;
    return (params: TableStyleFnParams) => ({
      ...defaultStyle,
      ...customStyle(params)
    });
  }

  if (styleValue && typeof styleValue === 'object' && !Array.isArray(styleValue)) {
    return {
      ...defaultStyle,
      ...(styleValue as CSSProperties)
    };
  }

  return defaultStyle;
}

function varAsNumber(token: string, fallback: number): number {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const rootStyle = window.getComputedStyle(document.documentElement);
  const raw = rootStyle.getPropertyValue(token).trim();
  const resolved = Number(raw.replace(/px$/, ''));
  return Number.isFinite(resolved) && resolved > 0 ? resolved : fallback;
}

const ElementTableColumnBridge = createElementTableColumnBridge({
  getRuntimeProps: () => runtimeTableProps.value,
  getComponentProps: () => props as Record<string, unknown>,
  getComponentAttrs: () => attrsRecord.value,
  getTableSlots: () => slots,
  enableRichCellTooltip: () => enableRichCellTooltip.value
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

  let resolved = false;
  const safeResolve = (rows: RowRecord[]) => {
    if (resolved) {
      return;
    }
    resolved = true;
    const normalizedRows = normalizeTreeRows(Array.isArray(rows) ? rows : [], {
      childrenField: childrenField.value,
      hasChildField: hasChildField.value,
      lazy: isLazyTree.value
    });
    resolve(normalizedRows);
  };

  Promise.resolve(loadMethod(row, treeNode, safeResolve))
    .then((rows) => {
      if (Array.isArray(rows)) {
        safeResolve(rows);
      }
    })
    .catch(() => {
      safeResolve([]);
    });
}

function syncTableRegistry() {
  const activeTable = tableRef.value as TableCompatInstance | null;
  const currentKey = tableRegistryKey.value;

  if (registeredTableKey.value && registeredTableKey.value !== currentKey) {
    tableRefRegistry.delete(registeredTableKey.value);
    registeredTableKey.value = null;
  }

  if (!activeTable) {
    if (registeredTableKey.value) {
      tableRefRegistry.delete(registeredTableKey.value);
      duplicatedTableKeyWarnedSet.delete(registeredTableKey.value);
      registeredTableKey.value = null;
    }
    return;
  }

  const existingTable = tableRefRegistry.get(currentKey);
  if (
    existingTable &&
    existingTable !== activeTable &&
    !duplicatedTableKeyWarnedSet.has(currentKey)
  ) {
    duplicatedTableKeyWarnedSet.add(currentKey);
    console.warn(
      `[ObTable] 检测到重复 tableKey: "${currentKey}"，请确保同页多表使用唯一 tableKey。`
    );
  }

  activeTable.tableKey = resolvedTableKey.value;
  tableRefRegistry.set(currentKey, activeTable);
  registeredTableKey.value = currentKey;
}

const { initSortable: initRowDragSortable } = useTableRowDragSort({
  enabled: rowDragEnabled,
  data: normalizedTreeData,
  config: computed(() => props.rowDragConfig),
  resolveTbody: resolveTableBodyTbody,
  onSortEnd: (payload) => {
    emit('row-drag-sort', payload);
  }
});

let rowDragInitScheduled = false;
let tableLayoutUpdateScheduled = false;
let layoutNeedsAdaptiveResize = false;
let layoutNeedsRowDragInit = false;

function scheduleRowDragInit() {
  if (rowDragInitScheduled) {
    return;
  }
  rowDragInitScheduled = true;
  void Promise.resolve().then(() => {
    rowDragInitScheduled = false;
    void initRowDragSortable();
  });
}

function scheduleTableLayoutUpdate(options?: { adaptive?: boolean; rowDrag?: boolean }) {
  if (options?.adaptive) {
    layoutNeedsAdaptiveResize = true;
  }
  if (options?.rowDrag) {
    layoutNeedsRowDragInit = true;
  }

  if (tableLayoutUpdateScheduled) {
    return;
  }
  tableLayoutUpdateScheduled = true;
  void nextTick(() => {
    tableLayoutUpdateScheduled = false;
    tableRef.value?.doLayout();

    if (layoutNeedsAdaptiveResize && props.adaptive) {
      scheduleAdaptiveResize();
    }
    if (layoutNeedsRowDragInit) {
      scheduleRowDragInit();
    }

    layoutNeedsAdaptiveResize = false;
    layoutNeedsRowDragInit = false;
  });
}

async function clearSelection() {
  getTableRef()?.clearSelection?.();
  await nextTick();
}

function getTableRef() {
  const table =
    tableRefRegistry.get(tableRegistryKey.value) ?? (tableRef.value as TableCompatInstance | null);
  if (!table) {
    return null;
  }
  table.tableKey = resolvedTableKey.value;
  return table;
}

watch(tableRef, () => {
  syncTableRegistry();
  scheduleRowDragInit();
});

watch(
  tableRegistryKey,
  (nextKey, previousKey) => {
    if (previousKey && previousKey !== nextKey) {
      tableRefRegistry.delete(previousKey);
      duplicatedTableKeyWarnedSet.delete(previousKey);
      if (registeredTableKey.value === previousKey) {
        registeredTableKey.value = null;
      }
    }
    syncTableRegistry();
  },
  { immediate: true }
);

watch(
  columnsLayoutSignature,
  () => {
    scheduleTableLayoutUpdate({ adaptive: true, rowDrag: true });
  },
  { flush: 'post' }
);

watch(
  () => props.adaptive,
  () => {
    setAdaptive();
  }
);

watch(
  () => props.adaptiveConfig,
  () => {
    if (!props.adaptive) {
      return;
    }
    scheduleAdaptiveResize();
    void setHeaderSticky(
      props.adaptiveConfig?.zIndex ?? 3,
      props.adaptiveConfig?.fixHeader !== false
    );
  },
  { deep: true }
);

watch(
  () => [normalizedData.value.length, normalizedPagination.value?.total ?? 0],
  () => {
    scheduleTableLayoutUpdate({ adaptive: true });
  },
  { flush: 'post' }
);

watch(
  () => props.rowHoverBgColor,
  (color) => {
    void nextTick(() => {
      applyRowHoverBgColor(color);
    });
  },
  { immediate: true }
);

onMounted(() => {
  syncTableRegistry();
  setAdaptive();
  scheduleRowDragInit();
  void nextTick(() => {
    applyRowHoverBgColor(props.rowHoverBgColor);
  });
});

onBeforeUnmount(() => {
  rowDragInitScheduled = false;
  tableLayoutUpdateScheduled = false;
  layoutNeedsAdaptiveResize = false;
  layoutNeedsRowDragInit = false;
  disposeLayout();
  if (registeredTableKey.value) {
    tableRefRegistry.delete(registeredTableKey.value);
    duplicatedTableKeyWarnedSet.delete(registeredTableKey.value);
    registeredTableKey.value = null;
  }
});

defineExpose({
  getTableRef,
  getTableDoms,
  setAdaptive,
  setHeaderSticky,
  clearSelection
});
</script>

<template>
  <div
    ref="wrapperRef"
    :class="wrapperClass"
    :style="wrapperStyle"
    role="region"
    :aria-busy="loading ? 'true' : 'false'"
  >
    <span class="ob-table__sr-status" role="status" aria-live="polite">
      {{ liveStatusText }}
    </span>
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
          :key="resolvedTableKey"
          v-loading="loading"
          class="ob-table__table"
          v-bind="elementTableProps"
          @selection-change="collectSelection"
          @sort-change="handleSortChange"
        >
          <template #empty>
            <slot name="empty">
              <div class="ob-table__empty">
                <img
                  class="ob-table__empty-image"
                  :src="emptyStateImage"
                  alt=""
                  aria-hidden="true"
                />
                <p class="ob-table__empty-text">{{ resolvedEmptyText }}</p>
              </div>
            </slot>
          </template>

          <template #append>
            <slot name="append" />
          </template>

          <ElementTableColumnBridge
            v-for="(column, index) in visibleColumns"
            :key="`${String(column.prop || column.label || 'column')}-${index}`"
            :column="column"
            :column-index="index"
          />
        </el-table>
      </div>
    </div>

    <div v-if="pagerProps" :class="pagerWrapperClass">
      <el-config-provider :locale="resolvedLocale">
        <el-pagination
          :class="pagerProps.className"
          :style="pagerProps.style"
          :total="pagerProps.total"
          :current-page="pagerProps.currentPage"
          :page-size="pagerProps.pageSize"
          :default-page-size="pagerProps.defaultPageSize"
          :default-current-page="pagerProps.defaultCurrentPage"
          :page-sizes="pagerProps.pageSizes"
          :page-count="pagerProps.pageCount"
          :pager-count="pagerProps.pagerCount"
          :popper-class="pagerProps.popperClass"
          :prev-text="pagerProps.prevText"
          :next-text="pagerProps.nextText"
          :disabled="pagerProps.disabled"
          :background="pagerProps.background"
          :layout="pagerProps.layout"
          :size="pagerProps.size"
          :hide-on-single-page="pagerProps.hideOnSinglePage ?? false"
          @current-change="handleCurrentPageChange"
          @size-change="handlePageSizeChange"
        />
      </el-config-provider>
    </div>
  </div>
</template>
<style scoped src="./Table.css"></style>
