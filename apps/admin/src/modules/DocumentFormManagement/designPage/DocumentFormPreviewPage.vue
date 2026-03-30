<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { DocumentRuntimePreview } from '@one-base-template/document-form-engine';

import { createMockDocumentTemplate } from '../mock/template';
import { getDocumentFormAdminServices, setupDocumentFormEngineForAdmin } from '../engine/register';

defineOptions({
  name: 'DocumentFormPreviewPage'
});

const router = useRouter();
const route = useRoute();
const context = setupDocumentFormEngineForAdmin();
const templateService = getDocumentFormAdminServices(context).templateService;

const previewMode = computed<'runtime' | 'print'>(() =>
  route.query.mode === 'print' ? 'print' : 'runtime'
);

const template = computed(() => {
  const snapshot = templateService.getSnapshot();
  return snapshot.draft?.template ?? snapshot.published?.template ?? createMockDocumentTemplate();
});

function switchPreviewMode(mode: 'runtime' | 'print') {
  void router.replace({
    query: {
      ...route.query,
      mode
    }
  });
}

function handleBack() {
  void router.push({
    name: 'DocumentFormDesigner'
  });
}
</script>

<template>
  <div class="preview-page">
    <header class="preview-head">
      <div>
        <h1 class="preview-title">公文表单预览</h1>
        <p class="preview-meta">
          当前预览默认读取设计器草稿，支持填写态（Vue 组件）与打印态（固定版式）切换。
        </p>
      </div>
      <div class="preview-actions">
        <div class="preview-mode">
          <button
            type="button"
            class="preview-mode__btn"
            :class="{ 'preview-mode__btn--active': previewMode === 'runtime' }"
            @click="switchPreviewMode('runtime')"
          >
            填写态预览
          </button>
          <button
            type="button"
            class="preview-mode__btn"
            :class="{ 'preview-mode__btn--active': previewMode === 'print' }"
            @click="switchPreviewMode('print')"
          >
            打印态预览
          </button>
        </div>
        <button type="button" class="preview-back-btn" @click="handleBack">返回设计器</button>
      </div>
    </header>
    <DocumentRuntimePreview
      :context="context"
      :mode="previewMode"
      :readonly="previewMode === 'print'"
      :template="template"
    />
  </div>
</template>

<style scoped>
.preview-page {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  background: #eef3f8;
}

.preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px 0;
}

.preview-title {
  margin: 0;
  color: #1f2937;
  font-size: 20px;
  font-weight: 700;
}

.preview-meta {
  margin: 4px 0 0;
  color: #667085;
  font-size: 13px;
}

.preview-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.preview-mode {
  display: inline-flex;
  gap: 6px;
  padding: 4px;
  border: 1px solid #d5deea;
  background: #fff;
}

.preview-mode__btn {
  padding: 6px 10px;
  border: 1px solid transparent;
  background: transparent;
  color: #475569;
  cursor: pointer;
  font-size: 12px;
}

.preview-mode__btn--active {
  border-color: #93c5fd;
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 600;
}

.preview-back-btn {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #334155;
  cursor: pointer;
}
</style>
