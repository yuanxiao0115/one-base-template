import type { DocumentTemplateSheetConfig, DocumentSheetRange } from './sheet';

export type DocumentPageSize = 'A4';

export interface DocumentTemplatePageConfig {
  size: DocumentPageSize;
  width: number;
  minHeight: number;
  padding: [number, number, number, number];
}

export type DocumentFieldType =
  | 'text'
  | 'textarea'
  | 'richText'
  | 'number'
  | 'amount'
  | 'date'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'person'
  | 'department'
  | 'attachment'
  | 'opinion'
  | 'stamp'
  | 'serialNo';

export interface DocumentFieldOption {
  label: string;
  value: string;
}

export interface DocumentFieldRule {
  type: 'required' | 'min' | 'max' | 'pattern';
  value?: unknown;
  message?: string;
}

export interface DocumentFieldBinding {
  key: string;
  path?: string;
}

export interface DocumentFieldDataSource {
  kind: 'static';
  options: DocumentFieldOption[];
}

export interface DocumentTemplateField {
  id: string;
  type: DocumentFieldType;
  label: string;
  defaultValue?: unknown;
  required?: boolean;
  rules?: DocumentFieldRule[];
  widgetProps?: Record<string, unknown>;
  binding?: DocumentFieldBinding;
  dataSource?: DocumentFieldDataSource;
}

export type DocumentPlacementDisplayMode =
  | 'singleCell'
  | 'mergedRange'
  | 'inlineText'
  | 'imageSlot'
  | 'tableRegion';

export type DocumentTemplateSection =
  | 'header'
  | 'recipient'
  | 'body'
  | 'opinion'
  | 'attachment'
  | 'footer'
  | 'meta';

export interface DocumentTemplatePlacement {
  id: string;
  fieldId: string;
  range: DocumentSheetRange;
  displayMode: DocumentPlacementDisplayMode;
  section?: DocumentTemplateSection;
  readonly?: boolean;
}

export interface DocumentTemplatePresetDescriptor {
  key: 'dispatch-form';
  label: string;
  version: string;
}

export interface DocumentTemplateSchema {
  version: '3';
  kind: 'dispatch-form';
  title: string;
  page: DocumentTemplatePageConfig;
  print: {
    showGrid: boolean;
  };
  preset: DocumentTemplatePresetDescriptor;
  sheet: DocumentTemplateSheetConfig;
  fields: DocumentTemplateField[];
  placements: DocumentTemplatePlacement[];
}

export interface DocumentTemplateSerializationResult {
  serialized: string;
  template: DocumentTemplateSchema;
}

export type AnyDocumentTemplateSchema = DocumentTemplateSchema;

export type DocumentMaterialAnchor = DocumentSheetRange;
