<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { DocumentRuntimePreview } from '@one-base-template/document-form-engine';

import { createMockDocumentTemplate } from '../mock/template';
import { getDocumentFormAdminServices, setupDocumentFormEngineForAdmin } from '../engine/register';

defineOptions({
  name: 'DocumentFormPreviewPage'
});

const router = useRouter();
const context = setupDocumentFormEngineForAdmin();
const templateService = getDocumentFormAdminServices(context).templateService;

const template = computed(() => {
  const snapshot = templateService.getSnapshot();
  return snapshot.draft?.template ?? snapshot.published?.template ?? createMockDocumentTemplate();
});

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
        <p class="preview-meta">当前预览默认读取设计器草稿，运行态按 Vue 组件版式渲染。</p>
      </div>
      <button type="button" class="preview-back-btn" @click="handleBack">返回设计器</button>
    </header>
    <DocumentRuntimePreview :context="context" :readonly="true" :template="template" />
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

.preview-back-btn {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #334155;
  cursor: pointer;
}
</style>
