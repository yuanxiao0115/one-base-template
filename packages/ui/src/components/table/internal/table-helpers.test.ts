import { describe, expect, it } from 'vite-plus/test';
import { normalizeTreeRows } from './table-helpers';

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
