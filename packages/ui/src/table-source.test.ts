import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vite-plus/test';

describe('Table source', () => {
  const source = readFileSync(new URL('./components/table/Table.vue', import.meta.url), 'utf8');
  const typesSource = readFileSync(new URL('./components/table/types.ts', import.meta.url), 'utf8');
  const helperSource = readFileSync(
    new URL('./components/table/internal/table-helpers.ts', import.meta.url),
    'utf8'
  );
  const layoutSource = readFileSync(
    new URL('./components/table/internal/use-table-layout.ts', import.meta.url),
    'utf8'
  );
  const rowDragSource = readFileSync(
    new URL('./components/table/internal/use-table-row-drag-sort.ts', import.meta.url),
    'utf8'
  );
  const columnBridgeSource = readFileSync(
    new URL('./components/table/internal/use-table-column-bridge.ts', import.meta.url),
    'utf8'
  );
  const contractSource = readFileSync(
    new URL('./components/table/table-contract/column-contract.ts', import.meta.url),
    'utf8'
  );
  const tableStyleSource = readFileSync(
    new URL('./components/table/Table.css', import.meta.url),
    'utf8'
  );
  const themeSource = readFileSync(new URL('./styles/table-theme.css', import.meta.url), 'utf8');

  it('应基于 Element Plus 表格与分页封装', () => {
    expect(source).toContain("name: 'Table'");
    expect(source).toContain('<el-table');
    expect(source).toContain('<el-pagination');
    expect(source).toContain('const wrapperClass = computed(() => [');
    expect(source).toContain("{ 'is-row-drag': rowDragEnabled.value },");
    expect(source).toContain('attrs.class');
    expect(source).not.toContain('ob-element-table');
  });

  it('应保留与 ObVxeTable 对齐的核心契约', () => {
    expect(source).toContain('showEmptyValue?: boolean;');
    expect(source).toContain('emptyValueText?: string;');
    expect(source).toContain('emptyText?: string;');
    expect(source).toContain('rowDrag?: boolean;');
    expect(source).toContain('rowDragConfig?: TableRowDragConfig;');
    expect(source).toContain('tooltipRenderThreshold?: number;');
    expect(source).toContain('showEmptyValue: true');
    expect(source).toContain("emptyValueText: '---'");
    expect(source).toContain("emptyText: '暂未生产任何数据'");
    expect(source).toContain('rowDrag: false');
    expect(source).toContain('tooltipRenderThreshold: 0');
    expect(source).toContain('treeConfig?: Record<string, unknown>;');
    expect(source).toContain('pagination?: TablePagination | false | null;');
    expect(source).toContain("tableLayout: 'fixed'");
  });

  it('应暴露兼容方法，供 useTable 与页面侧复用', () => {
    expect(source).toContain('defineExpose({');
    expect(source).toContain('getTableRef');
    expect(source).toContain('setAdaptive');
    expect(source).toContain('clearSelection');
  });

  it('应支持树表、空值占位与超长提示', () => {
    expect(helperSource).toContain('column.showOverflowTooltip ?? column.ellipsis ?? defaultValue');
    expect(helperSource).toContain('column.showEmptyValue ?? defaultValue');
    expect(helperSource).toContain('column.emptyValueText ?? defaultValue');
    expect(source).toContain('treeConfig?.lazy === true');
    expect(helperSource).toContain('treeConfig?.children');
    expect(helperSource).toContain('treeConfig?.hasChildren');
    expect(helperSource).toContain('treeConfig?.load');
    expect(source).toContain('props.treeConfig?.defaultExpandAll === true');
    expect(source).not.toContain('treeConfig?.children ?? treeConfig?.childrenField');
    expect(source).not.toContain('treeConfig?.hasChildren ?? treeConfig?.hasChildField');
    expect(source).not.toContain('treeConfig?.load ?? treeConfig?.loadMethod');
    expect(source).not.toContain(
      'props.treeConfig?.defaultExpandAll === true || props.treeConfig?.expandAll === true'
    );
    expect(helperSource).toContain('columnRecord.minwidth');
    expect(helperSource).toContain("columnRecord['min-width']");
    expect(columnBridgeSource).toContain('resolveColumnMinWidth(column)');
    expect(columnBridgeSource).toContain('const formatter = column.formatter;');
    expect(columnBridgeSource).toContain("const hasFormatter = typeof formatter === 'function';");
    expect(columnBridgeSource).toContain('formatter.length <= 1');
    expect(source).toContain(
      'const normalizedRows = normalizeTreeRows(Array.isArray(rows) ? rows : [], {'
    );
    expect(helperSource).toContain("if (typeof value === 'boolean') {");
  });

  it('应兼容统一表格的筛选图标与展开插槽契约', () => {
    expect(typesSource).toContain('extends Omit<');
    expect(typesSource).toContain('ObTableColumnsContract');
    expect(contractSource).toContain('filterIconSlot?: string;');
    expect(contractSource).toContain('expandSlot?: string;');
    expect(columnBridgeSource).toContain("componentSlots['filter-icon']");
    expect(columnBridgeSource).toContain("if (type === 'expand')");
    expect(columnBridgeSource).toContain('if (tableSlots.expand)');
    expect(columnBridgeSource).toContain('componentSlots.expand = (scope?: ColumnBridgeScope) =>');
    expect(columnBridgeSource).toContain('return null;');
    expect(columnBridgeSource).toContain('mappedColumn.filterIconSlot = undefined;');
    expect(columnBridgeSource).toContain('mappedColumn.expandSlot = undefined;');
  });

  it('应保留统一表格的核心顶层 props 与 expose 能力', () => {
    expect(source).toContain('loadingConfig?: TableLoadingConfig;');
    expect(source).toContain('rowHoverBgColor?: string;');
    expect(source).toContain('tableKey?: string | number;');
    expect(source).toContain('locale?: TableLocaleInput;');
    expect(source).toContain('const liveStatusText = computed(() => {');
    expect(source).toContain("rowHoverBgColor: '',");
    expect(source).toContain("locale: 'zhCn'");
    expect(source).toContain(
      'const fallbackTableKey = `ob-table-${componentInstance?.uid ?? Math.random().toString(36).slice(2)}`;'
    );
    expect(source).toContain(
      'const resolvedTableKey = computed(() => props.tableKey ?? fallbackTableKey);'
    );
    expect(source).toContain('useTableLayout({');
    expect(source).toContain('getTableDoms,');
    expect(source).toContain('setHeaderSticky,');
    expect(source).toContain('useTableRowDragSort({');
    expect(source).toContain("emit('row-drag-sort', payload)");
    expect(source).toContain('function scheduleRowDragInit() {');
    expect(source).toContain('scheduleRowDragInit();');
    expect(source).toContain('function scheduleTableLayoutUpdate(options?: {');
    expect(source).toContain('scheduleTableLayoutUpdate({ adaptive: true, rowDrag: true });');
    expect(source).toContain('scheduleAdaptiveResize();');
    expect(source).toContain('createElementTableColumnBridge({');
    expect(typesSource).toContain('interface TableRowDragConfig');
    expect(typesSource).toContain('interface TableRowDragSortPayload');
    expect(source).toContain("'element-loading-text': props.loadingConfig?.text");
    expect(source).toContain("'element-loading-svg-view-box': props.loadingConfig?.viewBox");
    expect(source).toContain(':key="resolvedTableKey"');
    expect(source).toContain('role="region"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('ob-table__sr-status');
    expect(source).toContain('<slot name="empty">');
    expect(source).toContain('<slot name="append" />');
    expect(source).toContain('<el-config-provider :locale="resolvedLocale">');
    expect(source).toContain('const tableRefRegistry = new Map<string, TableCompatInstance>();');
    expect(source).toContain('tableRefRegistry.get(tableRegistryKey.value)');
    expect(source).toContain('tableRefRegistry.set(currentKey, activeTable);');
    expect(source).toContain('tableRefRegistry.delete(registeredTableKey.value);');
    expect(source).toContain('function syncTableRegistry()');
    expect(source).toContain('tableRegistryKey,');
    expect(source).toContain('watch(tableRef, () => {');
    expect(layoutSource).toContain(
      "window.addEventListener('resize', adaptiveWindowResizeHandler);"
    );
    expect(layoutSource).toContain(
      "window.removeEventListener('resize', adaptiveWindowResizeHandler);"
    );
    expect(layoutSource).toContain('function clearHeaderSticky() {');
    expect(layoutSource).toContain("headerRef.style.removeProperty('position');");
    expect(layoutSource).toContain('clearHeaderSticky();');
    expect(layoutSource).toContain('resolveAdaptiveHeight({');
    expect(layoutSource).toContain('viewportHeight: window.innerHeight');
    expect(helperSource).toContain('export function resolveAdaptiveHeight');
    expect(helperSource).toContain('export function queryFirstElement');
    expect(source).toContain('function resolvePaginationAlign');
    expect(source).toContain('function resolvePaginationSize');
    expect(source).toContain(
      'const hasControlledCurrentPage = Number.isFinite(rawCurrentPage) && rawCurrentPage > 0;'
    );
    expect(source).toContain(
      'const currentPage = hasControlledCurrentPage ? rawCurrentPage : undefined;'
    );
    expect(source).toContain('const pageSize = hasControlledPageSize ? rawPageSize : undefined;');
    expect(source).toContain(':class="pagerProps.className"');
    expect(source).toContain(':style="pagerProps.style"');
    expect(source).toContain(':page-count="pagerProps.pageCount"');
    expect(source).toContain(':hide-on-single-page="pagerProps.hideOnSinglePage ?? false"');
    expect(source).toContain(':class="pagerWrapperClass"');
    expect(typesSource).toContain('TablePaginationAlign');
    expect(typesSource).toContain('TablePaginationSize');
    expect(typesSource).toContain('interface TablePagination extends PaginationConfig');
    expect(typesSource).toContain('align?: TablePaginationAlign;');
    expect(typesSource).toContain('class?: string;');
    expect(typesSource).toContain('style?: CSSProperties;');
  });

  it('应内置分页 total 偏移与滚动条样式收口', () => {
    expect(source).toContain('<style scoped src="./Table.css"></style>');
    expect(tableStyleSource).toContain('top: 50%');
    expect(tableStyleSource).toContain('transform: translateY(-50%)');
    expect(tableStyleSource).toContain('border-radius: var(--ob-table-scrollbar-radius)');
    expect(tableStyleSource).toContain('.ob-table__sr-status');
    expect(tableStyleSource).toContain('.ob-table.is-row-drag');
    expect(tableStyleSource).toContain('.ob-table__drag-ghost');
    expect(tableStyleSource).toContain('.ob-table__pager.is-align-left');
    expect(tableStyleSource).toContain('.ob-table__pager.is-align-center');
    expect(themeSource).toContain('--ob-table-pager-total-left: 12px;');
    expect(themeSource).toContain('--ob-table-pager-content-padding-left: 128px;');
    expect(themeSource).toContain('--ob-table-header-bg: #f8f8f8;');
    expect(themeSource).toContain('--ob-table-header-color: #333;');
    expect(themeSource).toContain('--ob-table-body-color: #333;');
    expect(themeSource).toContain('--ob-table-body-font-weight: 500;');
    expect(themeSource).toContain('--ob-table-scrollbar-size: 8px;');
    expect(themeSource).toContain('--ob-table-scrollbar-radius: 6px;');
    expect(themeSource).toContain('--ob-table-scrollbar-thumb-color: #dcdee0;');
  });

  it('应通过 Element Plus 官方样式入口注入头部与内容样式', () => {
    expect(source).toContain('headerRowStyle: resolvedHeaderRowStyle.value');
    expect(source).toContain('headerCellStyle: resolvedHeaderCellStyle.value');
    expect(source).toContain('cellStyle: resolvedCellStyle.value');
    expect(source).toContain('resolveTableStyleValue(attrsRecord.value.headerCellStyle');
    expect(source).toContain('resolveTableStyleValue(attrsRecord.value.cellStyle');
  });

  it('应支持行拖拽键盘辅助与依赖缺失告警', () => {
    expect(rowDragSource).toContain('warnSortableUnavailable');
    expect(rowDragSource).toContain('event.altKey');
    expect(rowDragSource).toContain("event.key !== 'ArrowUp' && event.key !== 'ArrowDown'");
    expect(rowDragSource).toContain("row.setAttribute('tabindex', '0')");
    expect(rowDragSource).toContain('aria-label');
  });
});
