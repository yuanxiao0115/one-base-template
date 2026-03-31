import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vite-plus/test';

describe('TanStackTable source', () => {
  const source = readFileSync(
    new URL('./components/table/TanStackTable.vue', import.meta.url),
    'utf8'
  );
  const engineSource = readFileSync(
    new URL('./components/table/internal/tanstack-engine.ts', import.meta.url),
    'utf8'
  );

  it('应通过 useVueTable 驱动表格，并改用 Element 分页保持契约一致', () => {
    expect(source).toContain('FlexRender');
    expect(source).toContain("from '@tanstack/vue-table';");
    expect(source).toContain('const engine = useTanStackTableEngine({');
    expect(source).toContain("import zhCnLocale from 'element-plus/es/locale/lang/zh-cn';");
    expect(source).toContain('<el-config-provider :locale="zhCnLocale">');
    expect(source).toContain('<el-pagination');
    expect(source).toContain('@current-change="handleCurrentPageChange"');
    expect(source).toContain('@size-change="handlePageSizeChange"');
    expect(source).not.toContain("from 'vxe-pc-ui';");
    expect(source).not.toContain('<VxePager');
  });

  it('应保持与 ObVxeTable 一致的事件与暴露句柄契约', () => {
    expect(source).toContain("(e: 'selection-change', selection: RowRecord[]): void;");
    expect(source).toContain(
      "(e: 'page-current-change' | 'page-size-change', page: number): void;"
    );
    expect(source).toContain("(e: 'sort-change', payload: VxeEventParams): void;");
    expect(source).toContain('defineExpose({');
    expect(source).toContain('getTableRef,');
    expect(source).toContain('setAdaptive,');
    expect(source).toContain('clearSelection');
    expect(source).toContain('getSelectedRowKeys,');
    expect(source).toContain('setSelectedRowKeys,');
    expect(source).toContain('setColumnVisibility,');
    expect(source).toContain('setColumnOrder,');
    expect(source).toContain('setColumnSizing,');
  });

  it('应在组件边界归一 data，并保留首屏骨架门禁', () => {
    expect(source).toContain(
      'const normalizedData = computed<RowRecord[]>(() => (Array.isArray(props.data) ? props.data : []));'
    );
    expect(source).toContain('const shouldUseFirstLoadSkeleton = computed(');
    expect(source).toContain(
      '<div v-if="showFirstLoadSkeleton" class="ob-tanstack-table__skeleton">'
    );
  });

  it('应补齐固定列吸附样式能力，避免左右 fixed 在横向滚动时失效', () => {
    expect(source).toContain('const fixedColumnState = computed(() => {');
    expect(source).toContain('function resolveFixedStyle(');
    expect(source).toContain('is-fixed-left-edge');
    expect(source).toContain('is-fixed-right-edge');
    expect(source).toContain(':style="resolveHeaderStyle(header)"');
    expect(source).toContain(':style="resolveCellStyle(cell)"');
    expect(source).toContain(
      'linear-gradient(var(--ob-table-header-bg), var(--ob-table-header-bg))'
    );
    expect(source).toContain('linear-gradient(var(--ob-table-row-bg), var(--ob-table-row-bg))');
    expect(source).not.toContain(
      "background: isHeader ? 'var(--ob-table-header-bg)' : 'var(--ob-table-row-bg)'"
    );
  });

  it('树表表头样式应与普通表头对齐，并固定字重字级口径', () => {
    expect(source).toContain("meta.isTreeNode ? 'is-tree-node' : ''");
    expect(source).toContain(
      '.ob-tanstack-table__th.is-tree-node .ob-tanstack-table__cell--header'
    );
    expect(source).toContain('--ob-table-tree-toggle-icon-size: 16px;');
    expect(source).toContain('--ob-table-tree-toggle-size: var(--ob-table-tree-toggle-icon-size);');
    expect(source).toContain('--ob-table-tree-toggle-gap: 8px;');
    expect(source).toContain('width: var(--ob-table-tree-toggle-icon-size);');
    expect(source).toContain('flex: 0 0 var(--ob-table-tree-toggle-icon-size);');
    expect(source).toContain('font-size: 14px;');
    expect(source).toContain('font-weight: 400;');
    expect(source).toContain('font-weight: var(--ob-table-header-font-weight);');
    expect(source).toContain('.ob-tanstack-table__tree-toggle-icon');
  });

  it('应支持 custom sort 仅发事件不本地排序，并保留 sortBy 字段映射', () => {
    expect(engineSource).toContain("isCustomSort: column.sortable === 'custom'");
    expect(engineSource).toContain('sortingFn: meta.isCustomSort ? () => 0 : undefined');
    expect(engineSource).toContain('function resolveSortField(column: TableColumn | undefined');
    expect(engineSource).toContain('field: resolveSortField(sourceColumn, activeSort.id),');
  });

  it('应补齐树表 trigger/reserve 与 slot size 兼容参数', () => {
    expect(engineSource).toContain(
      "import treeToggleCollapsedIcon from '../assets/tree-toggle-collapsed.svg';"
    );
    expect(engineSource).toContain(
      "import treeToggleExpandedIcon from '../assets/tree-toggle-expanded.svg';"
    );
    expect(engineSource).toContain(
      'src: isExpanded ? treeToggleExpandedIcon : treeToggleCollapsedIcon'
    );
    expect(engineSource).toContain("h('img', {");
    expect(engineSource).toContain(
      'function resolveTreeTrigger(treeConfig?: Record<string, unknown>) {'
    );
    expect(engineSource).toContain(
      'function shouldReserveExpanded(treeConfig?: Record<string, unknown>) {'
    );
    expect(engineSource).toContain(
      'function shouldExpandAll(treeConfig?: Record<string, unknown>) {'
    );
    expect(engineSource).toContain('function createExpandedState(');
    expect(engineSource).toContain(
      'const expandAll = computed(() => shouldExpandAll(resolvedProps.value.treeConfig));'
    );
    expect(engineSource).toContain('if (shouldExpand) {');
    expect(engineSource).toContain('filterExpandedState(');
    expect(engineSource).toContain('expanded.value,');
    expect(engineSource).toContain(
      "size: typeof attrs.value.size === 'string' ? attrs.value.size : undefined"
    );
  });

  it('应支持列显隐/列顺序/列宽状态，并提供对应引擎方法', () => {
    expect(engineSource).toContain('const columnVisibility = ref<VisibilityState>({});');
    expect(engineSource).toContain('const columnOrder = ref<ColumnOrderState>([]);');
    expect(engineSource).toContain('const columnSizing = ref<ColumnSizingState>({});');
    expect(engineSource).toContain(
      'function setColumnVisibility(nextVisibility: Record<string, boolean>)'
    );
    expect(engineSource).toContain('function setColumnOrder(nextOrder: string[])');
    expect(engineSource).toContain('function reorderColumn(sourceId: string, targetId: string)');
    expect(engineSource).toContain('function setColumnSizing(nextSizing: ColumnSizingState)');
    expect(engineSource).toContain('onColumnVisibilityChange,');
    expect(engineSource).toContain('onColumnOrderChange,');
    expect(engineSource).toContain('onColumnSizingChange,');
  });

  it('列宽配置应优先消费 width/minWidth，避免默认宽度覆盖列定义', () => {
    expect(engineSource).toContain('function resolveColumnSizeStyle(value?: string | number)');
    expect(engineSource).toContain(
      'const hasConfiguredWidth = meta.width != null && String(meta.width).trim().length > 0;'
    );
    expect(engineSource).toContain(
      'const hasManualSizing = Object.prototype.hasOwnProperty.call(columnSizing.value, column.id);'
    );
    expect(engineSource).toContain('if (!hasConfiguredWidth && !hasManualSizing) {');
    expect(engineSource).toContain('minWidth: resolvedMinWidth');
    expect(engineSource).toContain('maxWidth: resolvedWidth');
  });

  it('应支持表头拖拽换序与列宽拖拽手柄交互', () => {
    expect(source).toContain(':draggable="canDragHeader(header)"');
    expect(source).toContain('@dragstart="handleHeaderDragStart(header, $event)"');
    expect(source).toContain('@drop="handleHeaderDrop(header, $event)"');
    expect(source).toContain('class="ob-tanstack-table__column-resizer"');
    expect(source).toContain('@mousedown.stop.prevent="header.getResizeHandler()($event)"');
    expect(source).toContain('.ob-tanstack-table__column-resizer');
  });

  it('应支持虚拟滚动渲染分支，避免大数据量全量渲染', () => {
    expect(source).toContain("from '@tanstack/vue-virtual';");
    expect(source).toContain(
      'const rowVirtualizer = useVirtualizer<HTMLElement, HTMLTableRowElement>('
    );
    expect(source).toContain('const virtualRows = computed<VirtualRow[]>(() => {');
    expect(source).toContain('v-if="tableRows.length > 0 && virtualRows.length > 0"');
    expect(source).toContain('ob-tanstack-table__tr--virtual-gap');
  });

  it('应支持跨页选择保留（可配置），并暴露 selected row key 能力', () => {
    expect(source).toContain('reserveSelection?: boolean;');
    expect(source).toContain('reserveSelection: props.reserveSelection');
    expect(engineSource).toContain(
      'const reserveSelection = computed(() => resolvedProps.value.reserveSelection === true);'
    );
    expect(engineSource).toContain(
      'const reservedSelectionRows = ref<Record<string, RowRecord>>({});'
    );
    expect(engineSource).toContain('function getSelectedRowKeys() {');
    expect(engineSource).toContain(
      'function setSelectedRowKeys(rowKeys: Array<string | number>) {'
    );
  });
});
