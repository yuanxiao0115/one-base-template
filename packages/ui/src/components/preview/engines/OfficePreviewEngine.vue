<script setup lang="ts">
import { computed, ref, shallowRef, watch, type DefineComponent } from 'vue';
import type { FilePreviewSource } from '../file-meta';

type PreviewRuntimeComponent = DefineComponent<
  Record<string, unknown>,
  Record<string, unknown>,
  unknown
>;

defineOptions({
  name: 'OfficePreviewEngine'
});

const props = defineProps<{
  source: FilePreviewSource;
  officeType: 'docx' | 'excel' | 'pptx';
}>();

const emit = defineEmits<{
  (event: 'ready'): void;
  (event: 'error', error: unknown): void;
}>();

const officeSource = ref<string | ArrayBuffer | Blob>('');
const loading = ref(false);
const errorMessage = ref('');
const runtimeLoading = ref(false);
const runtimeErrorMessage = ref('');
const officeRuntimeMap = shallowRef<
  Partial<Record<'docx' | 'excel' | 'pptx', PreviewRuntimeComponent>>
>({});
let latestTaskId = 0;
let latestRuntimeTaskId = 0;

const officeComponent = computed(() => officeRuntimeMap.value[props.officeType] ?? null);

const sourceToken = computed(() => {
  if ('url' in props.source) {
    return `url:${props.source.url}`;
  }

  const { name, size, lastModified } = props.source.file;
  return `file:${name}:${size}:${lastModified}`;
});

function resolveOfficeLabel() {
  if (props.officeType === 'excel') {
    return 'Excel';
  }

  if (props.officeType === 'pptx') {
    return 'PPT';
  }

  return 'Word';
}

async function resolveOfficeSource() {
  const taskId = ++latestTaskId;
  errorMessage.value = '';
  loading.value = true;

  try {
    if ('url' in props.source) {
      const url = String(props.source.url || '').trim();
      if (!url) {
        throw new Error(`${resolveOfficeLabel()} 预览地址为空`);
      }
      officeSource.value = url;
      return;
    }

    officeSource.value = await props.source.file.arrayBuffer();
  } catch (error) {
    if (taskId !== latestTaskId) {
      return;
    }

    officeSource.value = '';
    errorMessage.value =
      error instanceof Error ? error.message : `${resolveOfficeLabel()} 预览失败`;
    emit('error', error);
  } finally {
    if (taskId === latestTaskId) {
      loading.value = false;
    }
  }
}

async function ensureOfficeRuntime(officeType: 'docx' | 'excel' | 'pptx') {
  if (officeRuntimeMap.value[officeType]) {
    return;
  }

  const taskId = ++latestRuntimeTaskId;
  runtimeErrorMessage.value = '';
  runtimeLoading.value = true;

  try {
    if (officeType === 'excel') {
      const [excelModule] = await Promise.all([
        import('@vue-office/excel/lib/v3/index.js'),
        import('@vue-office/excel/lib/v3/index.css')
      ]);
      officeRuntimeMap.value = {
        ...officeRuntimeMap.value,
        excel: excelModule.default as PreviewRuntimeComponent
      };
      return;
    }

    if (officeType === 'pptx') {
      const pptxModule = await import('@vue-office/pptx/lib/v3/index.js');
      officeRuntimeMap.value = {
        ...officeRuntimeMap.value,
        pptx: pptxModule.default as PreviewRuntimeComponent
      };
      return;
    }

    const [docxModule] = await Promise.all([
      import('@vue-office/docx/lib/v3/index.js'),
      import('@vue-office/docx/lib/v3/index.css')
    ]);
    officeRuntimeMap.value = {
      ...officeRuntimeMap.value,
      docx: docxModule.default as PreviewRuntimeComponent
    };
  } catch (error) {
    if (taskId !== latestRuntimeTaskId) {
      return;
    }

    runtimeErrorMessage.value =
      error instanceof Error ? error.message : `${resolveOfficeLabel()} 预览引擎加载失败`;
    emit('error', error);
  } finally {
    if (taskId === latestRuntimeTaskId) {
      runtimeLoading.value = false;
    }
  }
}

const pendingMessage = computed(() => loading.value || runtimeLoading.value);
const currentErrorMessage = computed(() => runtimeErrorMessage.value || errorMessage.value);

function handleRendered() {
  errorMessage.value = '';
  runtimeErrorMessage.value = '';
  emit('ready');
}

function handleRenderError(error: unknown) {
  errorMessage.value = error instanceof Error ? error.message : `${resolveOfficeLabel()} 渲染失败`;
  emit('error', error);
}

watch(
  sourceToken,
  () => {
    void resolveOfficeSource();
  },
  { immediate: true }
);

watch(
  () => props.officeType,
  (officeType) => {
    void ensureOfficeRuntime(officeType);
  },
  { immediate: true }
);
</script>

<template>
  <div class="ob-file-preview-engine ob-file-preview-engine--office">
    <div v-if="pendingMessage" class="ob-file-preview-engine__state">正在加载 Office 预览...</div>

    <div v-else-if="currentErrorMessage" class="ob-file-preview-engine__state is-error">
      {{ currentErrorMessage }}
    </div>

    <component
      :is="officeComponent"
      v-else-if="officeComponent"
      class="ob-file-preview-engine__viewer"
      :src="officeSource"
      @rendered="handleRendered"
      @error="handleRenderError"
    />

    <div v-else class="ob-file-preview-engine__state">正在初始化 Office 预览引擎...</div>
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
