<script setup lang="ts">
  import { computed } from 'vue';
  import { ObCard } from '@one-base-template/ui';
  import PortalBorderField from '../fields/PortalBorderField.vue';
  import PortalColorField from '../fields/PortalColorField.vue';
  import PortalSpacingField from '../fields/PortalSpacingField.vue';

  import {
    createDefaultUnifiedContainerStyleConfig,
    mergeUnifiedContainerStyleConfig,
  } from './unified-container.defaults';
  import type { UnifiedContainerStyleConfig } from './unified-container.types';

  const modelValue = defineModel<UnifiedContainerStyleConfig>({
    default: () => createDefaultUnifiedContainerStyleConfig(),
  });

  modelValue.value = mergeUnifiedContainerStyleConfig(modelValue.value);

  const containerPaddingValue = computed({
    get: () => ({
      top: Number(modelValue.value.paddingTop) || 0,
      right: Number(modelValue.value.paddingRight) || 0,
      bottom: Number(modelValue.value.paddingBottom) || 0,
      left: Number(modelValue.value.paddingLeft) || 0,
    }),
    set: (value) => {
      modelValue.value.paddingTop = Number(value.top) || 0;
      modelValue.value.paddingRight = Number(value.right) || 0;
      modelValue.value.paddingBottom = Number(value.bottom) || 0;
      modelValue.value.paddingLeft = Number(value.left) || 0;
    },
  });

  const containerMarginValue = computed({
    get: () => ({
      top: Number(modelValue.value.marginTop) || 0,
      right: Number(modelValue.value.marginRight) || 0,
      bottom: Number(modelValue.value.marginBottom) || 0,
      left: Number(modelValue.value.marginLeft) || 0,
    }),
    set: (value) => {
      modelValue.value.marginTop = Number(value.top) || 0;
      modelValue.value.marginRight = Number(value.right) || 0;
      modelValue.value.marginBottom = Number(value.bottom) || 0;
      modelValue.value.marginLeft = Number(value.left) || 0;
    },
  });

  const headerPaddingValue = computed({
    get: () => ({
      top: Number(modelValue.value.headerPaddingTop) || 0,
      right: Number(modelValue.value.headerPaddingRight) || 0,
      bottom: Number(modelValue.value.headerPaddingBottom) || 0,
      left: Number(modelValue.value.headerPaddingLeft) || 0,
    }),
    set: (value) => {
      modelValue.value.headerPaddingTop = Number(value.top) || 0;
      modelValue.value.headerPaddingRight = Number(value.right) || 0;
      modelValue.value.headerPaddingBottom = Number(value.bottom) || 0;
      modelValue.value.headerPaddingLeft = Number(value.left) || 0;
    },
  });

  const borderValue = computed({
    get: () => ({
      style: modelValue.value.borderStyle,
      color: modelValue.value.borderColor,
      width: Number(modelValue.value.borderWidth) || 0,
      radius: Number(modelValue.value.borderRadius) || 0,
    }),
    set: (value) => {
      modelValue.value.borderStyle = value.style as UnifiedContainerStyleConfig['borderStyle'];
      modelValue.value.borderColor = value.color;
      modelValue.value.borderWidth = Number(value.width) || 0;
      modelValue.value.borderRadius = Number(value.radius) || 0;
    },
  });

  defineOptions({
    name: 'PortalUnifiedContainerStyleConfig',
  });
</script>

<template>
  <div class="unified-container-style-config">
    <el-form label-position="top">
      <ObCard title="容器样式">
        <el-form-item label="背景颜色">
          <PortalColorField v-model="modelValue.backgroundColor" show-alpha />
        </el-form-item>

        <PortalBorderField v-model="borderValue" :width-min="1" :width-max="20" :radius-max="64" />

        <el-form-item label="阴影">
          <el-input
            v-model.trim="modelValue.boxShadow"
            placeholder="例如：0 8px 24px rgba(15, 23, 42, 0.16) 或 none"
          />
        </el-form-item>
      </ObCard>

      <ObCard title="容器内边距">
        <PortalSpacingField v-model="containerPaddingValue" :max="200" />
      </ObCard>

      <ObCard title="容器外边距">
        <PortalSpacingField v-model="containerMarginValue" :max="200" />
      </ObCard>

      <ObCard title="标题区样式">
        <el-form-item label="标题区背景">
          <PortalColorField v-model="modelValue.headerBackgroundColor" show-alpha />
        </el-form-item>

        <el-form-item label="标题区分割线">
          <PortalColorField v-model="modelValue.headerDividerColor" show-alpha />
        </el-form-item>

        <el-form-item label="标题颜色">
          <PortalColorField v-model="modelValue.titleColor" show-alpha />
        </el-form-item>

        <el-form-item label="标题字号(px)">
          <el-input-number v-model="modelValue.titleFontSize" :min="12" :max="48" controls-position="right" />
        </el-form-item>

        <el-form-item label="副标题颜色">
          <PortalColorField v-model="modelValue.subtitleColor" show-alpha />
        </el-form-item>

        <el-form-item label="副标题字号(px)">
          <el-input-number v-model="modelValue.subtitleFontSize" :min="10" :max="40" controls-position="right" />
        </el-form-item>

        <el-form-item label="图标颜色">
          <PortalColorField v-model="modelValue.iconColor" show-alpha />
        </el-form-item>

        <el-form-item label="外链颜色">
          <PortalColorField v-model="modelValue.linkColor" show-alpha />
        </el-form-item>

        <el-form-item label="外链字号(px)">
          <el-input-number v-model="modelValue.linkFontSize" :min="10" :max="32" controls-position="right" />
        </el-form-item>

        <el-form-item label="标题区与内容间距(px)">
          <el-input-number v-model="modelValue.contentTopGap" :min="0" :max="120" controls-position="right" />
        </el-form-item>
      </ObCard>

      <ObCard title="标题区内边距">
        <PortalSpacingField v-model="headerPaddingValue" :max="120" />
      </ObCard>
    </el-form>
  </div>
</template>

<style scoped>
  .unified-container-style-config {
    padding: 2px 0 8px;
  }
</style>
