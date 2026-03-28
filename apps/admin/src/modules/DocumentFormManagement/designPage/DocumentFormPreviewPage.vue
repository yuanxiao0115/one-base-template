<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  createDocumentRuntimeRenderer,
  getDocumentMaterialDefinition
} from '@one-base-template/document-form-engine';

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
  return snapshot.published?.template ?? snapshot.draft?.template ?? createMockDocumentTemplate();
});
const runtimeRenderer = createDocumentRuntimeRenderer(context);

const renderModel = computed(() => runtimeRenderer.buildRenderModel(template.value));

function resolveStyle(node: (typeof renderModel.value)[number]) {
  const { columns, rowHeight } = template.value.grid;
  return {
    left: `${((node.anchor.col - 1) / columns) * 100}%`,
    top: `${(((node.anchor.row - 1) * rowHeight) / template.value.page.minHeight) * 100}%`,
    width: `${(node.anchor.colspan / columns) * 100}%`,
    height: `${((node.anchor.rowspan * rowHeight) / template.value.page.minHeight) * 100}%`
  };
}

function handleBack() {
  void router.push({
    name: 'DocumentFormTemplateList'
  });
}
</script>

<template>
  <div class="preview-page">
    <div class="preview-head">
      <div>
        <h1 class="preview-title">公文表单预览</h1>
        <p class="preview-meta">运行态根据模板节点映射共享包物料组件。</p>
      </div>
      <el-button @click="handleBack">返回管理页</el-button>
    </div>
    <div class="preview-body">
      <div class="preview-canvas">
        <component
          :is="getDocumentMaterialDefinition(node.type, context)?.runtimeRenderer"
          v-for="node in renderModel"
          :key="node.id"
          class="preview-node"
          :style="resolveStyle(node)"
          :node="node"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview-page {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  background: #eef3f8;
  padding: 24px;
}

.preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 16px;
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

.preview-body {
  overflow: auto;
}

.preview-canvas {
  position: relative;
  width: 794px;
  min-height: 1123px;
  border: 1px solid #d6deea;
  background: #fff;
  box-shadow: 0 18px 48px -30px rgb(15 23 42 / 45%);
}

.preview-node {
  position: absolute;
  overflow: hidden;
}

.preview-node :deep(.document-material-shell) {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}
</style>
