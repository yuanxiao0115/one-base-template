<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import type { DocumentSheetRange } from '../schema/sheet';
import type { DocumentTemplateSchema } from '../schema/types';

defineOptions({
  name: 'DocumentCanvas'
});

const UniverDocumentCanvas = defineAsyncComponent(() => import('./UniverDocumentCanvas.vue'));

const props = defineProps<{
  template: DocumentTemplateSchema;
  activeRange?: DocumentSheetRange | null;
  selectedPlacementId?: string | null;
}>();

const emit = defineEmits<{
  (e: 'select-placement', placementId: string | null): void;
  (e: 'select-range', range: DocumentSheetRange): void;
  (e: 'update-placement-range', placementId: string, range: DocumentSheetRange): void;
  (e: 'sync-univer-snapshot', snapshot: Record<string, unknown>): void;
}>();

function handlePlacementRangeUpdate(placementId: string, range: DocumentSheetRange) {
  emit('update-placement-range', placementId, range);
}
</script>

<template>
  <UniverDocumentCanvas
    :active-range="props.activeRange ?? null"
    :selected-placement-id="props.selectedPlacementId ?? null"
    :template="props.template"
    @select-placement="emit('select-placement', $event)"
    @select-range="emit('select-range', $event)"
    @sync-univer-snapshot="emit('sync-univer-snapshot', $event)"
    @update-placement-range="handlePlacementRangeUpdate"
  />
</template>
