import type { DocumentTemplateSchema } from '../schema/types';
import type { CreateDocumentRuntimeRendererOptions, DocumentRuntimeRenderResult } from './renderer';
import { createDocumentRuntimeRenderer } from './renderer';

export interface DocumentSheetRenderer {
  buildSheetRenderModel(template: DocumentTemplateSchema): DocumentRuntimeRenderResult;
}

export type CreateDocumentSheetRendererOptions = CreateDocumentRuntimeRendererOptions;

export function createDocumentSheetRenderer(
  input?: CreateDocumentSheetRendererOptions
): DocumentSheetRenderer {
  const renderer = createDocumentRuntimeRenderer(input);

  return {
    buildSheetRenderModel(template: DocumentTemplateSchema) {
      return renderer.buildRenderModel(template);
    }
  };
}
