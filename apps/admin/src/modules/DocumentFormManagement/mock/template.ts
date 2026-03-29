import {
  createDispatchDocumentTemplate,
  type DocumentTemplateSchema
} from '@one-base-template/document-form-engine';

export function createMockDocumentTemplate(): DocumentTemplateSchema {
  return createDispatchDocumentTemplate();
}
