<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  resolveFilePreviewMeta,
  type FilePreviewEngine,
  type FilePreviewSource
} from './file-meta';
import PreviewEngineRenderer from './engines/PreviewEngineRenderer.vue';

defineOptions({
  name: 'FilePreview'
});

export interface FilePreviewReadyPayload {
  engine: FilePreviewEngine;
  fileName: string;
  sourceType: 'url' | 'file';
}

export interface FilePreviewErrorPayload {
  engine: FilePreviewEngine;
  fileName: string;
  error: unknown;
}

export interface FilePreviewUnsupportedPayload {
  fileName: string;
  extension: string;
  mimeType: string;
}

const props = withDefaults(
  defineProps<{
    source: FilePreviewSource;
    fileName?: string;
    mimeType?: string;
    height?: number | string;
    fullscreenable?: boolean;
    downloadable?: boolean;
    fit?: 'contain' | 'cover';
  }>(),
  {
    fileName: '',
    mimeType: '',
    height: 520,
    fullscreenable: true,
    downloadable: true,
    fit: 'contain'
  }
);

const emit = defineEmits<{
  (event: 'ready', payload: FilePreviewReadyPayload): void;
  (event: 'error', payload: FilePreviewErrorPayload): void;
  (event: 'unsupported', payload: FilePreviewUnsupportedPayload): void;
}>();

const fullscreenVisible = ref(false);
const emittedUnsupportedFingerprint = ref('');

// 核心路由逻辑：把输入源统一归一化为“引擎 + 展示元信息”。
const previewMeta = computed(() =>
  resolveFilePreviewMeta({
    source: props.source,
    fileName: props.fileName,
    mimeType: props.mimeType
  })
);

const embeddedRenderKey = computed(
  () => `embedded:${previewMeta.value.engine}:${previewMeta.value.sourceFingerprint}`
);

const fullscreenRenderKey = computed(
  () => `fullscreen:${previewMeta.value.engine}:${previewMeta.value.sourceFingerprint}`
);

const embeddedHeight = computed(() => {
  if (typeof props.height === 'number') {
    return `${props.height}px`;
  }

  return props.height;
});

watch(
  () => `${previewMeta.value.engine}:${previewMeta.value.sourceFingerprint}`,
  () => {
    if (previewMeta.value.engine !== 'unsupported') {
      emittedUnsupportedFingerprint.value = '';
      return;
    }

    if (emittedUnsupportedFingerprint.value === previewMeta.value.sourceFingerprint) {
      return;
    }

    emittedUnsupportedFingerprint.value = previewMeta.value.sourceFingerprint;
    emit('unsupported', {
      fileName: previewMeta.value.fileName,
      extension: previewMeta.value.extension,
      mimeType: previewMeta.value.mimeType
    });
  },
  { immediate: true }
);

function handleEngineReady() {
  emit('ready', {
    engine: previewMeta.value.engine,
    fileName: previewMeta.value.fileName,
    sourceType: previewMeta.value.sourceType
  });
}

function handleEngineError(error: unknown) {
  emit('error', {
    engine: previewMeta.value.engine,
    fileName: previewMeta.value.fileName,
    error
  });
}

function openFullscreen() {
  if (!props.fullscreenable) {
    return;
  }

  fullscreenVisible.value = true;
}

function normalizeDownloadName() {
  const fallbackName = previewMeta.value.fileName || 'download';
  return fallbackName.trim() || 'download';
}

function triggerDownload() {
  if (!props.downloadable) {
    return;
  }

  const anchor = document.createElement('a');
  anchor.rel = 'noopener noreferrer';
  anchor.style.display = 'none';
  anchor.download = normalizeDownloadName();

  if ('url' in props.source) {
    const url = String(props.source.url || '').trim();
    if (!url) {
      return;
    }

    anchor.href = url;
    anchor.target = '_blank';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    return;
  }

  const objectUrl = URL.createObjectURL(props.source.file);
  anchor.href = objectUrl;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(objectUrl);
}
</script>

<template>
  <section class="ob-file-preview">
    <header class="ob-file-preview__toolbar">
      <div class="ob-file-preview__meta">
        <span class="ob-file-preview__name" :title="previewMeta.fileName">{{
          previewMeta.fileName
        }}</span>
        <el-tag size="small" effect="plain" class="ob-file-preview__tag">
          {{ previewMeta.extension || 'unknown' }}
        </el-tag>
      </div>

      <div class="ob-file-preview__actions">
        <el-button v-if="props.downloadable" size="small" text @click="triggerDownload"
          >下载</el-button
        >
        <el-button v-if="props.fullscreenable" size="small" text @click="openFullscreen"
          >全屏</el-button
        >
      </div>
    </header>

    <div
      v-if="!fullscreenVisible || !props.fullscreenable"
      class="ob-file-preview__viewport"
      :style="{ height: embeddedHeight }"
    >
      <PreviewEngineRenderer
        :key="embeddedRenderKey"
        :engine="previewMeta.engine"
        :source="props.source"
        :file-name="previewMeta.fileName"
        :fit="props.fit"
        @ready="handleEngineReady"
        @error="handleEngineError"
      />
    </div>

    <el-dialog
      v-if="props.fullscreenable"
      v-model="fullscreenVisible"
      fullscreen
      append-to-body
      destroy-on-close
      :title="`预览：${previewMeta.fileName}`"
      class="ob-file-preview__dialog"
    >
      <div class="ob-file-preview__dialog-actions">
        <el-button v-if="props.downloadable" size="small" @click="triggerDownload"
          >下载文件</el-button
        >
      </div>

      <div class="ob-file-preview__dialog-viewport">
        <PreviewEngineRenderer
          :key="fullscreenRenderKey"
          :engine="previewMeta.engine"
          :source="props.source"
          :file-name="previewMeta.fileName"
          :fit="props.fit"
          @ready="handleEngineReady"
          @error="handleEngineError"
        />
      </div>
    </el-dialog>
  </section>
</template>

<style scoped>
.ob-file-preview {
  width: 100%;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
  background: var(--el-bg-color);
}

.ob-file-preview__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-lighter);
}

.ob-file-preview__meta {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ob-file-preview__name {
  max-width: min(60vw, 420px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.ob-file-preview__tag {
  flex: none;
}

.ob-file-preview__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ob-file-preview__viewport {
  width: 100%;
  min-height: 180px;
}

.ob-file-preview__dialog-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.ob-file-preview__dialog-viewport {
  width: 100%;
  height: calc(100vh - 170px);
  min-height: 280px;
}

@media (max-width: 768px) {
  .ob-file-preview__toolbar {
    flex-wrap: wrap;
  }

  .ob-file-preview__name {
    max-width: 100%;
  }
}
</style>
