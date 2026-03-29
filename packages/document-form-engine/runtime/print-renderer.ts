import type { DocumentTemplateSchema } from '../schema/types';
import type {
  CreateDocumentRuntimeRendererOptions,
  DocumentRuntimeRenderResult,
  DocumentRuntimeRenderer
} from './renderer';
import { createDocumentRuntimeRenderer } from './renderer';

export interface DocumentPrintRenderer {
  buildPrintModel(template: DocumentTemplateSchema): DocumentRuntimeRenderResult;
}

export type CreateDocumentPrintRendererOptions = CreateDocumentRuntimeRendererOptions;

export function createDocumentPrintRenderer(
  input?: CreateDocumentPrintRendererOptions
): DocumentPrintRenderer {
  const runtimeRenderer: DocumentRuntimeRenderer = createDocumentRuntimeRenderer(input);

  return {
    buildPrintModel(template: DocumentTemplateSchema) {
      return runtimeRenderer.buildRenderModel(template);
    }
  };
}
