<script setup lang="ts">
import { computed } from 'vue';

/**
 * 简化版图片选择组件（用于 party-building 配置面板）
 *
 * 约定：
 * - v-model 支持两种输入：
 *   1) 完整 URL（http/https/data）
 *   2) 资源 id（将被拼成 /cmict/file/resource/show?id=...）
 */
const modelValue = defineModel<string>({ default: '' });

const previewUrl = computed(() => {
  if (!modelValue.value) return '';
  if (modelValue.value.startsWith('http')) return modelValue.value;
  if (modelValue.value.startsWith('data:')) return modelValue.value;
  return `/cmict/file/resource/show?id=${encodeURIComponent(modelValue.value)}`;
});
</script>

<template>
  <div class="select-img">
    <el-input v-model="modelValue" placeholder="输入图片资源ID或URL">
      <template #append>
        <el-button :disabled="!modelValue" @click="modelValue = ''">清空</el-button>
      </template>
    </el-input>

    <el-image v-if="previewUrl" class="preview" :src="previewUrl" fit="cover">
      <template #error>
        <div class="error">图片加载失败</div>
      </template>
    </el-image>
  </div>
</template>

<style scoped>
.select-img {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  width: 100%;
  height: 160px;
  background: var(--el-fill-color-lighter);
}

.error {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>

