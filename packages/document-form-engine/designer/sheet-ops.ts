import type { DocumentSheetMerge, DocumentSheetRange, DocumentSheetStyle } from '../schema/sheet';

export type DocumentSheetStylePatch = Omit<
  DocumentSheetStyle,
  'row' | 'col' | 'rowspan' | 'colspan'
>;

function isSameRange(a: DocumentSheetRange, b: DocumentSheetRange) {
  return a.row === b.row && a.col === b.col && a.rowspan === b.rowspan && a.colspan === b.colspan;
}

function toSheetStyle(range: DocumentSheetRange, value: DocumentSheetStylePatch) {
  return {
    row: range.row,
    col: range.col,
    rowspan: range.rowspan,
    colspan: range.colspan,
    ...value,
    border: value.border
      ? {
          ...value.border
        }
      : undefined
  } as DocumentSheetStyle;
}

export function applySheetStyleToAnchor(
  styles: DocumentSheetStyle[],
  range: DocumentSheetRange,
  value: DocumentSheetStylePatch
) {
  const scopedStyle = toSheetStyle(range, value);
  const targetIndex = styles.findIndex((item) => isSameRange(item, range));

  if (targetIndex < 0) {
    return [...styles, scopedStyle];
  }

  return styles.map((item, index) => (index === targetIndex ? scopedStyle : item));
}

export function addSheetMergeByAnchor(merges: DocumentSheetMerge[], range: DocumentSheetRange) {
  const exists = merges.some((item) => isSameRange(item, range));

  if (exists) {
    return [...merges];
  }

  return [
    ...merges,
    {
      row: range.row,
      col: range.col,
      rowspan: range.rowspan,
      colspan: range.colspan
    }
  ];
}

export function removeSheetMergeAt(merges: DocumentSheetMerge[], index: number) {
  if (index < 0 || index >= merges.length) {
    return [...merges];
  }

  return merges.filter((_, currentIndex) => currentIndex !== index);
}
