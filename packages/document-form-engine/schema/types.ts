export type DocumentPageSize = 'A4';

export interface DocumentTemplatePageConfig {
  size: DocumentPageSize;
  width: number;
  minHeight: number;
  padding: [number, number, number, number];
}

export interface DocumentTemplateGridConfig {
  columns: number;
  rowHeight: number;
}

export interface DocumentMaterialAnchor {
  row: number;
  col: number;
  rowspan: number;
  colspan: number;
}

export interface DocumentTemplateBinding {
  field: string;
  defaultValue?: unknown;
}

export interface DocumentMaterialNode<
  TType extends string = string,
  TProps extends Record<string, unknown> = Record<string, unknown>
> {
  id: string;
  type: TType;
  title: string;
  anchor: DocumentMaterialAnchor;
  props: TProps;
  binding?: DocumentTemplateBinding;
}

export interface DocumentTemplateSchema {
  version: '1';
  kind: 'dispatch-form';
  title: string;
  page: DocumentTemplatePageConfig;
  grid: DocumentTemplateGridConfig;
  materials: DocumentMaterialNode[];
  print: {
    showGrid: boolean;
  };
}

export interface DocumentTemplateSerializationResult {
  serialized: string;
  template: DocumentTemplateSchema;
}
