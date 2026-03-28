import { computed, ref } from 'vue';
import type {
  DocumentMaterialAnchor,
  DocumentMaterialNode,
  DocumentTemplateSchema
} from '../schema/types';
import type { DocumentMaterialDefinition } from '../materials/types';

function createAnchor(index: number): DocumentMaterialAnchor {
  return {
    row: index * 4 + 1,
    col: 1,
    rowspan: 4,
    colspan: 24
  };
}

export function createMaterialNode(
  definition: DocumentMaterialDefinition,
  index: number
): DocumentMaterialNode {
  return {
    id: `${definition.type}-${index + 1}`,
    type: definition.type,
    title: definition.label,
    anchor: {
      ...createAnchor(index),
      rowspan: definition.defaultSize.rowspan,
      colspan: definition.defaultSize.colspan
    },
    props: {
      ...definition.defaultProps
    }
  };
}

export function useDocumentDesignerState(
  templateRef: { value: DocumentTemplateSchema },
  materialsRef: { value: DocumentMaterialDefinition[] }
) {
  const selectedNodeId = ref<string | null>(templateRef.value.materials[0]?.id ?? null);

  const selectedNode = computed(
    () => templateRef.value.materials.find((item) => item.id === selectedNodeId.value) ?? null
  );

  const selectedDefinition = computed(() => {
    if (!selectedNode.value) {
      return null;
    }
    return materialsRef.value.find((item) => item.type === selectedNode.value?.type) ?? null;
  });

  function addMaterial(type: string) {
    const definition = materialsRef.value.find((item) => item.type === type);
    if (!definition) {
      return;
    }
    const nextNode = createMaterialNode(definition, templateRef.value.materials.length);
    templateRef.value.materials = [...templateRef.value.materials, nextNode];
    selectedNodeId.value = nextNode.id;
  }

  function selectNode(nodeId: string) {
    selectedNodeId.value = nodeId;
  }

  function removeSelectedNode() {
    if (!selectedNodeId.value) {
      return;
    }
    templateRef.value.materials = templateRef.value.materials.filter(
      (item) => item.id !== selectedNodeId.value
    );
    selectedNodeId.value = templateRef.value.materials[0]?.id ?? null;
  }

  function updateSelectedNodeProp(key: string, value: unknown) {
    if (!selectedNode.value) {
      return;
    }

    templateRef.value.materials = templateRef.value.materials.map((item) =>
      item.id === selectedNode.value?.id
        ? {
            ...item,
            props: {
              ...item.props,
              [key]: value
            }
          }
        : item
    );
  }

  function updateNodeAnchor(nodeId: string, anchor: DocumentMaterialAnchor) {
    templateRef.value.materials = templateRef.value.materials.map((item) =>
      item.id === nodeId
        ? {
            ...item,
            anchor: {
              ...anchor
            }
          }
        : item
    );
  }

  return {
    selectedNodeId,
    selectedNode,
    selectedDefinition,
    addMaterial,
    selectNode,
    removeSelectedNode,
    updateSelectedNodeProp,
    updateNodeAnchor
  };
}
