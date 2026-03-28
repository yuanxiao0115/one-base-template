import { describe, expect, it } from 'vite-plus/test';
import type { DocumentMaterialAnchor } from '../schema/types';
import type { DocumentSheetStyle } from '../schema/sheet';
import {
  addSheetMergeByAnchor,
  applySheetStyleToAnchor,
  removeSheetMergeAt
} from '../designer/sheet-ops';

function createAnchor(): DocumentMaterialAnchor {
  return {
    row: 2,
    col: 3,
    rowspan: 4,
    colspan: 6
  };
}

describe('designer sheet ops', () => {
  it('应将样式应用到当前物料锚点区域', () => {
    const anchor = createAnchor();
    const before: DocumentSheetStyle[] = [
      {
        row: 1,
        col: 1,
        rowspan: 1,
        colspan: 1,
        backgroundColor: '#fff'
      }
    ];

    const next = applySheetStyleToAnchor(before, anchor, {
      backgroundColor: '#fef3c7',
      textColor: '#78350f',
      fontWeight: 'bold',
      border: {
        top: { color: '#b45309', style: 'solid', width: 1 },
        right: { color: '#b45309', style: 'solid', width: 1 },
        bottom: { color: '#b45309', style: 'solid', width: 1 },
        left: { color: '#b45309', style: 'solid', width: 1 }
      }
    });

    expect(next).toHaveLength(2);
    expect(next[1]).toMatchObject({
      row: 2,
      col: 3,
      rowspan: 4,
      colspan: 6,
      backgroundColor: '#fef3c7',
      textColor: '#78350f'
    });
  });

  it('同一区域重复应用样式时应覆盖而非新增', () => {
    const anchor = createAnchor();
    const next = applySheetStyleToAnchor(
      [
        {
          row: 2,
          col: 3,
          rowspan: 4,
          colspan: 6,
          backgroundColor: '#fff'
        }
      ],
      anchor,
      {
        backgroundColor: '#dbeafe'
      }
    );

    expect(next).toHaveLength(1);
    expect(next[0]?.backgroundColor).toBe('#dbeafe');
  });

  it('应支持按物料锚点新增与移除合并区域', () => {
    const anchor = createAnchor();
    const merges = addSheetMergeByAnchor([], anchor);
    const deduped = addSheetMergeByAnchor(merges, anchor);
    const removed = removeSheetMergeAt(deduped, 0);

    expect(merges).toHaveLength(1);
    expect(deduped).toHaveLength(1);
    expect(removed).toHaveLength(0);
  });
});
