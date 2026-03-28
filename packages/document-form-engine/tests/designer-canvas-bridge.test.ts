import { describe, expect, it } from 'vite-plus/test';

import {
  anchorToCanvasRange,
  canvasRangeToAnchor,
  clampCanvasRange,
  type CanvasGridRange
} from '../designer/canvas-bridge';

describe('designer canvas bridge', () => {
  it('应将锚点转换为 Univer 网格范围', () => {
    const range = anchorToCanvasRange({
      row: 2,
      col: 3,
      rowspan: 4,
      colspan: 5
    });

    expect(range).toMatchObject({
      startRow: 1,
      startColumn: 2,
      endRow: 4,
      endColumn: 6
    });
  });

  it('应将网格范围转换回锚点并自动归一化方向', () => {
    const anchor = canvasRangeToAnchor({
      startRow: 8,
      startColumn: 4,
      endRow: 6,
      endColumn: 2
    });

    expect(anchor).toMatchObject({
      row: 7,
      col: 3,
      rowspan: 3,
      colspan: 3
    });
  });

  it('应按边界裁剪范围并保持至少一个单元格', () => {
    const clamped = clampCanvasRange(
      {
        startRow: -2,
        startColumn: -1,
        endRow: 999,
        endColumn: 999
      },
      {
        maxRows: 20,
        maxColumns: 24
      }
    );

    expect(clamped).toMatchObject({
      startRow: 0,
      startColumn: 0,
      endRow: 19,
      endColumn: 23
    });
  });

  it('应支持拖拽后从范围生成新锚点', () => {
    const nextRange: CanvasGridRange = {
      startRow: 3,
      startColumn: 5,
      endRow: 7,
      endColumn: 10
    };

    const anchor = canvasRangeToAnchor(nextRange);

    expect(anchor).toMatchObject({
      row: 4,
      col: 6,
      rowspan: 5,
      colspan: 6
    });
  });
});
