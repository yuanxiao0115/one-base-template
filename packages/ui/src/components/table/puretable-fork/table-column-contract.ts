import type { TableColumnCtx } from 'element-plus';
import type { VNodeChild } from 'vue';

/**
 * 直接 fork 自 pure-admin-table 的列契约，作为 ObTable 渐进改造基线。
 * Source: pure-admin-table@8f93cb2 (v3.3.0)
 */

export type PureTableColumnSortOrders = 'ascending' | 'descending' | null;
export type PureTableColumnType = 'selection' | 'index' | 'expand';
export type PureTableColumnSortable = false | true | 'custom';
export type PureTableColumnFixed = true | 'left' | 'right';
export type PureTableColumnFilterPlacement =
  | 'top-start'
  | 'top-end'
  | 'top'
  | 'bottom-start'
  | 'bottom-end'
  | 'bottom'
  | 'left-start'
  | 'left-end'
  | 'left'
  | 'right-start'
  | 'right-end'
  | 'right';

export type PureTableFilterMethod = (
  value: unknown,
  row: Record<string, unknown>,
  column: TableColumnCtx<Record<string, unknown>>
) => void;

export interface PureTableColumnScope {
  row?: Record<string, unknown>;
  column: PureTableColumnsContract;
  $index: number;
}

export interface PureTableColumnRendererScope extends PureTableColumnScope {
  index: number;
  props: Record<string, unknown>;
  attrs: Record<string, unknown>;
}

/**
 * 与 pure-admin-table 对齐的原始 TableColumn 字段。
 */
export interface PureTableColumnContract {
  label?: string;
  prop?: string | ((index: number) => string);
  type?: PureTableColumnType;
  index?: number | ((index: number) => number);
  columnKey?: string;
  width?: string | number;
  minWidth?: string | number;
  fixed?: PureTableColumnFixed;
  renderHeader?: (data: {
    column: TableColumnCtx<Record<string, unknown>>;
    $index: number;
  }) => VNodeChild;
  sortable?: PureTableColumnSortable;
  sortMethod?: (a: unknown, b: unknown) => number;
  sortBy?: string | ((row: Record<string, unknown>, index: number) => string) | string[];
  sortOrders?: Array<PureTableColumnSortOrders>;
  resizable?: boolean;
  formatter?: (
    row: Record<string, unknown>,
    column: TableColumnCtx<Record<string, unknown>>,
    cellValue: unknown,
    index: number
  ) => VNodeChild;
  showOverflowTooltip?: boolean;
  align?: 'left' | 'center' | 'right';
  headerAlign?: 'left' | 'center' | 'right';
  className?: string;
  labelClassName?: string;
  selectable?: (row: Record<string, unknown>, index: number) => boolean;
  reserveSelection?: boolean;
  filters?: Array<{ text: string; value: string }>;
  filterPlacement?: PureTableColumnFilterPlacement;
  filterClassName?: string;
  filterMultiple?: boolean;
  filterMethod?: PureTableFilterMethod;
  filteredValue?: Array<unknown>;
  tooltipFormatter?: (data: {
    row: Record<string, unknown>;
    column: Record<string, unknown>;
    cellValue: unknown;
  }) => VNodeChild;
}

/**
 * 与 pure-admin-table 对齐的扩展列字段。
 */
export interface PureTableColumnsContract extends PureTableColumnContract {
  hide?: boolean | CallableFunction;
  slot?: string;
  headerSlot?: string;
  filterIconSlot?: string;
  expandSlot?: string;
  children?: Array<PureTableColumnsContract>;
  cellRenderer?: (data: PureTableColumnRendererScope) => VNodeChild;
  headerRenderer?: (data: PureTableColumnRendererScope) => VNodeChild;
}
