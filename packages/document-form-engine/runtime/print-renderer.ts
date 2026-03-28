import type { DocumentTemplateSchema } from '../schema/types';
import type { DocumentFormEngineContext } from '../register/context';
import {
  createDocumentSheetRenderer,
  type CreateDocumentSheetRendererOptions,
  type DocumentSheetRenderModel
} from './sheet-renderer';

export interface DocumentPrintRenderer {
  buildPrintModel(template: DocumentTemplateSchema): DocumentSheetRenderModel;
}

export type CreateDocumentPrintRendererOptions = CreateDocumentSheetRendererOptions;

export function createDocumentPrintRenderer(
  input?: DocumentFormEngineContext | CreateDocumentPrintRendererOptions
): DocumentPrintRenderer {
  const sheetRenderer = createDocumentSheetRenderer(input);

  return {
    buildPrintModel(template: DocumentTemplateSchema) {
      return sheetRenderer.buildSheetRenderModel(template);
    }
  };
}
