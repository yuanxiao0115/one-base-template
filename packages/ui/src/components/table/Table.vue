<script setup lang="ts">
import {
  computed,
  defineComponent,
  getCurrentInstance,
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
import enLocale from 'element-plus/es/locale/lang/en';
import zhCnLocale from 'element-plus/es/locale/lang/zh-cn';
import zhTwLocale from 'element-plus/es/locale/lang/zh-tw';
import type { TableInstance } from 'element-plus';
import { ElTableColumn, ElTooltip } from 'element-plus';
import emptyStateImage from './assets/table-empty-state.webp';
import type {
  AdaptiveConfig,
  TableAlign,
  TableColumn,
  TableColumnHeaderRendererParams,
  TableColumnList,
  TableColumnRendererParams,
  TableLoadingConfig,
  TableLocaleInput,
  TableLocaleObject,
  TablePaginationAlign,
  TablePagination
} from './types';
import {
  isOperationColumn,
  normalizeTreeRows,
  queryFirstElement,
  resolveAdaptiveHeight,
  resolveCellDisplayValue,
  resolveColumnEmptyValueText,
  resolveColumnField,
  resolveColumnHidden,
  resolveColumnMinWidth,
  resolveColumnShowEmptyValue,
  resolveColumnShowOverflow,
  resolveColumnWidth,
  resolvePagerLayout,
  resolveTreeChildrenField,
  resolveTreeHasChildField,
  resolveTreeLoadMethod
} from './internal/table-helpers';

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

interface TableDomRefs {
  tableRoot: HTMLElement | null;
  tableWrapper: HTMLElement | null;
  tableHeaderRef: HTMLElement | null;
  tableBodyRef: HTMLElement | null;
}

interface ColumnBridgeScope {
  row: RowRecord;
  column?: Record<string, unknown>;
  $index: number;
  store?: Record<string, unknown>;
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
  locale: 'zhCn'
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
let adaptiveWindowResizeHandler: (() => void) | null = null;
let adaptiveResizeTimer: ReturnType<typeof setTimeout> | null = null;
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

const wrapperClass = computed(() => ['ob-table', attrs.class]);
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

const passthroughAttrs = computed(() => {
  const blockedKeys = new Set([
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
    'locale'
  ]);

  return Object.fromEntries(Object.entries(attrs).filter(([key]) => !blockedKeys.has(key)));
});

const attrsRecord = computed(() => attrs as Record<string, unknown>);
const componentInstance = getCurrentInstance();
const fallbackTableKey = `ob-table-${componentInstance?.uid ?? Math.random().toString(36).slice(2)}`;
const resolvedTableKey = computed(() => props.tableKey ?? fallbackTableKey);
const tableRegistryKey = computed(() => String(resolvedTableKey.value));

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
  const showEmptyValue = resolveColumnShowEmptyValue(column, props.showEmptyValue);
  const emptyValueText = resolveColumnEmptyValueText(column, props.emptyValueText);
  const displayValue = resolveCellDisplayValue(value, showEmptyValue, emptyValueText);
  const showOverflowTooltip = resolveColumnShowOverflow(column, props.showOverflowTooltip);
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
    const params: TableColumnHeaderRendererParams = {
      column,
      props: props as Record<string, unknown>,
      attrs: attrsRecord.value
    };
    return column.headerRenderer(params);
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
    function createBridgeSlotPayload(
      scope: ColumnBridgeScope | Record<string, unknown>,
      column: TableColumn
    ) {
      const scopeRecord = scope as Record<string, unknown>;
      return {
        ...scopeRecord,
        index: Number(scopeRecord.$index ?? 0),
        size: bridgeProps.tableProps.size,
        props: props as Record<string, unknown>,
        attrs: attrsRecord.value,
        column: scopeRecord.column ?? column
      };
    }

    function renderColumnCell(scope: ColumnBridgeScope) {
      const column = bridgeProps.column;
      const type = resolveColumnType(column.type);
      const row = (scope.row || {}) as RowRecord;
      const rowIndex = Number(scope.$index ?? 0);
      const expandSlot = column.expandSlot;
      const cellSlot = column.slot;

      if (type === 'expand' && expandSlot && bridgeProps.tableSlots[expandSlot]) {
        return bridgeProps.tableSlots[expandSlot]?.(
          createBridgeSlotPayload(scope, column)
        ) as unknown as VNodeChild;
      }

      if (cellSlot && bridgeProps.tableSlots[cellSlot]) {
        return bridgeProps.tableSlots[cellSlot]?.(
          createBridgeSlotPayload(scope, column)
        ) as unknown as VNodeChild;
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
      mappedColumn.width = resolveColumnWidth(column);
      mappedColumn.minWidth = resolveColumnMinWidth(column);
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
      mappedColumn.filterIconSlot = undefined;
      mappedColumn.expandSlot = undefined;
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

      const filterIconSlot = column.filterIconSlot;
      if (filterIconSlot && bridgeProps.tableSlots[filterIconSlot]) {
        componentSlots['filter-icon'] = (scope?: ColumnBridgeScope) =>
          bridgeProps.tableSlots[filterIconSlot]?.(
            createBridgeSlotPayload(scope || {}, column)
          ) as unknown as VNodeChild;
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

  let resolved = false;
  const safeResolve = (rows: RowRecord[]) => {
    if (resolved) {
      return;
    }
    resolved = true;
    resolve(Array.isArray(rows) ? rows : []);
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
      registeredTableKey.value = null;
    }
    return;
  }

  activeTable.tableKey = resolvedTableKey.value;
  tableRefRegistry.set(currentKey, activeTable);
  registeredTableKey.value = currentKey;
}

function clearAdaptiveResizeTimer() {
  if (!adaptiveResizeTimer) {
    return;
  }
  clearTimeout(adaptiveResizeTimer);
  adaptiveResizeTimer = null;
}

function unbindAdaptiveObserver() {
  resizeObserver?.disconnect();
  resizeObserver = null;

  if (adaptiveWindowResizeHandler) {
    window.removeEventListener('resize', adaptiveWindowResizeHandler);
    adaptiveWindowResizeHandler = null;
  }

  clearAdaptiveResizeTimer();
}

function resolveTableRootElement(): HTMLElement | null {
  const table = tableRef.value as (TableCompatInstance & { $el?: unknown }) | null;
  if (table?.$el instanceof HTMLElement) {
    return table.$el;
  }
  return queryFirstElement(wrapperRef.value, ['.ob-table__table', '.el-table']);
}

function getTableDoms(): TableDomRefs {
  const tableRoot = resolveTableRootElement();
  if (!tableRoot) {
    return {
      tableRoot: null,
      tableWrapper: null,
      tableHeaderRef: null,
      tableBodyRef: null
    };
  }

  const tableWrapper = queryFirstElement(tableRoot, [
    '.el-table__inner-wrapper',
    '.el-table__body-wrapper',
    '.el-table__main-wrapper'
  ]);
  const tableHeaderRef = queryFirstElement(tableRoot, [
    '.el-table__header-wrapper',
    '.el-table__fixed-header-wrapper'
  ]);
  const tableBodyRef = queryFirstElement(tableRoot, [
    '.el-table__body-wrapper',
    '.el-table__fixed-body-wrapper',
    '.el-scrollbar__wrap'
  ]);

  return {
    tableRoot,
    tableWrapper,
    tableHeaderRef,
    tableBodyRef
  };
}

function applyRowHoverBgColor() {
  const { tableWrapper } = getTableDoms();
  if (!tableWrapper) {
    return;
  }
  const color = props.rowHoverBgColor?.trim();
  if (!color) {
    tableWrapper.style.removeProperty('--el-table-row-hover-bg-color');
    return;
  }
  tableWrapper.style.setProperty('--el-table-row-hover-bg-color', color, 'important');
}

async function setHeaderSticky(zIndex = props.adaptiveConfig?.zIndex ?? 3) {
  await nextTick();
  const { tableRoot, tableHeaderRef } = getTableDoms();
  const stickyHeaders = new Set<HTMLElement>();
  if (tableHeaderRef) {
    stickyHeaders.add(tableHeaderRef);
  }
  tableRoot
    ?.querySelectorAll('.el-table__header-wrapper, .el-table__fixed-header-wrapper')
    .forEach((headerNode) => {
      if (headerNode instanceof HTMLElement) {
        stickyHeaders.add(headerNode);
      }
    });

  if (stickyHeaders.size === 0) {
    return;
  }

  stickyHeaders.forEach((headerRef) => {
    headerRef.style.position = 'sticky';
    headerRef.style.top = '0';
    headerRef.style.zIndex = String(zIndex);
  });
}

function updateAdaptiveHeight() {
  if (typeof window === 'undefined') {
    adaptiveHeight.value = undefined;
    return;
  }

  const { tableWrapper } = getTableDoms();
  const heightAnchor = tableWrapper ?? wrapperRef.value;
  if (!heightAnchor) {
    adaptiveHeight.value = undefined;
    return;
  }

  const paginationHeight = normalizedPagination.value ? 52 : 0;
  const offsetBottom = props.adaptiveConfig?.offsetBottom ?? 110;
  adaptiveHeight.value = resolveAdaptiveHeight({
    viewportHeight: window.innerHeight,
    elementTop: heightAnchor.getBoundingClientRect().top,
    offsetBottom,
    paginationHeight,
    containerHeight: wrapperRef.value?.clientHeight,
    minHeight: 120
  });

  void nextTick(() => {
    tableRef.value?.doLayout();
  });
}

function scheduleAdaptiveResize() {
  clearAdaptiveResizeTimer();
  const timeout = props.adaptiveConfig?.timeout ?? 16;
  adaptiveResizeTimer = setTimeout(() => {
    adaptiveResizeTimer = null;
    updateAdaptiveHeight();
  }, timeout);
}

function bindAdaptiveObserver() {
  if (!props.adaptive) {
    return;
  }
  unbindAdaptiveObserver();

  const target = wrapperRef.value;
  if (!target) {
    return;
  }

  adaptiveWindowResizeHandler = () => {
    scheduleAdaptiveResize();
  };
  window.addEventListener('resize', adaptiveWindowResizeHandler);

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      scheduleAdaptiveResize();
    });
    resizeObserver.observe(target);
  }

  scheduleAdaptiveResize();

  if (props.adaptiveConfig?.fixHeader !== false) {
    void setHeaderSticky(props.adaptiveConfig?.zIndex ?? 3);
  }
}

function setAdaptive() {
  if (!props.adaptive) {
    unbindAdaptiveObserver();
    void nextTick(() => {
      tableRef.value?.doLayout();
    });
    return;
  }
  bindAdaptiveObserver();
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

watch(tableRef, () => {
  syncTableRegistry();
});

watch(
  tableRegistryKey,
  (nextKey, previousKey) => {
    if (previousKey && previousKey !== nextKey) {
      tableRefRegistry.delete(previousKey);
      if (registeredTableKey.value === previousKey) {
        registeredTableKey.value = null;
      }
    }
    syncTableRegistry();
  },
  { immediate: true }
);

watch(
  () => props.columns,
  () => {
    setAdaptive();
  },
  { deep: true }
);

watch(
  () => props.adaptive,
  () => {
    setAdaptive();
  }
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

watch(
  () => props.rowHoverBgColor,
  () => {
    void nextTick(() => {
      applyRowHoverBgColor();
    });
  },
  { immediate: true }
);

onMounted(() => {
  syncTableRegistry();
  setAdaptive();
  void nextTick(() => {
    applyRowHoverBgColor();
  });
});

onBeforeUnmount(() => {
  clearSkeletonTimers();
  unbindAdaptiveObserver();
  if (registeredTableKey.value) {
    tableRefRegistry.delete(registeredTableKey.value);
    registeredTableKey.value = null;
  }
  hideFirstLoadSkeleton();
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
                <img class="ob-table__empty-image" :src="emptyStateImage" alt="暂无数据" />
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
            :table-props="runtimeTableProps"
            :table-slots="slots"
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
