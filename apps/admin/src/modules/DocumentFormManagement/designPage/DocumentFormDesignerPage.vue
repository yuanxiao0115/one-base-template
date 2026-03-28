<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { DocumentTemplateSchema } from '@one-base-template/document-form-engine';
import { DocumentFormDesignerLayout } from '@one-base-template/document-form-engine/designer';

import { createMockDocumentTemplate } from '../mock/template';
import { getDocumentFormAdminServices, setupDocumentFormEngineForAdmin } from '../engine/register';

defineOptions({
  name: 'DocumentFormDesignerPage'
});

const router = useRouter();
const context = setupDocumentFormEngineForAdmin();
const templateService = getDocumentFormAdminServices(context).templateService;
const initialDraft = templateService.ensureDraft(createMockDocumentTemplate());
const template = ref<DocumentTemplateSchema>(initialDraft.template);
const draftVersion = ref<number>(initialDraft.version);
const publishedVersion = ref<number>(templateService.getSnapshot().published?.version ?? 0);
const operationHint = ref<string>('当前为草稿态');

function handleBack() {
  void router.push({
    name: 'DocumentFormTemplateList'
  });
}

function handleTemplateChange(nextTemplate: DocumentTemplateSchema) {
  template.value = nextTemplate;
  const nextDraft = templateService.updateDraft(nextTemplate, '设计器实时保存草稿');
  draftVersion.value = nextDraft.version;
}

function publishDraft() {
  const published = templateService.publishDraft('设计器发布');
  publishedVersion.value = published.version;
  draftVersion.value = published.version;
  operationHint.value = `已发布版本 v${published.version}`;
}

function rollbackToPublished() {
  const draft = templateService.rollbackToPublished();
  if (!draft) {
    operationHint.value = '暂无可回滚的发布版本';
    return;
  }

  template.value = draft.template;
  draftVersion.value = draft.version;
  operationHint.value = `已回滚到发布版本 v${draft.version}`;
}
</script>

<template>
  <div class="designer-page">
    <div class="designer-page__toolbar">
      <div class="designer-page__meta">
        <span>草稿版本：v{{ draftVersion }}</span>
        <span>发布版本：v{{ publishedVersion || '-' }}</span>
        <span>{{ operationHint }}</span>
      </div>
      <div class="designer-page__actions">
        <button type="button" @click="publishDraft">发布</button>
        <button type="button" :disabled="!publishedVersion" @click="rollbackToPublished">
          回滚
        </button>
      </div>
    </div>
    <DocumentFormDesignerLayout
      :context="context"
      :template="template"
      @back="handleBack"
      @update:template="handleTemplateChange"
    />
  </div>
</template>

<style scoped>
.designer-page {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
}

.designer-page__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  border-bottom: 1px solid #d8dee8;
  background: #f8fafc;
}

.designer-page__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #334155;
  font-size: 12px;
}

.designer-page__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.designer-page__actions button {
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #334155;
  cursor: pointer;
}

.designer-page__actions button:disabled {
  border-color: #e2e8f0;
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}
</style>
