import { DEFAULT_DOCUMENT_MATERIALS } from '../materials/default-materials';
import type { DocumentMaterialDefinition } from '../materials/types';
import type { DocumentFormEngineContext } from './context';
import { readDocumentContextValue } from './context';

const DOCUMENT_MATERIALS_KEY = Symbol('document-form-engine-materials');

export function getDocumentMaterials(context: DocumentFormEngineContext) {
  return readDocumentContextValue<DocumentMaterialDefinition[]>(
    DOCUMENT_MATERIALS_KEY,
    context,
    () => [...DEFAULT_DOCUMENT_MATERIALS]
  );
}

export function registerDocumentMaterials(
  context: DocumentFormEngineContext,
  materials: DocumentMaterialDefinition[]
) {
  const current = getDocumentMaterials(context);
  const nextByType = new Map(current.map((item) => [item.type, item]));

  materials.forEach((item) => {
    nextByType.set(item.type, item);
  });

  const next = [...nextByType.values()];
  context.values.set(DOCUMENT_MATERIALS_KEY, next);
  return next;
}

export function getDocumentMaterialDefinition(type: string, context: DocumentFormEngineContext) {
  return getDocumentMaterials(context).find((item) => item.type === type) ?? null;
}
