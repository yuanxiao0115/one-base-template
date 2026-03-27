import {
  createDocumentFormEngineContext,
  type DocumentFormEngineContext
} from '@one-base-template/document-form-engine';

export type DocumentFormEngineAdminContext = DocumentFormEngineContext;

function createDocumentFormEngineAdminContext() {
  return createDocumentFormEngineContext({
    appId: 'apps-admin-document-form-management'
  });
}

let documentFormEngineAdminContext: DocumentFormEngineAdminContext =
  createDocumentFormEngineAdminContext();

export function getDocumentFormEngineAdminContext() {
  return documentFormEngineAdminContext;
}

export function resetDocumentFormEngineAdminContextForTesting() {
  documentFormEngineAdminContext = createDocumentFormEngineAdminContext();
  return documentFormEngineAdminContext;
}
