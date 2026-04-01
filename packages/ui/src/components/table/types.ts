import type { PaginationConfig } from '@one-base-template/core';
import type { CSSProperties, VNodeChild } from 'vue';
import type {
  ObTableColumnFilterPlacement,
  ObTableColumnFixed,
  ObTableColumnSortable,
  ObTableColumnType,
  ObTableColumnsContract
} from './table-contract/column-contract';

export type TableAlign = 'left' | 'center' | 'right';
export type TableColumnType = ObTableColumnType;
export type TableSortable = ObTableColumnSortable;
export type TableFixed = ObTableColumnFixed;
export type TableColumnFilterPlacement = ObTableColumnFilterPlacement;
export type TableDefaultLocale = 'zhCn' | 'zhTw' | 'en';
export type TablePaginationAlign = 'left' | 'center' | 'right';
export type TablePaginationSize = 'default' | 'small' | 'large';

export interface TableLocaleObject {
  name: string;
  el: Record<string, unknown>;
  [key: string]: unknown;
}

export type TableLocaleInput = TableDefaultLocale | TableLocaleObject;

export interface TableLoadingConfig {
  text?: string;
  spinner?: string;
  svg?: string;
  viewBox?: string;
  background?: string;
}

export interface TableColumnRendererParams {
  row: Record<string, unknown>;
  column: TableColumn;
  $index: number;
  index: number;
  size?: string;
  props: Record<string, unknown>;
  attrs: Record<string, unknown>;
}

export interface TableColumnHeaderRendererParams {
  column: TableColumn;
  props: Record<string, unknown>;
  attrs: Record<string, unknown>;
}

export interface TableFormatterParams {
  row: Record<string, unknown>;
  column: TableColumn;
  cellValue: unknown;
  index: number;
}

export type TableFormatter =
  | ObTableColumnsContract['formatter']
  | ((params: TableFormatterParams) => VNodeChild);

export interface TableColumn extends Omit<
  ObTableColumnsContract,
  'cellRenderer' | 'headerRenderer' | 'children' | 'hide' | 'formatter'
> {
  ellipsis?: boolean;
  showOverflowTooltip?: boolean;
  showEmptyValue?: boolean;
  emptyValueText?: string;
  treeNode?: boolean;
  children?: TableColumn[];
  hide?: boolean | ((column: TableColumn) => boolean);
  cellRenderer?: (params: TableColumnRendererParams) => VNodeChild;
  headerRenderer?: (params: TableColumnHeaderRendererParams) => VNodeChild;
  formatter?: TableFormatter;
  [key: string]: unknown;
}

export type TableColumnList = TableColumn[];

export interface TablePagination extends PaginationConfig {
  size?: TablePaginationSize;
  align?: TablePaginationAlign;
  class?: string;
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

export interface AdaptiveConfig {
  offsetBottom?: number;
  fixHeader?: boolean;
  timeout?: number;
  zIndex?: number;
}

export interface TableRowDragConfig {
  handle?: string;
  animation?: number;
  ghostClass?: string;
  chosenClass?: string;
  dragClass?: string;
}

export interface TableRowDragSortPayload {
  oldIndex: number;
  newIndex: number;
  row?: Record<string, unknown>;
  rows: Record<string, unknown>[];
}

export interface VxeVirtualConfig {
  enabled?: boolean;
  y?: Record<string, unknown>;
  x?: Record<string, unknown>;
  [key: string]: unknown;
}
