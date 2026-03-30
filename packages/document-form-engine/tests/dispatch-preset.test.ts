import { describe, expect, it } from 'vite-plus/test';

import { createDispatchDocumentTemplate } from '../schema/template';
import type { DocumentSheetRange } from '../schema/sheet';

function isSameRange(a: DocumentSheetRange, b: DocumentSheetRange) {
  return a.row === b.row && a.col === b.col && a.rowspan === b.rowspan && a.colspan === b.colspan;
}

function isRangeOverlapping(a: DocumentSheetRange, b: DocumentSheetRange) {
  const aEndRow = a.row + a.rowspan - 1;
  const aEndCol = a.col + a.colspan - 1;
  const bEndRow = b.row + b.rowspan - 1;
  const bEndCol = b.col + b.colspan - 1;

  return !(aEndRow < b.row || bEndRow < a.row || aEndCol < b.col || bEndCol < a.col);
}

describe('dispatch form preset', () => {
  it('应生成发文单首发模板', () => {
    const template = createDispatchDocumentTemplate();

    expect(template.title).toContain('发文单');
    expect(template.fields.map((item) => item.type)).toEqual(
      expect.arrayContaining(['serialNo', 'richText', 'attachment', 'opinion', 'stamp'])
    );
    expect(template.placements.length).toBe(template.fields.length);
    expect(template.sheet.merges.length).toBeGreaterThan(0);
    expect(template.sheet.cells.some((item) => String(item.value).includes('主送'))).toBe(true);
  });

  it('用于画布渲染的合并区域不应互相重叠', () => {
    const template = createDispatchDocumentTemplate();
    const mergedRanges = [
      ...template.sheet.merges,
      ...template.sheet.cells.filter((item) => item.rowspan > 1 || item.colspan > 1),
      ...template.placements
        .map((item) => item.range)
        .filter((item) => item.rowspan > 1 || item.colspan > 1)
    ];

    for (let index = 0; index < mergedRanges.length; index += 1) {
      const current = mergedRanges[index]!;
      for (let nextIndex = index + 1; nextIndex < mergedRanges.length; nextIndex += 1) {
        const next = mergedRanges[nextIndex]!;
        if (isSameRange(current, next)) {
          continue;
        }

        expect(
          isRangeOverlapping(current, next),
          `范围冲突: [${current.row},${current.col},${current.rowspan},${current.colspan}] vs [${next.row},${next.col},${next.rowspan},${next.colspan}]`
        ).toBe(false);
      }
    }
  });
});
