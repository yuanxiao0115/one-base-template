<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { FilePreviewSource } from '../file-meta';

defineOptions({
  name: 'ImagePreviewEngine'
});

const props = withDefaults(
  defineProps<{
    source: FilePreviewSource;
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

const imageUrl = ref('');
let objectUrl: string | null = null;

const sourceToken = computed(() => {
  if ('url' in props.source) {
    return `url:${props.source.url}`;
  }

  const { name, size, lastModified } = props.source.file;
  return `file:${name}:${size}:${lastModified}`;
});

function clearObjectUrl() {
  if (!objectUrl) {
    return;
  }

  URL.revokeObjectURL(objectUrl);
  objectUrl = null;
}

function resolveImageUrl() {
  clearObjectUrl();

  if ('url' in props.source) {
    imageUrl.value = String(props.source.url || '').trim();
    return;
  }

  objectUrl = URL.createObjectURL(props.source.file);
  imageUrl.value = objectUrl;
}

function handleLoad() {
  emit('ready');
}

function handleError(event: Event) {
  emit('error', event);
}

watch(
  sourceToken,
  () => {
    resolveImageUrl();
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  clearObjectUrl();
});
</script>

<template>
  <div class="ob-file-preview-engine ob-file-preview-engine--image">
    <img
      v-if="imageUrl"
      class="ob-file-preview-engine__image"
      :class="[`is-${props.fit}`]"
      :src="imageUrl"
      alt="文件预览图片"
      @load="handleLoad"
      @error="handleError"
    />

    <div v-else class="ob-file-preview-engine__state is-error">图片地址为空，无法预览</div>
  </div>
</template>

<style scoped>
.ob-file-preview-engine {
  width: 100%;
  height: 100%;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
}

.ob-file-preview-engine__image {
  width: 100%;
  height: 100%;
}

.ob-file-preview-engine__image.is-contain {
  object-fit: contain;
}

.ob-file-preview-engine__image.is-cover {
  object-fit: cover;
}

.ob-file-preview-engine__state {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.ob-file-preview-engine__state.is-error {
  color: var(--el-color-danger);
}
</style>
