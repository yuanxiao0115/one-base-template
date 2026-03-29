import type { Component } from 'vue';

import type {
  DocumentSheetCell,
  DocumentSheetImage,
  DocumentSheetRange,
  DocumentSheetStyle
} from '../schema/sheet';
import type {
  DocumentFieldOption,
  DocumentTemplateField,
  DocumentTemplatePlacement,
  DocumentTemplateSchema
} from '../schema/types';
import {
  createDocumentFormEngineContext,
  type DocumentFormEngineContext
} from '../register/context';
import { getDocumentFieldWidgetDefinition } from '../register/field-widgets';

export interface DocumentRuntimeResolvedPlacement {
  placement: DocumentTemplatePlacement;
  field: DocumentTemplateField;
  runtimeRenderer: Component;
  previewRenderer: Component;
  printRenderer: Component;
  componentProps: Record<string, unknown>;
  options: DocumentFieldOption[];
}

export interface DocumentRuntimeRenderCell {
  key: string;
  row: number;
  col: number;
  rowspan: number;
  colspan: number;
  value: string;
  style: DocumentSheetStyle | null;
  placement: DocumentRuntimeResolvedPlacement | null;
}

export interface DocumentRuntimeRenderRow {
  index: number;
  height: number;
  cells: DocumentRuntimeRenderCell[];
}

export interface DocumentRuntimeRenderResult {
  title: string;
  page: DocumentTemplateSchema['page'];
  sheet: DocumentTemplateSchema['sheet'];
  rows: DocumentRuntimeRenderRow[];
  images: DocumentSheetImage[];
}

export interface DocumentRuntimeRenderer {
  buildRenderModel(template: DocumentTemplateSchema): DocumentRuntimeRenderResult;
}

export interface CreateDocumentRuntimeRendererOptions {
  context?: DocumentFormEngineContext;
}

function resolveRuntimeContext(
  input?: DocumentFormEngineContext | CreateDocumentRuntimeRendererOptions
) {
  if (input && 'values' in input) {
    return input;
  }

  return input?.context ?? createDocumentFormEngineContext({ appId: 'document-form-runtime' });
}

function isRangeRoot(range: DocumentSheetRange, row: number, col: number) {
  return range.row === row && range.col === col;
}

function isRangeCoveringCell(range: DocumentSheetRange, row: number, col: number) {
  return (
    row >= range.row &&
    row <= range.row + range.rowspan - 1 &&
    col >= range.col &&
    col <= range.col + range.colspan - 1
  );
}

function mergeStyleRange(style: DocumentSheetStyle): DocumentSheetStyle {
  return {
    row: style.row,
    col: style.col,
    rowspan: style.rowspan,
    colspan: style.colspan,
    backgroundColor: style.backgroundColor,
    textColor: style.textColor,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    horizontalAlign: style.horizontalAlign,
    verticalAlign: style.verticalAlign,
    wrap: style.wrap,
    border: style.border
      ? {
          ...style.border
        }
      : undefined
  };
}

function resolveStyle(styles: DocumentSheetStyle[], row: number, col: number) {
  const matched = styles.filter((item) => isRangeCoveringCell(item, row, col));
  if (matched.length === 0) {
    return null;
  }

  return matched.reduce<DocumentSheetStyle | null>((result, current) => {
    if (!result) {
      return mergeStyleRange(current);
    }

    return {
      ...result,
      ...mergeStyleRange(current),
      border: current.border
        ? {
            ...result.border,
            ...current.border
          }
        : result.border
    };
  }, null);
}

function resolveSpan(
  row: number,
  col: number,
  merges: DocumentSheetRange[],
  cells: DocumentSheetCell[],
  placements: DocumentTemplatePlacement[]
) {
  const merge = merges.find((item) => isRangeRoot(item, row, col));
  if (merge) {
    return {
      rowspan: merge.rowspan,
      colspan: merge.colspan
    };
  }

  const cell = cells.find((item) => isRangeRoot(item, row, col));
  if (cell) {
    return {
      rowspan: cell.rowspan,
      colspan: cell.colspan
    };
  }

  const placement = placements.find((item) => isRangeRoot(item.range, row, col));
  if (placement) {
    return {
      rowspan: placement.range.rowspan,
      colspan: placement.range.colspan
    };
  }

  return {
    rowspan: 1,
    colspan: 1
  };
}

function buildSkipMap(
  rows: number,
  columns: number,
  merges: DocumentSheetRange[],
  cells: DocumentSheetCell[],
  placements: DocumentTemplatePlacement[]
) {
  const hidden = new Set<string>();
  const ranges = [
    ...merges,
    ...cells.filter((item) => item.rowspan > 1 || item.colspan > 1),
    ...placements.map((item) => item.range).filter((item) => item.rowspan > 1 || item.colspan > 1)
  ];

  ranges.forEach((range) => {
    for (let row = range.row; row <= range.row + range.rowspan - 1; row += 1) {
      for (let col = range.col; col <= range.col + range.colspan - 1; col += 1) {
        if (row === range.row && col === range.col) {
          continue;
        }
        if (row > rows || col > columns) {
          continue;
        }
        hidden.add(`${row}:${col}`);
      }
    }
  });

  return hidden;
}

export function createDocumentRuntimeRenderer(
  input?: DocumentFormEngineContext | CreateDocumentRuntimeRendererOptions
): DocumentRuntimeRenderer {
  const context = resolveRuntimeContext(input);

  function buildRenderModel(template: DocumentTemplateSchema): DocumentRuntimeRenderResult {
    const skipMap = buildSkipMap(
      template.sheet.rows,
      template.sheet.columns,
      template.sheet.merges,
      template.sheet.cells,
      template.placements
    );

    const rows: DocumentRuntimeRenderRow[] = [];
    const fieldById = new Map(template.fields.map((item) => [item.id, item]));

    for (let rowIndex = 1; rowIndex <= template.sheet.rows; rowIndex += 1) {
      const rowCells: DocumentRuntimeRenderCell[] = [];

      for (let colIndex = 1; colIndex <= template.sheet.columns; colIndex += 1) {
        if (skipMap.has(`${rowIndex}:${colIndex}`)) {
          continue;
        }

        const staticCell = template.sheet.cells.find((item) =>
          isRangeRoot(item, rowIndex, colIndex)
        );
        const placement = template.placements.find((item) =>
          isRangeRoot(item.range, rowIndex, colIndex)
        );
        const resolvedField = placement ? (fieldById.get(placement.fieldId) ?? null) : null;
        const widget = resolvedField
          ? getDocumentFieldWidgetDefinition(resolvedField.type, context)
          : null;
        const span = resolveSpan(
          rowIndex,
          colIndex,
          template.sheet.merges,
          template.sheet.cells,
          template.placements
        );

        rowCells.push({
          key: `${rowIndex}:${colIndex}`,
          row: rowIndex,
          col: colIndex,
          rowspan: span.rowspan,
          colspan: span.colspan,
          value: staticCell?.value ?? '',
          style: resolveStyle(template.sheet.styles, rowIndex, colIndex),
          placement:
            resolvedField && widget
              ? {
                  placement: placement!,
                  field: resolvedField,
                  runtimeRenderer: widget.runtimeRenderer,
                  previewRenderer: widget.previewRenderer,
                  printRenderer: widget.printRenderer,
                  componentProps: {
                    ...widget.defaultWidgetProps,
                    ...resolvedField.widgetProps
                  },
                  options: resolvedField.dataSource?.options ?? []
                }
              : null
        });
      }

      rows.push({
        index: rowIndex,
        height: template.sheet.rowHeights[String(rowIndex)] ?? 28,
        cells: rowCells
      });
    }

    return {
      title: template.title,
      page: template.page,
      sheet: template.sheet,
      rows,
      images: [...template.sheet.images]
    };
  }

  return {
    buildRenderModel
  };
}
