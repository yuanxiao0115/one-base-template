import { describe, expect, it } from 'vite-plus/test';
import type { TableColumn } from '../types';
import {
  normalizeTreeRows,
  queryFirstElement,
  resolveAdaptiveHeight,
  resolveCellDisplayValue,
  resolveColumnEmptyValueText,
  resolveColumnField,
  resolveColumnHidden,
  resolveColumnMinWidth,
  resolveColumnShowEmptyValue,
  resolveColumnShowOverflow,
  resolveColumnWidth,
  resolvePagerLayout,
  resolveTreeChildrenField,
  resolveTreeHasChildField,
  resolveTreeLoadMethod
} from './table-helpers';

function asColumn(column: Record<string, unknown>): TableColumn {
  return column as unknown as TableColumn;
}

describe('table-helpers normalizeTreeRows', () => {
  it('当节点已规范时应复用原始引用，减少无效重建', () => {
    const rows = [
      {
        id: 1,
        hasChildren: true,
        children: [{ id: 2, hasChildren: false }]
      }
    ];

    const normalized = normalizeTreeRows(rows, {
      childrenField: 'children',
      hasChildField: 'hasChildren',
      lazy: false
    });
    const firstRow = normalized[0]!;
    const sourceFirstRow = rows[0]!;

    expect(normalized).toBe(rows);
    expect(firstRow).toBe(sourceFirstRow);
    expect(firstRow.children).toBe(sourceFirstRow.children);
  });

  it('当节点字段需要修正时应返回新引用并完成归一化', () => {
    const rows = [
      {
        id: 1,
        hasChildren: '1',
        children: []
      }
    ];

    const normalized = normalizeTreeRows(rows, {
      childrenField: 'children',
      hasChildField: 'hasChildren',
      lazy: true
    });
    const firstRow = normalized[0]!;

    expect(normalized).not.toBe(rows);
    expect(firstRow).not.toBe(rows[0]);
    expect(firstRow.hasChildren).toBe(true);
    expect('children' in firstRow).toBe(false);
  });
});

describe('table-helpers 通用解析函数', () => {
  it('应解析列字段、宽度和显隐配置', () => {
    expect(resolveColumnField('name', 0)).toBe('name');
    expect(resolveColumnField((index) => (index === 1 ? 'age' : ''), 1)).toBe('age');
    expect(resolveColumnField((index) => (index === 0 ? '' : 'x'), 0)).toBeUndefined();

    expect(resolveColumnWidth(asColumn({ width: 120 }))).toBe(120);
    expect(resolveColumnWidth(asColumn({ width: '40%' }))).toBe('40%');
    expect(resolveColumnWidth(asColumn({ width: null }))).toBeUndefined();

    expect(resolveColumnMinWidth(asColumn({ minWidth: 90 }))).toBe(90);
    expect(resolveColumnMinWidth(asColumn({ minwidth: '120px' }))).toBe('120px');
    expect(resolveColumnMinWidth(asColumn({ 'min-width': 88 }))).toBe(88);
    expect(resolveColumnMinWidth(asColumn({}))).toBeUndefined();

    expect(resolveColumnHidden(asColumn({ hide: true }))).toBe(true);
    expect(resolveColumnHidden(asColumn({ hide: () => false }))).toBe(false);
  });

  it('应解析空值展示、分页布局与树字段默认值', () => {
    expect(resolveColumnShowOverflow(asColumn({ showOverflowTooltip: true }), false)).toBe(true);
    expect(resolveColumnShowOverflow(asColumn({ ellipsis: true }), false)).toBe(true);
    expect(resolveColumnShowOverflow(asColumn({}), true)).toBe(true);

    expect(resolveColumnShowEmptyValue(asColumn({ showEmptyValue: false }), true)).toBe(false);
    expect(resolveColumnShowEmptyValue(asColumn({}), true)).toBe(true);
    expect(resolveColumnEmptyValueText(asColumn({ emptyValueText: '--' }), 'N/A')).toBe('--');
    expect(resolveColumnEmptyValueText(asColumn({}), 'N/A')).toBe('N/A');
    expect(resolveColumnEmptyValueText(asColumn({}))).toBe('---');

    expect(resolvePagerLayout()).toBe('total, sizes, prev, pager, next, jumper');
    expect(resolvePagerLayout('sizes,unknown,pager')).toBe('sizes, pager');
    expect(resolvePagerLayout('foo,bar')).toBe('total, sizes, prev, pager, next, jumper');

    expect(resolveTreeChildrenField()).toBe('children');
    expect(resolveTreeChildrenField({ children: 'nodes' })).toBe('nodes');
    expect(resolveTreeHasChildField()).toBe('hasChildren');
    expect(resolveTreeHasChildField({ hasChildren: 'hasChild' })).toBe('hasChild');
  });

  it('应处理单元格展示值与树 load 方法解析', () => {
    expect(resolveCellDisplayValue(null, true, '--')).toBe('--');
    expect(resolveCellDisplayValue('', false, '--')).toBe('');
    expect(resolveCellDisplayValue(true, true, '--')).toBe('true');
    expect(resolveCellDisplayValue(false, true, '--')).toBe('false');
    expect(resolveCellDisplayValue(12n, true, '--')).toBe('12');
    expect(resolveCellDisplayValue('hello', true, '--')).toBe('hello');

    const load = () => [];
    expect(resolveTreeLoadMethod({ load })).toBe(load);
    expect(resolveTreeLoadMethod({ load: 'noop' })).toBeNull();
    expect(resolveTreeLoadMethod()).toBeNull();
  });
});

describe('table-helpers 分支行为', () => {
  it('应在 hasChildren 字段缺失时回退使用 hasChild 字段', () => {
    const rows = [
      {
        id: 1,
        hasChild: 1
      }
    ];

    const normalized = normalizeTreeRows(rows, {
      childrenField: 'children',
      hasChildField: 'hasChildren',
      lazy: true
    });

    expect(normalized).not.toBe(rows);
    expect(normalized[0]).toMatchObject({
      id: 1,
      hasChild: 1,
      hasChildren: true
    });
  });

  it('应在非 lazy 模式下递归归一化子节点', () => {
    const rows = [
      {
        id: 1,
        hasChildren: true,
        children: [
          {
            id: 2,
            hasChildren: '0'
          }
        ]
      }
    ];

    const normalized = normalizeTreeRows(rows, {
      childrenField: 'children',
      hasChildField: 'hasChildren',
      lazy: false
    });

    expect(normalized).not.toBe(rows);
    const children = normalized[0]?.children as Array<Record<string, unknown>>;
    expect(children).toHaveLength(1);
    expect(children[0]?.hasChildren).toBe(false);
  });

  it('应按优先级计算自适应高度', () => {
    expect(
      resolveAdaptiveHeight({
        viewportHeight: 900,
        elementTop: 100,
        offsetBottom: 50,
        paginationHeight: 40,
        minHeight: 120
      })
    ).toBe(710);

    expect(
      resolveAdaptiveHeight({
        viewportHeight: 220,
        elementTop: 120,
        offsetBottom: 40,
        paginationHeight: 20,
        containerHeight: 300,
        minHeight: 120
      })
    ).toBe(279);

    expect(
      resolveAdaptiveHeight({
        viewportHeight: 220,
        elementTop: 120,
        offsetBottom: 5,
        paginationHeight: 20,
        containerHeight: 121,
        minHeight: 100
      })
    ).toBe(116);

    expect(
      resolveAdaptiveHeight({
        viewportHeight: 150,
        elementTop: 120,
        offsetBottom: 20,
        paginationHeight: 20,
        containerHeight: 80,
        minHeight: 100
      })
    ).toBeUndefined();
  });

  it('应返回首个匹配的 HTMLElement', () => {
    const root = document.createElement('section');
    const first = document.createElement('div');
    first.className = 'first';
    const second = document.createElement('span');
    second.className = 'second';
    root.append(first, second);

    expect(queryFirstElement(root, ['.not-exist', '.second'])).toBe(second);
    expect(queryFirstElement(root, ['.not-exist'])).toBeNull();
    expect(queryFirstElement(null, ['.first'])).toBeNull();
    expect(queryFirstElement(root, [])).toBeNull();
  });
});
