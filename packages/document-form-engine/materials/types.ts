import type { Component } from 'vue';
import type { DocumentMaterialNode } from '../schema/types';

export type DocumentMaterialFieldType = 'text' | 'textarea' | 'number' | 'boolean' | 'select';

export interface DocumentMaterialFieldOption {
  label: string;
  value: string;
}

export interface DocumentMaterialFieldSchema {
  key: string;
  label: string;
  type: DocumentMaterialFieldType;
  placeholder?: string;
  options?: DocumentMaterialFieldOption[];
  min?: number;
  max?: number;
}

export interface DocumentMaterialRenderContext {
  mode: 'designer' | 'runtime' | 'print';
}

export interface DocumentResolvedMaterialNode extends DocumentMaterialNode {
  componentProps: Record<string, unknown>;
}

export interface DocumentMaterialDefinition<
  TType extends string = string,
  TProps extends Record<string, unknown> = Record<string, unknown>
> {
  type: TType;
  label: string;
  description: string;
  icon: string;
  defaultSize: {
    rowspan: number;
    colspan: number;
  };
  defaultProps: TProps;
  propertySchema: DocumentMaterialFieldSchema[];
  designerPreview: Component;
  runtimeRenderer: Component;
  printRenderer: Component;
}
