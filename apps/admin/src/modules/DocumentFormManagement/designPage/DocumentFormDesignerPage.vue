<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { DocumentTemplateSchema } from '@one-base-template/document-form-engine';
import { DocumentFormDesignerLayout } from '@one-base-template/document-form-engine/designer';

import { createMockDocumentTemplate } from '../mock/template';
import { setupDocumentFormEngineForAdmin } from '../engine/register';

defineOptions({
  name: 'DocumentFormDesignerPage'
});

const router = useRouter();
const context = setupDocumentFormEngineForAdmin();
const template = ref<DocumentTemplateSchema>(createMockDocumentTemplate());

function handleBack() {
  void router.push({
    name: 'DocumentFormTemplateList'
  });
}

function handleTemplateChange(nextTemplate: DocumentTemplateSchema) {
  template.value = nextTemplate;
}
</script>

<template>
  <DocumentFormDesignerLayout
    :context="context"
    :template="template"
    @back="handleBack"
    @update:template="handleTemplateChange"
  />
</template>
