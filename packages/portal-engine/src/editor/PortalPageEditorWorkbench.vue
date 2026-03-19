<script setup lang="ts">
import type { Component } from 'vue';

import type { PortalPageSettingsV2 } from '../schema/page-settings';
import type { PortalMaterialCategory } from '../registry/materials-registry.types';

import GridLayoutEditor from './GridLayoutEditor.vue';
import MaterialLibrary from './MaterialLibrary.vue';
import PropertyPanel from './PropertyPanel.vue';

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    saving?: boolean;
    previewLoading?: boolean;
    title?: string;
    meta?: string;
    pageSettingData: PortalPageSettingsV2;
    materialsMap: Record<string, Component>;
    categories: PortalMaterialCategory[];
  }>(),
  {
    loading: false,
    saving: false,
    previewLoading: false,
    title: '页面编辑',
    meta: ''
  }
);

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'save'): void;
  (e: 'preview'): void;
}>();
</script>

<template>
  <div class="page">
    <header class="headbar">
      <el-button class="head-btn" size="small" @click="emit('back')">返回</el-button>
      <div class="head-title-wrap">
        <div class="head-title">{{ props.title || '页面编辑' }}</div>
        <div v-if="props.meta" class="head-meta">{{ props.meta }}</div>
      </div>
      <el-button
        class="head-btn"
        size="small"
        type="primary"
        :loading="props.saving"
        @click="emit('save')"
        >保存</el-button
      >
      <el-button
        class="head-btn"
        size="small"
        :loading="props.previewLoading"
        @click="emit('preview')"
        >预览</el-button
      >
    </header>

    <div v-loading="props.loading" class="content">
      <MaterialLibrary :categories="props.categories" />
      <div class="canvas">
        <GridLayoutEditor
          :materials-map="props.materialsMap"
          :scale="1"
          :loaded="!props.loading"
          :page-setting-data="props.pageSettingData"
        />
      </div>
      <div class="right-panel">
        <PropertyPanel class="property-panel" :materials-map="props.materialsMap" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  --portal-line: #d7e0ec;
  --portal-bg: #f1f4f9;
  --portal-pane-bg: #f8fbff;
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  background: var(--portal-bg);
  overflow: hidden;
}

.headbar {
  flex: none;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 7px 14px;
  border-bottom: 1px solid #d8e0ea;
  background: #f2f5f9;
}

.head-title-wrap {
  flex: 1;
  min-width: 0;
}

.head-title {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.head-meta {
  margin-top: 1px;
  font-size: 11px;
  color: #6b7280;
}

.head-btn {
  flex: none;
  border-radius: 0;
}

.content {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr) 396px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: linear-gradient(180deg, #f3f7fc 0%, #edf2f8 100%);
}

.content :deep(.material-library) {
  width: 100%;
  flex: 1 1 auto;
  border-right: 1px solid var(--portal-line);
  background: linear-gradient(180deg, #f9fbfe 0%, #f4f8fd 100%);
}

.content :deep(.material-library .header) {
  border-bottom: 1px solid #e2e9f3;
}

.content :deep(.material-library .material-card) {
  border-radius: 2px;
  border-color: #dde6f1;
  background: #fff;
  box-shadow: none;
}

.content :deep(.material-library .material-card:hover) {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px -22px rgb(17 42 80 / 60%);
}

.canvas {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  padding: 12px;
  background: linear-gradient(180deg, #f4f8fd 0%, #eef3f9 100%);
  overflow: hidden;
}

.canvas :deep(.grid-container) {
  border-radius: 0;
  border-color: var(--portal-line);
}

.canvas :deep(.grid-item) {
  border-radius: 2px;
  box-shadow: 0 6px 16px -14px rgb(15 23 42 / 30%);
}

.right-panel {
  width: 396px;
  min-width: 396px;
  min-height: 0;
  border-left: 1px solid var(--portal-line);
  background: var(--portal-pane-bg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.property-panel {
  flex: 1;
  min-height: 0;
}

@media (max-width: 1600px) {
  .content {
    grid-template-columns: 248px minmax(0, 1fr) 376px;
  }

  .right-panel {
    width: 376px;
    min-width: 376px;
  }
}

@media (max-width: 1360px) {
  .right-panel {
    width: 352px;
    min-width: 352px;
  }

  .content {
    grid-template-columns: 236px minmax(0, 1fr) 352px;
  }
}

@media (max-width: 1200px) {
  .canvas {
    padding: 10px;
  }

  .right-panel {
    width: 336px;
    min-width: 336px;
  }

  .content {
    grid-template-columns: 220px minmax(0, 1fr) 336px;
  }
}

@media (max-width: 640px) {
  .headbar {
    padding-left: 10px;
    padding-right: 10px;
  }

  .head-title {
    font-size: 13px;
  }
}
</style>
