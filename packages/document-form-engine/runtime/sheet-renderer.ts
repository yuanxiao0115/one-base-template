import type { DocumentMaterialSheetStyleValue } from '../materials/sheet-style';
import type { DocumentMaterialNode } from '../schema/types';
import type {
  DocumentSheetMerge,
  DocumentSheetStyle,
  DocumentTemplateSheetConfig
} from '../schema/sheet';
import type { DocumentTemplateSchema } from '../schema/types';
import { getDocumentMaterialDefinition } from '../register/materials';
import {
  createDocumentFormEngineContext,
  type DocumentFormEngineContext
} from '../register/context';
import type { CreateDocumentRuntimeRendererOptions } from './renderer';

export interface DocumentSheetRenderCell {
  node: DocumentMaterialNode;
  definitionType: string;
  componentProps: Record<string, unknown>;
  sheetStyle: DocumentMaterialSheetStyleValue;
}

export interface DocumentSheetRenderModel extends DocumentTemplateSheetConfig {
  cells: DocumentSheetRenderCell[];
}

export interface DocumentSheetRenderer {
  buildSheetRenderModel(template: DocumentTemplateSchema): DocumentSheetRenderModel;
}

export type CreateDocumentSheetRendererOptions = CreateDocumentRuntimeRendererOptions;

function resolveRuntimeContext(
  input?: DocumentFormEngineContext | CreateDocumentSheetRendererOptions
) {
  if (input && 'values' in input) {
    return input;
  }

  return (
    input?.context ?? createDocumentFormEngineContext({ appId: 'document-form-sheet-runtime' })
  );
}

function stripStyleScope(style: DocumentSheetStyle): DocumentMaterialSheetStyleValue {
  return {
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

function isStyleMatchNode(style: DocumentSheetStyle, node: DocumentMaterialNode) {
  return (
    style.row === node.anchor.row &&
    style.col === node.anchor.col &&
    style.rowspan === node.anchor.rowspan &&
    style.colspan === node.anchor.colspan
  );
}

function cloneSheetMerges(merges: DocumentSheetMerge[]) {
  return merges.map((item) => ({
    ...item
  }));
}

function cloneSheetStyles(styles: DocumentSheetStyle[]) {
  return styles.map((item) => ({
    ...item,
    border: item.border
      ? {
          ...item.border
        }
      : undefined
  }));
}

export function createDocumentSheetRenderer(
  input?: DocumentFormEngineContext | CreateDocumentSheetRendererOptions
): DocumentSheetRenderer {
  const context = resolveRuntimeContext(input);

  function buildSheetRenderModel(template: DocumentTemplateSchema): DocumentSheetRenderModel {
    const cells: DocumentSheetRenderCell[] = template.materials
      .map((node) => {
        const definition = getDocumentMaterialDefinition(node.type, context);
        if (!definition) {
          return null;
        }

        const scopedStyle =
          template.sheet.styles.find((style) => isStyleMatchNode(style, node)) ?? null;
        const sheetStyle = scopedStyle
          ? stripStyleScope(scopedStyle)
          : {
              ...definition.stylePreset.style,
              border: definition.stylePreset.style.border
                ? {
                    ...definition.stylePreset.style.border
                  }
                : undefined
            };

        return {
          node,
          definitionType: definition.type,
          componentProps: {
            ...definition.defaultProps,
            ...node.props
          },
          sheetStyle
        };
      })
      .filter((item): item is DocumentSheetRenderCell => item !== null);

    return {
      rows: template.sheet.rows,
      columns: template.sheet.columns,
      rowHeights: {
        ...template.sheet.rowHeights
      },
      columnWidths: {
        ...template.sheet.columnWidths
      },
      merges: cloneSheetMerges(template.sheet.merges),
      styles: cloneSheetStyles(template.sheet.styles),
      viewport: {
        ...template.sheet.viewport
      },
      cells
    };
  }

  return {
    buildSheetRenderModel
  };
}
