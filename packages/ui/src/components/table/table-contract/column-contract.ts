import type { TableColumnCtx } from 'element-plus';
import type { VNodeChild } from 'vue';

/**
 * 直接 fork 自 pure-admin-table 的列契约，作为 ObTable 渐进改造基线。
 * Source: pure-admin-table@8f93cb2 (v3.3.0)
 */

export type ObTableColumnSortOrders = 'ascending' | 'descending' | null;
export type ObTableColumnType = 'selection' | 'index' | 'expand';
export type ObTableColumnSortable = false | true | 'custom';
export type ObTableColumnFixed = true | 'left' | 'right';
export type ObTableColumnFilterPlacement =
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

export type ObTableFilterMethod = (
  value: unknown,
  row: Record<string, unknown>,
  column: TableColumnCtx<Record<string, unknown>>
) => void;

export interface ObTableColumnScope {
  row?: Record<string, unknown>;
  column: ObTableColumnsContract;
  $index: number;
}

export interface ObTableColumnRendererScope extends ObTableColumnScope {
  index: number;
  props: Record<string, unknown>;
  attrs: Record<string, unknown>;
}

/**
 * 与上游列契约对齐的原始 TableColumn 字段。
 */
export interface ObTableColumnContract {
  label?: string;
  prop?: string | ((index: number) => string);
  type?: ObTableColumnType;
  index?: number | ((index: number) => number);
  columnKey?: string;
  width?: string | number;
  minWidth?: string | number;
  fixed?: ObTableColumnFixed;
  renderHeader?: (data: {
    column: TableColumnCtx<Record<string, unknown>>;
    $index: number;
  }) => VNodeChild;
  sortable?: ObTableColumnSortable;
  sortMethod?: (a: unknown, b: unknown) => number;
  sortBy?: string | ((row: Record<string, unknown>, index: number) => string) | string[];
  sortOrders?: Array<ObTableColumnSortOrders>;
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
  filterPlacement?: ObTableColumnFilterPlacement;
  filterClassName?: string;
  filterMultiple?: boolean;
  filterMethod?: ObTableFilterMethod;
  filteredValue?: Array<unknown>;
  tooltipFormatter?: (data: {
    row: Record<string, unknown>;
    column: Record<string, unknown>;
    cellValue: unknown;
  }) => VNodeChild;
}

/**
 * 与上游列契约对齐的扩展列字段。
 */
export interface ObTableColumnsContract extends ObTableColumnContract {
  hide?: boolean | CallableFunction;
  slot?: string;
  headerSlot?: string;
  filterIconSlot?: string;
  expandSlot?: string;
  children?: Array<ObTableColumnsContract>;
  cellRenderer?: (data: ObTableColumnRendererScope) => VNodeChild;
  headerRenderer?: (data: ObTableColumnRendererScope) => VNodeChild;
}
