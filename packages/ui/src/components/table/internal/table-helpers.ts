import type { VNodeChild } from 'vue';
import type { TableColumn } from '../types';

type RowRecord = Record<string, unknown>;

export interface TreeDataNormalizeOptions {
  childrenField: string;
  hasChildField: string;
  lazy: boolean;
}

export type TreeLoadMethod = (
  row: RowRecord,
  treeNode: unknown,
  resolve: (rows: RowRecord[]) => void
) => Promise<RowRecord[] | void> | RowRecord[] | void;

export function resolveColumnField(prop: TableColumn['prop'], index: number): string | undefined {
  if (typeof prop === 'function') {
    const result = prop(index);
    return typeof result === 'string' && result.length > 0 ? result : undefined;
  }
  return typeof prop === 'string' && prop.length > 0 ? prop : undefined;
}

export function resolveColumnWidth(column: TableColumn): string | number | undefined {
  const value = column.width;
  return typeof value === 'number' || typeof value === 'string' ? value : undefined;
}

export function resolveColumnMinWidth(column: TableColumn): string | number | undefined {
  const columnRecord = column as Record<string, unknown>;
  const value = column.minWidth ?? columnRecord.minwidth ?? columnRecord['min-width'];
  return typeof value === 'number' || typeof value === 'string' ? value : undefined;
}

export function resolveColumnHidden(column: TableColumn): boolean {
  if (typeof column.hide === 'function') {
    return Boolean(column.hide(column));
  }
  return Boolean(column.hide);
}

export function isOperationColumn(column: TableColumn, index: number): boolean {
  const field = resolveColumnField(column.prop, index) || '';
  const slotName = column.slot || '';
  const label = column.label || '';
  const candidateSet = new Set(['operation', 'action', 'actions']);

  if (candidateSet.has(field) || candidateSet.has(slotName)) {
    return true;
  }
  return label.includes('操作');
}

export function resolveColumnShowOverflow(column: TableColumn, defaultValue: boolean): boolean {
  return Boolean(column.showOverflowTooltip ?? column.ellipsis ?? defaultValue);
}

export function resolveColumnShowEmptyValue(column: TableColumn, defaultValue: boolean): boolean {
  return Boolean(column.showEmptyValue ?? defaultValue);
}

export function resolveColumnEmptyValueText(column: TableColumn, defaultValue?: string): string {
  return column.emptyValueText ?? defaultValue ?? '---';
}

export function resolveCellDisplayValue(
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

export function resolveTreeChildrenField(treeConfig?: Record<string, unknown>) {
  const childrenField = treeConfig?.children;
  return typeof childrenField === 'string' && childrenField.length > 0 ? childrenField : 'children';
}

export function resolveTreeHasChildField(treeConfig?: Record<string, unknown>) {
  const hasChildField = treeConfig?.hasChildren;
  return typeof hasChildField === 'string' && hasChildField.length > 0
    ? hasChildField
    : 'hasChildren';
}

export function resolveTreeLoadMethod(treeConfig?: Record<string, unknown>): TreeLoadMethod | null {
  const loadMethod = treeConfig?.load;
  return typeof loadMethod === 'function' ? (loadMethod as TreeLoadMethod) : null;
}

function resolveTreeHasChildrenFlag(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value === 1 ? true : value === 0 ? false : undefined;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') {
      return true;
    }
    if (normalized === 'false' || normalized === '0') {
      return false;
    }
  }
  return undefined;
}

export function normalizeTreeRows(
  rows: RowRecord[],
  options: TreeDataNormalizeOptions
): RowRecord[] {
  return rows.map((row) => {
    const nextRow: RowRecord = { ...row };
    const childrenValue = nextRow[options.childrenField];
    const hasChildFieldValue = nextRow[options.hasChildField];
    const fallbackHasChildValue = nextRow.hasChild ?? nextRow.hasChildren;

    let hasChildrenFlag = resolveTreeHasChildrenFlag(hasChildFieldValue);
    if (typeof hasChildrenFlag === 'undefined') {
      hasChildrenFlag = resolveTreeHasChildrenFlag(fallbackHasChildValue);
    }
    if (typeof hasChildrenFlag === 'undefined' && Array.isArray(childrenValue)) {
      hasChildrenFlag = childrenValue.length > 0;
    }

    if (typeof hasChildrenFlag !== 'undefined') {
      nextRow[options.hasChildField] = hasChildrenFlag;
    }

    if (Array.isArray(childrenValue)) {
      if (options.lazy && hasChildrenFlag && childrenValue.length === 0) {
        delete nextRow[options.childrenField];
      } else {
        nextRow[options.childrenField] = normalizeTreeRows(childrenValue as RowRecord[], options);
      }
    }

    return nextRow;
  });
}

export function resolvePagerLayout(layout?: string): string {
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

export interface AdaptiveHeightOptions {
  viewportHeight: number;
  elementTop: number;
  offsetBottom: number;
  paginationHeight?: number;
  containerHeight?: number;
  minHeight?: number;
}

function normalizePositiveNumber(value: unknown, fallback = 0): number {
  const resolved = Number(value);
  return Number.isFinite(resolved) && resolved >= 0 ? resolved : fallback;
}

export function resolveAdaptiveHeight(options: AdaptiveHeightOptions): number | undefined {
  const minHeight = normalizePositiveNumber(options.minHeight, 120);
  const paginationHeight = normalizePositiveNumber(options.paginationHeight, 0);
  const viewportCandidate = Math.floor(
    options.viewportHeight - options.elementTop - options.offsetBottom - paginationHeight
  );
  if (viewportCandidate > minHeight) {
    return viewportCandidate;
  }

  const containerHeight = normalizePositiveNumber(options.containerHeight);
  if (containerHeight > 0) {
    const containerCandidate = Math.floor(containerHeight - paginationHeight - 1);
    if (containerCandidate > minHeight) {
      return containerCandidate;
    }

    const containerFallback = Math.floor(containerHeight - options.offsetBottom);
    if (containerFallback > minHeight) {
      return containerFallback;
    }
  }

  return undefined;
}

export function queryFirstElement(
  root: ParentNode | null | undefined,
  selectors: string[]
): HTMLElement | null {
  if (!root || selectors.length === 0) {
    return null;
  }

  for (const selector of selectors) {
    const matched = root.querySelector(selector);
    if (matched instanceof HTMLElement) {
      return matched;
    }
  }

  return null;
}
