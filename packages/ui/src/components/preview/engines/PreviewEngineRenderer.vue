<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import type { FilePreviewEngine, FilePreviewSource } from '../file-meta';

defineOptions({
  name: 'PreviewEngineRenderer'
});

const props = withDefaults(
  defineProps<{
    engine: FilePreviewEngine;
    source: FilePreviewSource;
    fileName: string;
    fit?: 'contain' | 'cover';
  }>(),
  {
    fit: 'contain'
  }
);

const emit = defineEmits<{
  (event: 'ready'): void;
  (event: 'error', error: unknown): void;
}>();

const PdfPreviewEngine = defineAsyncComponent(() => import('./PdfPreviewEngine.vue'));
const OfficePreviewEngine = defineAsyncComponent(() => import('./OfficePreviewEngine.vue'));
const OfdPreviewEngine = defineAsyncComponent(() => import('./OfdPreviewEngine.vue'));
const ImagePreviewEngine = defineAsyncComponent(() => import('./ImagePreviewEngine.vue'));
const UnsupportedPreviewEngine = defineAsyncComponent(
  () => import('./UnsupportedPreviewEngine.vue')
);

const isOfficeEngine = computed(
  () =>
    props.engine === 'office-docx' ||
    props.engine === 'office-excel' ||
    props.engine === 'office-pptx'
);

const officeType = computed<'docx' | 'excel' | 'pptx'>(() => {
  if (props.engine === 'office-excel') {
    return 'excel';
  }

  if (props.engine === 'office-pptx') {
    return 'pptx';
  }

  return 'docx';
});
</script>

<template>
  <PdfPreviewEngine
    v-if="props.engine === 'pdf'"
    :source="props.source"
    @ready="emit('ready')"
    @error="emit('error', $event)"
  />

  <OfficePreviewEngine
    v-else-if="isOfficeEngine"
    :source="props.source"
    :office-type="officeType"
    @ready="emit('ready')"
    @error="emit('error', $event)"
  />

  <OfdPreviewEngine
    v-else-if="props.engine === 'ofd'"
    :source="props.source"
    @ready="emit('ready')"
    @error="emit('error', $event)"
  />

  <ImagePreviewEngine
    v-else-if="props.engine === 'image'"
    :source="props.source"
    :fit="props.fit"
    @ready="emit('ready')"
    @error="emit('error', $event)"
  />

  <UnsupportedPreviewEngine v-else :source="props.source" :file-name="props.fileName" />
</template>
