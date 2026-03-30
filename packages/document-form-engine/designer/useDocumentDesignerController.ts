import { ref } from 'vue';

import type {
  DocumentFieldOption,
  DocumentFieldType,
  DocumentTemplateField,
  DocumentTemplatePlacement,
  DocumentTemplateSchema
} from '../schema/types';
import type { DocumentSheetRange } from '../schema/sheet';
import {
  createDesignerUniverSnapshotEnvelope,
  normalizeDocumentTemplate
} from '../schema/template';
import { useDocumentDesignerState } from './useDocumentDesignerState';

export interface DocumentDesignerControllerOptions {
  onTemplateChange?: (template: DocumentTemplateSchema) => void;
}

function cloneTemplate(template: DocumentTemplateSchema): DocumentTemplateSchema {
  return JSON.parse(JSON.stringify(template)) as DocumentTemplateSchema;
}

function safeSerialize(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
}

function isSameRange(a: DocumentSheetRange, b: DocumentSheetRange) {
  return a.row === b.row && a.col === b.col && a.rowspan === b.rowspan && a.colspan === b.colspan;
}

export function useDocumentDesignerController(
  initialTemplate: DocumentTemplateSchema,
  options: DocumentDesignerControllerOptions = {}
) {
  const template = ref<DocumentTemplateSchema>(normalizeDocumentTemplate(initialTemplate));
  const state = useDocumentDesignerState(template);

  function emitTemplateChange() {
    options.onTemplateChange?.(template.value);
  }

  function commitTemplateMutation(mutator: () => void) {
    template.value = cloneTemplate(template.value);
    mutator();
    emitTemplateChange();
  }

  function replaceTemplate(nextTemplate: DocumentTemplateSchema) {
    if (nextTemplate === template.value) {
      return;
    }

    template.value = normalizeDocumentTemplate(nextTemplate);
    state.syncSelectionState();
  }

  function selectRange(range: DocumentSheetRange) {
    state.setActiveRange(range);
  }

  function selectPlacement(placementId: string | null) {
    state.selectPlacement(placementId);
  }

  function insertField(type: DocumentFieldType) {
    commitTemplateMutation(() => {
      state.insertField(type);
    });
  }

  function updateField(patch: Partial<DocumentTemplateField>) {
    if (!state.selectedField.value) {
      return;
    }

    commitTemplateMutation(() => {
      state.updateSelectedField(patch);
    });
  }

  function updateFieldOptions(optionsList: DocumentFieldOption[]) {
    if (!state.selectedField.value) {
      return;
    }

    commitTemplateMutation(() => {
      state.updateSelectedFieldOptions(optionsList);
    });
  }

  function updatePlacement(
    patch: Partial<Pick<DocumentTemplatePlacement, 'displayMode' | 'section' | 'readonly'>>
  ) {
    if (!state.selectedPlacement.value) {
      return;
    }

    commitTemplateMutation(() => {
      state.updateSelectedPlacement(patch);
    });
  }

  function updatePlacementRange(placementId: string, range: DocumentSheetRange) {
    const currentPlacement = template.value.placements.find((item) => item.id === placementId);
    if (!currentPlacement || isSameRange(currentPlacement.range, range)) {
      return;
    }

    commitTemplateMutation(() => {
      state.updatePlacementRange(placementId, range);
      state.selectPlacement(placementId);
    });
  }

  function updateSheetViewport(patch: Partial<DocumentTemplateSchema['sheet']['viewport']>) {
    const currentViewport = template.value.sheet.viewport;
    const nextViewport = {
      ...currentViewport,
      ...patch
    };

    if (
      nextViewport.showGrid === currentViewport.showGrid &&
      nextViewport.zoom === currentViewport.zoom
    ) {
      return;
    }

    commitTemplateMutation(() => {
      state.updateSheetViewport(patch);
    });
  }

  function removeSelectedPlacement() {
    if (!state.selectedPlacement.value) {
      return;
    }

    commitTemplateMutation(() => {
      state.removeSelectedPlacement();
    });
  }

  function syncUniverSnapshot(snapshot: Record<string, unknown>) {
    const nextSnapshot = createDesignerUniverSnapshotEnvelope(snapshot);
    const currentHash = safeSerialize(template.value.designer?.univerSnapshot);
    const nextHash = safeSerialize(nextSnapshot);

    if (!nextHash || nextHash === currentHash) {
      return;
    }

    commitTemplateMutation(() => {
      template.value.designer = {
        ...template.value.designer,
        univerSnapshot: nextSnapshot
      };
    });
  }

  return {
    template,
    activeRange: state.activeRange,
    selectedPlacementId: state.selectedPlacementId,
    selectedPlacement: state.selectedPlacement,
    selectedField: state.selectedField,
    replaceTemplate,
    selectRange,
    selectPlacement,
    insertField,
    updateField,
    updateFieldOptions,
    updatePlacement,
    updatePlacementRange,
    updateSheetViewport,
    removeSelectedPlacement,
    syncUniverSnapshot
  };
}
