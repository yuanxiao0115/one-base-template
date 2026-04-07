<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, watch, type DefineComponent } from 'vue';
import type { FilePreviewSource } from '../file-meta';

type PreviewRuntimeComponent = DefineComponent<
  Record<string, unknown>,
  Record<string, unknown>,
  unknown
>;

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
const runtimeLoading = ref(false);
const runtimeErrorMessage = ref('');
const pdfComponent = shallowRef<PreviewRuntimeComponent | null>(null);
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

async function ensurePdfRuntime() {
  if (pdfComponent.value) {
    return;
  }

  runtimeErrorMessage.value = '';
  runtimeLoading.value = true;

  try {
    const pdfModule = await import('@vue-office/pdf/lib/v3/index.js');
    pdfComponent.value = pdfModule.default as PreviewRuntimeComponent;
  } catch (error) {
    runtimeErrorMessage.value = error instanceof Error ? error.message : 'PDF 引擎加载失败';
    emit('error', error);
  } finally {
    runtimeLoading.value = false;
  }
}

const pendingMessage = computed(() => {
  return loading.value || runtimeLoading.value;
});

const currentErrorMessage = computed(() => runtimeErrorMessage.value || errorMessage.value);

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

onMounted(() => {
  void ensurePdfRuntime();
});
</script>

<template>
  <div class="ob-file-preview-engine ob-file-preview-engine--pdf">
    <div v-if="pendingMessage" class="ob-file-preview-engine__state">正在加载 PDF 预览...</div>

    <div v-else-if="currentErrorMessage" class="ob-file-preview-engine__state is-error">
      {{ currentErrorMessage }}
    </div>

    <component
      :is="pdfComponent"
      v-else-if="pdfComponent"
      class="ob-file-preview-engine__viewer"
      :src="pdfSource"
      @rendered="handleRendered"
      @error="handleRenderError"
    />

    <div v-else class="ob-file-preview-engine__state">正在初始化 PDF 预览引擎...</div>
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
