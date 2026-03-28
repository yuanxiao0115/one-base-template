import type { DocumentSheetBorderSide, DocumentSheetStyle } from '../schema/sheet';

export interface DocumentMaterialSheetLayoutRegion {
  key: string;
  rowOffset: number;
  colOffset: number;
  rowspan: number;
  colspan: number;
  merge?: boolean;
}

export interface DocumentMaterialSheetLayout {
  regions: DocumentMaterialSheetLayoutRegion[];
}

export type DocumentMaterialSheetStyleValue = Omit<
  DocumentSheetStyle,
  'row' | 'col' | 'rowspan' | 'colspan'
>;

export interface DocumentMaterialStylePreset {
  key: string;
  label: string;
  style: DocumentMaterialSheetStyleValue;
}

export interface CreateMaterialStylePresetOptions {
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: DocumentSheetBorderSide['style'];
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: DocumentSheetStyle['fontWeight'];
  horizontalAlign?: DocumentSheetStyle['horizontalAlign'];
  verticalAlign?: DocumentSheetStyle['verticalAlign'];
  wrap?: boolean;
}

export const DEFAULT_MATERIAL_BORDER_COLOR = '#cbd5e1';
export const DEFAULT_MATERIAL_BACKGROUND_COLOR = '#ffffff';

function createBorder(color: string, width: number, style: DocumentSheetBorderSide['style']) {
  return {
    color,
    width,
    style
  } as DocumentSheetBorderSide;
}

export function createDefaultMaterialSheetLayout(
  rowspan: number,
  colspan: number
): DocumentMaterialSheetLayout {
  return {
    regions: [
      {
        key: 'main',
        rowOffset: 0,
        colOffset: 0,
        rowspan: Math.max(1, Math.round(rowspan)),
        colspan: Math.max(1, Math.round(colspan))
      }
    ]
  };
}

export function createDocumentMaterialStylePreset(
  key: string,
  label: string,
  options: CreateMaterialStylePresetOptions = {}
): DocumentMaterialStylePreset {
  const borderColor = options.borderColor ?? DEFAULT_MATERIAL_BORDER_COLOR;
  const borderWidth = Math.max(1, Math.round(options.borderWidth ?? 1));
  const borderStyle = options.borderStyle ?? 'solid';
  const border = createBorder(borderColor, borderWidth, borderStyle);

  return {
    key,
    label,
    style: {
      backgroundColor: options.backgroundColor ?? DEFAULT_MATERIAL_BACKGROUND_COLOR,
      textColor: options.textColor ?? '#0f172a',
      fontSize: Math.max(10, Math.round(options.fontSize ?? 12)),
      fontWeight: options.fontWeight ?? 'normal',
      horizontalAlign: options.horizontalAlign ?? 'left',
      verticalAlign: options.verticalAlign ?? 'middle',
      wrap: options.wrap ?? true,
      border: {
        top: border,
        right: border,
        bottom: border,
        left: border
      }
    }
  };
}

export const DEFAULT_DOCUMENT_MATERIAL_STYLE_PRESET = createDocumentMaterialStylePreset(
  'default',
  '基础样式'
);
