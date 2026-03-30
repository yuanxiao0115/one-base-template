import { computed, ref } from 'vue';

import type {
  DocumentFieldOption,
  DocumentFieldType,
  DocumentTemplateField,
  DocumentTemplatePlacement,
  DocumentTemplateSchema
} from '../schema/types';
import type { DocumentSheetRange } from '../schema/sheet';
import { addSheetMergeByAnchor, applySheetStyleToAnchor, removeSheetMergeAt } from './sheet-ops';

export interface DocumentDesignerFieldBlueprint {
  type: DocumentFieldType;
  label: string;
  displayMode: DocumentTemplatePlacement['displayMode'];
}

export const DOCUMENT_DESIGNER_FIELD_BLUEPRINTS: DocumentDesignerFieldBlueprint[] = [
  { type: 'text', label: '文本', displayMode: 'singleCell' },
  { type: 'textarea', label: '多行文本', displayMode: 'mergedRange' },
  { type: 'richText', label: '富文本正文', displayMode: 'mergedRange' },
  { type: 'date', label: '日期', displayMode: 'singleCell' },
  { type: 'person', label: '人员', displayMode: 'singleCell' },
  { type: 'department', label: '部门', displayMode: 'singleCell' },
  { type: 'attachment', label: '附件', displayMode: 'mergedRange' },
  { type: 'opinion', label: '意见区', displayMode: 'mergedRange' },
  { type: 'stamp', label: '签章', displayMode: 'imageSlot' },
  { type: 'serialNo', label: '编号', displayMode: 'singleCell' }
];

function createInitialRange(): DocumentSheetRange {
  return {
    row: 1,
    col: 1,
    rowspan: 1,
    colspan: 1
  };
}

function cloneRange(range: DocumentSheetRange): DocumentSheetRange {
  return {
    row: range.row,
    col: range.col,
    rowspan: range.rowspan,
    colspan: range.colspan
  };
}

function isSameRange(a: DocumentSheetRange, b: DocumentSheetRange) {
  return a.row === b.row && a.col === b.col && a.rowspan === b.rowspan && a.colspan === b.colspan;
}

function createFieldDefaults(type: DocumentFieldType): Partial<DocumentTemplateField> {
  switch (type) {
    case 'textarea':
      return {
        widgetProps: {
          placeholder: '请输入内容',
          rows: 4
        }
      };
    case 'richText':
      return {
        widgetProps: {
          placeholder: '请输入正文'
        }
      };
    case 'attachment':
      return {
        widgetProps: {
          maxCount: 9
        }
      };
    case 'opinion':
      return {
        widgetProps: {
          rows: 4
        }
      };
    case 'person':
    case 'department':
    case 'serialNo':
    case 'text':
      return {
        widgetProps: {
          placeholder: '请输入'
        }
      };
    default:
      return {
        widgetProps: {}
      };
  }
}

function createFieldId(template: DocumentTemplateSchema, type: DocumentFieldType) {
  const count = template.fields.filter((item) => item.type === type).length + 1;
  return `${type}-${count}`;
}

function createPlacementId(template: DocumentTemplateSchema, type: DocumentFieldType) {
  const count =
    template.placements.filter((item) => item.id.startsWith(`placement-${type}`)).length + 1;
  return `placement-${type}-${count}`;
}

function findBlueprint(type: DocumentFieldType) {
  return DOCUMENT_DESIGNER_FIELD_BLUEPRINTS.find((item) => item.type === type) ?? null;
}

export function useDocumentDesignerState(templateRef: { value: DocumentTemplateSchema }) {
  const activeRange = ref<DocumentSheetRange>(createInitialRange());
  const selectedPlacementId = ref<string | null>(templateRef.value.placements[0]?.id ?? null);

  const selectedPlacement = computed(
    () => templateRef.value.placements.find((item) => item.id === selectedPlacementId.value) ?? null
  );
  const selectedField = computed(() => {
    if (!selectedPlacement.value) {
      return null;
    }

    return (
      templateRef.value.fields.find((item) => item.id === selectedPlacement.value?.fieldId) ?? null
    );
  });

  function setActiveRange(range: DocumentSheetRange) {
    activeRange.value = cloneRange(range);
  }

  function syncSelectionState() {
    const currentPlacement = templateRef.value.placements.find(
      (item) => item.id === selectedPlacementId.value
    );
    if (currentPlacement) {
      activeRange.value = cloneRange(currentPlacement.range);
      return;
    }

    const nextPlacement = templateRef.value.placements[0] ?? null;
    selectedPlacementId.value = nextPlacement?.id ?? null;
    activeRange.value = nextPlacement ? cloneRange(nextPlacement.range) : createInitialRange();
  }

  function selectPlacement(placementId: string | null) {
    selectedPlacementId.value = placementId;

    const placement = templateRef.value.placements.find((item) => item.id === placementId) ?? null;
    if (placement) {
      activeRange.value = cloneRange(placement.range);
    }
  }

  function insertField(type: DocumentFieldType) {
    const blueprint = findBlueprint(type);
    if (!blueprint) {
      return;
    }

    const fieldId = createFieldId(templateRef.value, type);
    const placementId = createPlacementId(templateRef.value, type);
    const nextRange = cloneRange(activeRange.value);
    const field: DocumentTemplateField = {
      id: fieldId,
      type,
      label: blueprint.label,
      required: false,
      ...createFieldDefaults(type)
    };

    templateRef.value.fields = [...templateRef.value.fields, field];
    templateRef.value.placements = [
      ...templateRef.value.placements,
      {
        id: placementId,
        fieldId,
        range: nextRange,
        displayMode: blueprint.displayMode
      }
    ];

    if (nextRange.rowspan > 1 || nextRange.colspan > 1) {
      templateRef.value.sheet.merges = addSheetMergeByAnchor(
        templateRef.value.sheet.merges,
        nextRange
      );
    }

    selectedPlacementId.value = placementId;
  }

  function updateSelectedField(patch: Partial<DocumentTemplateField>) {
    if (!selectedField.value) {
      return;
    }

    templateRef.value.fields = templateRef.value.fields.map((item) =>
      item.id === selectedField.value?.id
        ? {
            ...item,
            ...patch,
            widgetProps:
              patch.widgetProps || item.widgetProps
                ? {
                    ...item.widgetProps,
                    ...patch.widgetProps
                  }
                : undefined,
            dataSource: patch.dataSource === undefined ? item.dataSource : patch.dataSource
          }
        : item
    );
  }

  function updateSelectedFieldOptions(options: DocumentFieldOption[]) {
    if (!selectedField.value) {
      return;
    }

    updateSelectedField({
      dataSource: {
        kind: 'static',
        options
      }
    });
  }

  function updatePlacementRange(placementId: string, range: DocumentSheetRange) {
    templateRef.value.placements = templateRef.value.placements.map((item) =>
      item.id === placementId
        ? {
            ...item,
            range: cloneRange(range)
          }
        : item
    );

    if (selectedPlacementId.value === placementId) {
      activeRange.value = cloneRange(range);
    }
  }

  function updateSelectedPlacement(
    patch: Partial<Pick<DocumentTemplatePlacement, 'displayMode' | 'section' | 'readonly'>>
  ) {
    if (!selectedPlacement.value) {
      return;
    }

    templateRef.value.placements = templateRef.value.placements.map((item) =>
      item.id === selectedPlacement.value?.id
        ? {
            ...item,
            ...patch
          }
        : item
    );
  }

  function updateSheetViewport(patch: Partial<DocumentTemplateSchema['sheet']['viewport']>) {
    const currentViewport = templateRef.value.sheet.viewport;
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

    templateRef.value.sheet.viewport = nextViewport;
  }

  function applyStyleToActiveRange(patch: Parameters<typeof applySheetStyleToAnchor>[2]) {
    templateRef.value.sheet.styles = applySheetStyleToAnchor(
      templateRef.value.sheet.styles,
      activeRange.value,
      patch
    );
  }

  function addMergeForActiveRange() {
    templateRef.value.sheet.merges = addSheetMergeByAnchor(
      templateRef.value.sheet.merges,
      activeRange.value
    );
  }

  function removeMerge(index: number) {
    templateRef.value.sheet.merges = removeSheetMergeAt(templateRef.value.sheet.merges, index);
  }

  function removeSelectedPlacement() {
    if (!selectedPlacement.value) {
      return;
    }

    const placementId = selectedPlacement.value.id;
    const fieldId = selectedPlacement.value.fieldId;
    const placementRange = selectedPlacement.value.range;

    templateRef.value.placements = templateRef.value.placements.filter(
      (item) => item.id !== placementId
    );
    templateRef.value.sheet.merges = templateRef.value.sheet.merges.filter(
      (item) => !isSameRange(item, placementRange)
    );
    templateRef.value.sheet.styles = templateRef.value.sheet.styles.filter(
      (item) => !isSameRange(item, placementRange)
    );

    if (!templateRef.value.placements.some((item) => item.fieldId === fieldId)) {
      templateRef.value.fields = templateRef.value.fields.filter((item) => item.id !== fieldId);
    }

    syncSelectionState();
  }

  return {
    activeRange,
    selectedPlacementId,
    selectedPlacement,
    selectedField,
    setActiveRange,
    syncSelectionState,
    selectPlacement,
    insertField,
    removeSelectedPlacement,
    updateSelectedField,
    updateSelectedFieldOptions,
    updateSelectedPlacement,
    updateSheetViewport,
    updatePlacementRange,
    applyStyleToActiveRange,
    addMergeForActiveRange,
    removeMerge
  };
}
