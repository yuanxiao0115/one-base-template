<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Ofdview } from 'ofdview-vue3';
import parserX from 'parser_x.js';
import 'ofdview-vue3/viewer.css';
import type { FilePreviewSource } from '../file-meta';

defineOptions({
  name: 'OfdPreviewEngine'
});

const props = defineProps<{
  source: FilePreviewSource;
}>();

const emit = defineEmits<{
  (event: 'ready'): void;
  (event: 'error', error: unknown): void;
}>();

const errorMessage = ref('');

const sourceToken = computed(() => {
  if ('url' in props.source) {
    return `url:${props.source.url}`;
  }

  const { name, size, lastModified } = props.source.file;
  return `file:${name}:${size}:${lastModified}`;
});

const ofdSource = computed(() => {
  if ('url' in props.source) {
    return String(props.source.url || '').trim();
  }

  return props.source.file;
});

const parserMem = parserX;

function validateSource() {
  if (!ofdSource.value) {
    const error = new Error('OFD 预览地址为空');
    errorMessage.value = error.message;
    emit('error', error);
    return;
  }

  errorMessage.value = '';
}

function handleParseSuccess() {
  errorMessage.value = '';
  emit('ready');
}

watch(
  sourceToken,
  () => {
    validateSource();
  },
  { immediate: true }
);
</script>

<template>
  <div class="ob-file-preview-engine ob-file-preview-engine--ofd" dir="ltr">
    <div v-if="errorMessage" class="ob-file-preview-engine__state is-error">
      {{ errorMessage }}
    </div>

    <Ofdview
      v-else
      class="ob-file-preview-engine__viewer"
      :file="ofdSource"
      :mem="parserMem"
      :can-close="false"
      :can-open="false"
      :can-download="false"
      :can-print="false"
      :display-toolbar="true"
      @on-parse-o-f-d-success="handleParseSuccess"
    />
  </div>
</template>

<style scoped>
.ob-file-preview-engine {
  width: 100%;
  height: 100%;
  min-height: 180px;
}

.ob-file-preview-engine__viewer {
  width: 100%;
  height: 100%;
}

.ob-file-preview-engine__state {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.ob-file-preview-engine__state.is-error {
  color: var(--el-color-danger);
}
</style>
