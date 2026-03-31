import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vite-plus/test';

describe('ElementTable source', () => {
  const source = readFileSync(
    new URL('./components/table/ElementTable.vue', import.meta.url),
    'utf8'
  );

  it('应基于 Element Plus 表格与分页封装', () => {
    expect(source).toContain("name: 'ElementTable'");
    expect(source).toContain('<el-table');
    expect(source).toContain('<el-pagination');
  });

  it('应保留与 ObVxeTable 对齐的核心契约', () => {
    expect(source).toContain('showEmptyValue?: boolean;');
    expect(source).toContain('emptyValueText?: string;');
    expect(source).toContain('emptyText?: string;');
    expect(source).toContain('showEmptyValue: true');
    expect(source).toContain("emptyValueText: '---'");
    expect(source).toContain("emptyText: '暂未生产任何数据'");
    expect(source).toContain('treeConfig?: Record<string, unknown>;');
    expect(source).toContain('pagination?: TablePagination | false | null;');
  });

  it('应暴露兼容方法，供 useTable 与页面侧复用', () => {
    expect(source).toContain('defineExpose({');
    expect(source).toContain('getTableRef');
    expect(source).toContain('setAdaptive');
    expect(source).toContain('clearSelection');
  });

  it('应支持树表、空值占位与超长提示', () => {
    expect(source).toContain(
      'column.showOverflowTooltip ?? column.ellipsis ?? props.showOverflowTooltip'
    );
    expect(source).toContain('column.showEmptyValue ?? props.showEmptyValue');
    expect(source).toContain('column.emptyValueText ?? props.emptyValueText');
    expect(source).toContain('treeConfig?.lazy === true');
    expect(source).toContain('loadMethod');
  });
});
