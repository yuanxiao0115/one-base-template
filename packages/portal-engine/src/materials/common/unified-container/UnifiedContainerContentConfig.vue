<script setup lang="ts">
  import { computed } from 'vue';
  import { ObCard } from '@one-base-template/ui';

  import MenuIconSelectorInput from './MenuIconSelectorInput.vue';
  import {
    createDefaultUnifiedContainerContentConfig,
    mergeUnifiedContainerContentConfig,
  } from './unified-container.defaults';
  import type { UnifiedContainerContentConfig } from './unified-container.types';

  const modelValue = defineModel<UnifiedContainerContentConfig>({
    default: () => createDefaultUnifiedContainerContentConfig(),
  });

  modelValue.value = mergeUnifiedContainerContentConfig(modelValue.value);

  const showExternalLinkFields = computed(() => modelValue.value.showExternalLink);
  const subtitleLayoutOptions = [
    { label: '下方', value: 'below' },
    { label: '同行', value: 'inline' },
  ] as const;

  defineOptions({
    name: 'PortalUnifiedContainerContentConfig',
  });
</script>

<template>
  <div class="unified-container-content-config">
    <el-form label-position="top">
      <ObCard title="标题设置">
        <el-form-item label="显示标题区域">
          <el-switch v-model="modelValue.showTitle" />
        </el-form-item>

        <el-form-item label="容器标题">
          <el-input v-model.trim="modelValue.title" :disabled="!modelValue.showTitle" placeholder="请输入标题" />
        </el-form-item>

        <el-form-item label="副标题">
          <el-input v-model.trim="modelValue.subtitle" :disabled="!modelValue.showTitle" placeholder="请输入副标题" />
        </el-form-item>

        <el-form-item label="副标题位置">
          <el-radio-group v-model="modelValue.subtitleLayout" :disabled="!modelValue.showTitle">
            <el-radio-button
              v-for="option in subtitleLayoutOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="标题图标">
          <MenuIconSelectorInput v-model="modelValue.icon" :disabled="!modelValue.showTitle" />
        </el-form-item>

        <el-form-item label="显示外链按钮">
          <el-switch v-model="modelValue.showExternalLink" />
        </el-form-item>

        <template v-if="showExternalLinkFields">
          <el-form-item label="外链文字">
            <el-input v-model.trim="modelValue.externalLinkText" placeholder="例如：更多" />
          </el-form-item>

          <el-form-item label="外链地址">
            <el-input v-model.trim="modelValue.externalLinkUrl" placeholder="请输入链接地址" />
          </el-form-item>

          <el-form-item label="新窗口打开">
            <el-switch v-model="modelValue.openExternalInNewTab" />
          </el-form-item>
        </template>
      </ObCard>
    </el-form>
  </div>
</template>

<style scoped>
  .unified-container-content-config {
    padding: 2px 0 8px;
  }
</style>
