<script setup lang="ts">
import { computed, ref, watch } from 'vue';
// @ts-expect-error 三方库未提供稳定类型声明，运行时可正常加载
import VueOfficePdf from '@vue-office/pdf/lib/v3/index.js';
import type { FilePreviewSource } from '../file-meta';

defineOptions({
  name: 'PdfPreviewEngine'
});

const props = defineProps<{
  source: FilePreviewSource;
}>();

const emit = defineEmits<{
  (event: 'ready'): void;
  (event: 'error', error: unknown): void;
}>();

const pdfSource = ref<string | ArrayBuffer | Blob>('');
const loading = ref(false);
const errorMessage = ref('');
let latestTaskId = 0;

const sourceToken = computed(() => {
  if ('url' in props.source) {
    return `url:${props.source.url}`;
  }

  const { name, size, lastModified } = props.source.file;
  return `file:${name}:${size}:${lastModified}`;
});

async function resolvePdfSource() {
  const taskId = ++latestTaskId;
  errorMessage.value = '';
  loading.value = true;

  try {
    if ('url' in props.source) {
      const url = String(props.source.url || '').trim();
      if (!url) {
        throw new Error('PDF 预览地址为空');
      }
      pdfSource.value = url;
      return;
    }

    pdfSource.value = await props.source.file.arrayBuffer();
  } catch (error) {
    if (taskId !== latestTaskId) {
      return;
    }

    pdfSource.value = '';
    errorMessage.value = error instanceof Error ? error.message : 'PDF 预览失败';
    emit('error', error);
  } finally {
    if (taskId === latestTaskId) {
      loading.value = false;
    }
  }
}

function handleRendered() {
  errorMessage.value = '';
  emit('ready');
}

function handleRenderError(error: unknown) {
  errorMessage.value = error instanceof Error ? error.message : 'PDF 渲染失败';
  emit('error', error);
}

watch(
  sourceToken,
  () => {
    void resolvePdfSource();
  },
  { immediate: true }
);
</script>

<template>
  <div class="ob-file-preview-engine ob-file-preview-engine--pdf">
    <div v-if="loading" class="ob-file-preview-engine__state">正在加载 PDF 预览...</div>

    <div v-else-if="errorMessage" class="ob-file-preview-engine__state is-error">
      {{ errorMessage }}
    </div>

    <VueOfficePdf
      v-else
      class="ob-file-preview-engine__viewer"
      :src="pdfSource"
      @rendered="handleRendered"
      @error="handleRenderError"
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
