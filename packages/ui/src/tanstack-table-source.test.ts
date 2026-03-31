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

  it('应通过 useVueTable 驱动表格，并继续复用 VxePager 保持分页交互一致', () => {
    expect(source).toContain('FlexRender');
    expect(source).toContain("from '@tanstack/vue-table';");
    expect(source).toContain('const engine = useTanStackTableEngine({');
    expect(source).toContain('<VxePager v-bind="pagerProps" @page-change="handlePageChange" />');
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
  });

  it('应支持 custom sort 仅发事件不本地排序，并保留 sortBy 字段映射', () => {
    expect(engineSource).toContain("isCustomSort: column.sortable === 'custom'");
    expect(engineSource).toContain('sortingFn: meta.isCustomSort ? () => 0 : undefined');
    expect(engineSource).toContain('function resolveSortField(column: TableColumn | undefined');
    expect(engineSource).toContain('field: resolveSortField(sourceColumn, activeSort.id),');
  });

  it('应补齐树表 trigger/reserve 与 slot size 兼容参数', () => {
    expect(engineSource).toContain(
      'function resolveTreeTrigger(treeConfig?: Record<string, unknown>) {'
    );
    expect(engineSource).toContain(
      'function shouldReserveExpanded(treeConfig?: Record<string, unknown>) {'
    );
    expect(engineSource).toContain('filterExpandedState(expanded.value, internalData.value');
    expect(engineSource).toContain(
      "size: typeof attrs.value.size === 'string' ? attrs.value.size : undefined"
    );
  });
});
