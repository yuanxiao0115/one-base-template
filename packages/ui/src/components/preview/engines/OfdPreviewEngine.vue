<script setup lang="ts">
import { computed, ref, shallowRef, watch, type DefineComponent } from 'vue';
import type { FilePreviewSource } from '../file-meta';

type PreviewRuntimeComponent = DefineComponent<
  Record<string, unknown>,
  Record<string, unknown>,
  unknown
>;

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
const runtimeLoading = ref(false);
const runtimeErrorMessage = ref('');
const ofdComponent = shallowRef<PreviewRuntimeComponent | null>(null);
const parserMem = shallowRef<unknown>(null);
let latestRuntimeTaskId = 0;

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
  runtimeErrorMessage.value = '';
  emit('ready');
}

async function ensureOfdRuntime() {
  if (ofdComponent.value && parserMem.value) {
    return;
  }

  const taskId = ++latestRuntimeTaskId;
  runtimeErrorMessage.value = '';
  runtimeLoading.value = true;

  try {
    const [ofdModule, parserModule] = await Promise.all([
      import('ofdview-vue3'),
      import('parser_x.js'),
      import('ofdview-vue3/viewer.css')
    ]);

    if (taskId !== latestRuntimeTaskId) {
      return;
    }

    ofdComponent.value = ofdModule.default as unknown as PreviewRuntimeComponent;
    parserMem.value = (parserModule as { default?: unknown }).default ?? parserModule;
  } catch (error) {
    if (taskId !== latestRuntimeTaskId) {
      return;
    }

    runtimeErrorMessage.value = error instanceof Error ? error.message : 'OFD 引擎加载失败';
    emit('error', error);
  } finally {
    if (taskId === latestRuntimeTaskId) {
      runtimeLoading.value = false;
    }
  }
}

const pendingMessage = computed(() => runtimeLoading.value);
const currentErrorMessage = computed(() => runtimeErrorMessage.value || errorMessage.value);

watch(
  sourceToken,
  () => {
    validateSource();
  },
  { immediate: true }
);

watch(
  sourceToken,
  () => {
    void ensureOfdRuntime();
  },
  { immediate: true }
);
</script>

<template>
  <div class="ob-file-preview-engine ob-file-preview-engine--ofd" dir="ltr">
    <div v-if="pendingMessage" class="ob-file-preview-engine__state">正在加载 OFD 预览...</div>

    <div v-else-if="currentErrorMessage" class="ob-file-preview-engine__state is-error">
      {{ currentErrorMessage }}
    </div>

    <component
      :is="ofdComponent"
      v-else-if="ofdComponent && parserMem"
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

    <div v-else class="ob-file-preview-engine__state">正在初始化 OFD 预览引擎...</div>
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
