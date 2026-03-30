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
const operationHint = ref<string>('Phase 1：当前只保留 Univer 画布编辑与草稿自动保存');

function handleBack() {
  void router.push({
    name: 'DocumentFormTemplateList'
  });
}

function handleTemplateChange(nextTemplate: DocumentTemplateSchema) {
  template.value = nextTemplate;
  const nextDraft = templateService.updateDraft(nextTemplate, '设计器实时保存草稿');
  draftVersion.value = nextDraft.version;
  operationHint.value = `草稿已自动保存到本地（v${nextDraft.version}）`;
}
</script>

<template>
  <div class="designer-page">
    <div class="designer-page__toolbar">
      <div class="designer-page__meta">
        <span>草稿版本：v{{ draftVersion }}</span>
        <span>{{ operationHint }}</span>
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
  padding: 8px 12px;
  border-bottom: 1px solid #d8dee8;
  background: #f8fafc;
}

.designer-page__meta {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  color: #334155;
  font-size: 12px;
}
@media (max-width: 960px) {
  .designer-page__toolbar {
    justify-content: flex-start;
  }
}
</style>
