<script setup lang="ts">
defineOptions({
  name: 'UnsupportedPreviewEngine'
});

const props = defineProps<{
  source?: unknown;
  fileName: string;
}>();
</script>

<template>
  <div class="ob-file-preview-engine ob-file-preview-engine--unsupported">
    <p class="ob-file-preview-engine__title">暂不支持该类型在线预览</p>
    <p class="ob-file-preview-engine__desc">{{ props.fileName }} 可通过下载后本地打开。</p>
  </div>
</template>

<style scoped>
.ob-file-preview-engine {
  width: 100%;
  height: 100%;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
}

.ob-file-preview-engine__title {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.ob-file-preview-engine__desc {
  margin: 0;
  font-size: 12px;
}
</style>
