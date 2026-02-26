import type { VNodeChild } from 'vue';

export type TableAlign = 'left' | 'center' | 'right';
export type TableColumnType = 'selection' | 'index' | 'expand';
export type TableSortable = boolean | 'custom';
export type TableFixed = boolean | 'left' | 'right';

export interface TableColumnRendererParams {
  row: Record<string, unknown>;
  column: TableColumn;
  $index: number;
  index: number;
  props: Record<string, unknown>;
  attrs: Record<string, unknown>;
}

export interface TableColumn {
  label?: string;
  prop?: string | ((index: number) => string);
  type?: TableColumnType;
  index?: number | ((index: number) => number);
  width?: string | number;
  minWidth?: string | number;
  fixed?: TableFixed;
  sortable?: TableSortable;
  sortBy?: string | string[] | ((row: Record<string, unknown>, index: number) => string);
  showOverflowTooltip?: boolean;
  align?: TableAlign;
  headerAlign?: TableAlign;
  className?: string;
  children?: TableColumn[];
  slot?: string;
  headerSlot?: string;
  hide?: boolean | ((column: TableColumn) => boolean);
  cellRenderer?: (params: TableColumnRendererParams) => VNodeChild;
  headerRenderer?: (params: Omit<TableColumnRendererParams, 'row' | '$index' | 'index'>) => VNodeChild;
  [key: string]: unknown;
}

export type TableColumnList = TableColumn[];

export interface TablePagination {
  total: number;
  pageSize: number;
  currentPage: number;
  background?: boolean;
  pageSizes?: number[];
  layout?: string;
  small?: boolean;
  [key: string]: unknown;
}

export interface AdaptiveConfig {
  offsetBottom?: number;
  fixHeader?: boolean;
  timeout?: number;
  zIndex?: number;
}

export interface VxeVirtualConfig {
  enabled?: boolean;
  y?: Record<string, unknown>;
  x?: Record<string, unknown>;
  [key: string]: unknown;
}
