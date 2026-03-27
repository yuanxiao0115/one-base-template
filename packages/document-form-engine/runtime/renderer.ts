import type { DocumentMaterialNode, DocumentTemplateSchema } from '../schema/types';
import type { DocumentResolvedMaterialNode } from '../materials/types';
import { getDocumentMaterialDefinition } from '../register/materials';
import {
  createDocumentFormEngineContext,
  type DocumentFormEngineContext
} from '../register/context';

export interface DocumentRuntimeRenderResult {
  node: DocumentMaterialNode;
  definitionType: string;
  componentProps: Record<string, unknown>;
}

export interface DocumentRuntimeRenderer {
  resolveNode(node: DocumentMaterialNode): DocumentRuntimeRenderResult | null;
  buildRenderModel(template: DocumentTemplateSchema): DocumentResolvedMaterialNode[];
}

export interface CreateDocumentRuntimeRendererOptions {
  context?: DocumentFormEngineContext;
}

function resolveRuntimeContext(
  input?: DocumentFormEngineContext | CreateDocumentRuntimeRendererOptions
) {
  if (input && 'values' in input) {
    return input;
  }

  return input?.context ?? createDocumentFormEngineContext({ appId: 'document-form-runtime' });
}

export function createDocumentRuntimeRenderer(
  input?: DocumentFormEngineContext | CreateDocumentRuntimeRendererOptions
): DocumentRuntimeRenderer {
  const context = resolveRuntimeContext(input);

  function resolveNode(node: DocumentMaterialNode): DocumentRuntimeRenderResult | null {
    const definition = getDocumentMaterialDefinition(node.type, context);
    if (!definition) {
      return null;
    }

    return {
      node,
      definitionType: definition.type,
      componentProps: {
        ...definition.defaultProps,
        ...node.props
      }
    };
  }

  function buildRenderModel(template: DocumentTemplateSchema): DocumentResolvedMaterialNode[] {
    return template.materials
      .map((node) => {
        const result = resolveNode(node);
        if (!result) {
          return null;
        }

        return {
          ...node,
          props: result.componentProps,
          componentProps: result.componentProps
        };
      })
      .filter((item): item is DocumentResolvedMaterialNode => item !== null);
  }

  return {
    resolveNode,
    buildRenderModel
  };
}
