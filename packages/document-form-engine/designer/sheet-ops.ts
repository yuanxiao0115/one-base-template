import type { DocumentMaterialSheetStyleValue } from '../materials/sheet-style';
import type { DocumentSheetMerge, DocumentSheetStyle } from '../schema/sheet';
import type { DocumentMaterialAnchor } from '../schema/types';

function isSameRange(
  row: number,
  col: number,
  rowspan: number,
  colspan: number,
  anchor: DocumentMaterialAnchor
) {
  return (
    row === anchor.row &&
    col === anchor.col &&
    rowspan === anchor.rowspan &&
    colspan === anchor.colspan
  );
}

function toSheetStyle(anchor: DocumentMaterialAnchor, value: DocumentMaterialSheetStyleValue) {
  const border = value.border
    ? {
        ...value.border
      }
    : undefined;

  return {
    row: anchor.row,
    col: anchor.col,
    rowspan: anchor.rowspan,
    colspan: anchor.colspan,
    ...value,
    border
  } as DocumentSheetStyle;
}

export function applySheetStyleToAnchor(
  styles: DocumentSheetStyle[],
  anchor: DocumentMaterialAnchor,
  value: DocumentMaterialSheetStyleValue
) {
  const scopedStyle = toSheetStyle(anchor, value);
  const targetIndex = styles.findIndex((item) =>
    isSameRange(item.row, item.col, item.rowspan, item.colspan, anchor)
  );

  if (targetIndex < 0) {
    return [...styles, scopedStyle];
  }

  return styles.map((item, index) => (index === targetIndex ? scopedStyle : item));
}

export function addSheetMergeByAnchor(
  merges: DocumentSheetMerge[],
  anchor: DocumentMaterialAnchor
) {
  const exists = merges.some((item) =>
    isSameRange(item.row, item.col, item.rowspan, item.colspan, anchor)
  );

  if (exists) {
    return [...merges];
  }

  return [
    ...merges,
    {
      row: anchor.row,
      col: anchor.col,
      rowspan: anchor.rowspan,
      colspan: anchor.colspan
    }
  ];
}

export function removeSheetMergeAt(merges: DocumentSheetMerge[], index: number) {
  if (index < 0 || index >= merges.length) {
    return [...merges];
  }

  return merges.filter((_, currentIndex) => currentIndex !== index);
}
