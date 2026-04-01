import { ElTableColumn, ElTooltip } from 'element-plus';
import { defineComponent, h, type PropType, type Slots, type VNodeChild } from 'vue';
import type {
  TableColumn,
  TableColumnHeaderRendererParams,
  TableColumnRendererParams
} from '../types';
import {
  isOperationColumn,
  resolveCellDisplayValue,
  resolveColumnEmptyValueText,
  resolveColumnField,
  resolveColumnHidden,
  resolveColumnMinWidth,
  resolveColumnShowEmptyValue,
  resolveColumnShowOverflow,
  resolveColumnWidth
} from './table-helpers';

type RowRecord = Record<string, unknown>;

interface ColumnBridgeScope {
  row: RowRecord;
  column?: Record<string, unknown>;
  $index: number;
  store?: Record<string, unknown>;
}

export interface TableColumnBridgeRuntimeProps {
  alignWhole: 'left' | 'center' | 'right';
  headerAlign?: 'left' | 'center' | 'right';
  showOverflowTooltip: boolean;
  showEmptyValue: boolean;
  emptyValueText: string;
  size?: '' | 'default' | 'small' | 'large';
  reserveSelection: boolean;
}

interface CreateElementTableColumnBridgeOptions {
  getRuntimeProps: () => TableColumnBridgeRuntimeProps;
  getComponentProps: () => Record<string, unknown>;
  getComponentAttrs: () => Record<string, unknown>;
  getTableSlots: () => Slots;
  enableRichCellTooltip: () => boolean;
}

function getRowValue(row: RowRecord, field?: string) {
  if (!field) {
    return '';
  }
  return row[field];
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

function createRendererParams(
  options: CreateElementTableColumnBridgeOptions,
  column: TableColumn,
  row: RowRecord,
  rowIndex: number
): TableColumnRendererParams {
  const runtimeProps = options.getRuntimeProps();
  return {
    row,
    column,
    $index: rowIndex,
    index: rowIndex,
    size: runtimeProps.size,
    props: options.getComponentProps(),
    attrs: options.getComponentAttrs()
  };
}

function renderValueWithOverflow(
  displayValue: VNodeChild,
  showOverflowTooltip: boolean,
  isOperation: boolean,
  useRichTooltip: boolean
) {
  if (typeof displayValue !== 'string' && typeof displayValue !== 'number') {
    return displayValue;
  }

  const text = String(displayValue);
  const shouldUseTitle = showOverflowTooltip && !isOperation && !useRichTooltip;
  const content = h(
    'span',
    {
      class: ['ob-table__cell-text', showOverflowTooltip && !isOperation ? 'is-ellipsis' : ''],
      title: shouldUseTitle && text.length > 0 ? text : undefined
    },
    text
  );

  if (!showOverflowTooltip || isOperation || text.length === 0) {
    return content;
  }
  if (!useRichTooltip) {
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
  options: CreateElementTableColumnBridgeOptions,
  column: TableColumn,
  row: RowRecord,
  rowIndex: number,
  columnIndex: number
) {
  const runtimeProps = options.getRuntimeProps();
  const field = resolveColumnField(column.prop, columnIndex);
  const rawValue = getRowValue(row, field);
  const formatter = column.formatter;
  const hasFormatter = typeof formatter === 'function';
  let formattedValue = rawValue;

  if (hasFormatter) {
    const formatterColumn = {
      ...column,
      property: field,
      label: column.label,
      type: column.type
    } as Record<string, unknown>;
    const formatterParams = {
      row,
      column,
      cellValue: rawValue,
      index: rowIndex
    };

    try {
      formattedValue =
        formatter.length <= 1
          ? (formatter as (params: typeof formatterParams) => VNodeChild)(formatterParams)
          : (
              formatter as (
                row: RowRecord,
                column: Record<string, unknown>,
                cellValue: unknown,
                index: number
              ) => VNodeChild
            )(row, formatterColumn, rawValue, rowIndex);
    } catch {
      formattedValue = rawValue;
    }
  }

  const showEmptyValue = resolveColumnShowEmptyValue(column, runtimeProps.showEmptyValue);
  const emptyValueText = resolveColumnEmptyValueText(column, runtimeProps.emptyValueText);
  const displayValue: VNodeChild = hasFormatter
    ? (formattedValue as VNodeChild)
    : resolveCellDisplayValue(formattedValue, showEmptyValue, emptyValueText);
  const showOverflowTooltip = resolveColumnShowOverflow(column, runtimeProps.showOverflowTooltip);
  return renderValueWithOverflow(
    displayValue,
    showOverflowTooltip,
    isOperationColumn(column, columnIndex),
    options.enableRichCellTooltip()
  );
}

function renderColumnHeader(options: CreateElementTableColumnBridgeOptions, column: TableColumn) {
  const tableSlots = options.getTableSlots();
  if (column.headerSlot && tableSlots[column.headerSlot]) {
    return tableSlots[column.headerSlot]?.({
      column,
      props: options.getComponentProps(),
      attrs: options.getComponentAttrs()
    }) as unknown as VNodeChild;
  }

  if (column.headerRenderer) {
    const params: TableColumnHeaderRendererParams = {
      column,
      props: options.getComponentProps(),
      attrs: options.getComponentAttrs()
    };
    return column.headerRenderer(params);
  }

  return column.label || '';
}

export function createElementTableColumnBridge(options: CreateElementTableColumnBridgeOptions) {
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
          size: options.getRuntimeProps().size,
          props: options.getComponentProps(),
          attrs: options.getComponentAttrs(),
          column: scopeRecord.column ?? column
        };
      }

      function renderColumnCell(scope: ColumnBridgeScope) {
        const column = bridgeProps.column;
        const tableSlots = options.getTableSlots();
        const type = resolveColumnType(column.type);
        const row = (scope.row || {}) as RowRecord;
        const rowIndex = Number(scope.$index ?? 0);
        const expandSlot = column.expandSlot;
        const cellSlot = column.slot;

        if (type === 'expand') {
          if (expandSlot && tableSlots[expandSlot]) {
            return tableSlots[expandSlot]?.(
              createBridgeSlotPayload(scope, column)
            ) as unknown as VNodeChild;
          }

          if (tableSlots.expand) {
            return tableSlots.expand?.(
              createBridgeSlotPayload(scope, column)
            ) as unknown as VNodeChild;
          }

          if (column.cellRenderer) {
            return column.cellRenderer(createRendererParams(options, column, row, rowIndex));
          }

          if (cellSlot && tableSlots[cellSlot]) {
            return tableSlots[cellSlot]?.(
              createBridgeSlotPayload(scope, column)
            ) as unknown as VNodeChild;
          }

          return null;
        }

        if (cellSlot && tableSlots[cellSlot]) {
          return tableSlots[cellSlot]?.(
            createBridgeSlotPayload(scope, column)
          ) as unknown as VNodeChild;
        }

        if (column.cellRenderer) {
          return column.cellRenderer(createRendererParams(options, column, row, rowIndex));
        }

        return renderDefaultCellContent(options, column, row, rowIndex, bridgeProps.columnIndex);
      }

      return () => {
        const runtimeProps = options.getRuntimeProps();
        const tableSlots = options.getTableSlots();
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
        mappedColumn.align = column.align ?? runtimeProps.alignWhole;
        mappedColumn.headerAlign =
          column.headerAlign ?? runtimeProps.headerAlign ?? runtimeProps.alignWhole;
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
          mappedColumn.reserveSelection = runtimeProps.reserveSelection;
        }

        if (type === 'index') {
          mappedColumn.index = createSeqMethod(column);
        }

        const componentSlots: Record<string, (scope?: ColumnBridgeScope) => VNodeChild> = {};

        if (column.headerSlot || column.headerRenderer) {
          componentSlots.header = () => renderColumnHeader(options, column);
        }

        const filterIconSlot = column.filterIconSlot;
        if (filterIconSlot && tableSlots[filterIconSlot]) {
          componentSlots['filter-icon'] = (scope?: ColumnBridgeScope) =>
            tableSlots[filterIconSlot]?.(
              createBridgeSlotPayload(scope || {}, column)
            ) as unknown as VNodeChild;
        }

        if (childColumns.length > 0) {
          componentSlots.default = () =>
            childColumns.map((child, childIndex) =>
              h(ElementTableColumnBridge, {
                key: `${field || column.label || 'column'}-${childIndex}`,
                column: child,
                columnIndex: childIndex
              })
            );
        } else if (type === 'expand' || column.slot || column.cellRenderer || field) {
          if (type === 'expand') {
            componentSlots.expand = (scope?: ColumnBridgeScope) =>
              renderColumnCell((scope || { row: {}, $index: 0 }) as ColumnBridgeScope);
          }
          componentSlots.default = (scope?: ColumnBridgeScope) =>
            renderColumnCell((scope || { row: {}, $index: 0 }) as ColumnBridgeScope);
        }

        return h(ElTableColumn, mappedColumn, componentSlots);
      };
    }
  });

  return ElementTableColumnBridge;
}
