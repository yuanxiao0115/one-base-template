<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { DocumentTemplateSchema } from '@one-base-template/document-form-engine';
import { DocumentFormDesignerLayout } from '@one-base-template/document-form-engine/designer';

import { createMockDocumentTemplate } from '../mock/template';
import { getDocumentFormAdminServices, setupDocumentFormEngineForAdmin } from '../engine/register';
import type { DocumentTemplateRecord } from '../services/template-service';

defineOptions({
  name: 'DocumentFormDesignerPage'
});

const router = useRouter();
const context = setupDocumentFormEngineForAdmin();
const templateService = getDocumentFormAdminServices(context).templateService;
const initialDraft = templateService.ensureDraft(createMockDocumentTemplate());
const initialSnapshot = templateService.getSnapshot();

const template = ref<DocumentTemplateSchema>(initialDraft.template);
const draftVersion = ref<number>(initialDraft.version);
const publishedVersion = ref<number>(initialSnapshot.published?.version ?? 0);
const publishedHistory = ref<DocumentTemplateRecord[]>(
  initialSnapshot.history
    .filter((item) => item.status === 'published')
    .slice()
    .reverse()
);
const publishNote = ref<string>('设计器发布');
const rollbackVersion = ref<number | ''>(publishedVersion.value || '');
const operationHint = ref<string>('当前为草稿态');

function syncSnapshotState() {
  const snapshot = templateService.getSnapshot();
  publishedVersion.value = snapshot.published?.version ?? 0;
  publishedHistory.value = snapshot.history
    .filter((item) => item.status === 'published')
    .slice()
    .reverse();
}

function handleBack() {
  void router.push({
    name: 'DocumentFormTemplateList'
  });
}

function handleTemplateChange(nextTemplate: DocumentTemplateSchema) {
  template.value = nextTemplate;
  const nextDraft = templateService.updateDraft(nextTemplate, '设计器实时保存草稿');
  draftVersion.value = nextDraft.version;
  syncSnapshotState();
}

function publishDraft() {
  const note = publishNote.value.trim() || '设计器发布';
  const published = templateService.publishDraft(note);
  draftVersion.value = published.version;
  rollbackVersion.value = published.version;
  operationHint.value = `已发布版本 v${published.version}（${note}）`;
  syncSnapshotState();
}

function handleRollbackVersionChange(event: Event) {
  const value = Number((event.target as HTMLSelectElement).value);
  rollbackVersion.value = Number.isFinite(value) && value > 0 ? value : '';
}

function rollbackToPublished() {
  const draft = templateService.rollbackToPublished(
    rollbackVersion.value === '' ? undefined : rollbackVersion.value
  );
  if (!draft) {
    operationHint.value = '暂无可回滚的发布版本';
    return;
  }

  template.value = draft.template;
  draftVersion.value = draft.version;
  operationHint.value = `已回滚到发布版本 v${draft.version}`;
  syncSnapshotState();
}
</script>

<template>
  <div class="designer-page">
    <div class="designer-page__toolbar">
      <div class="designer-page__meta-panel">
        <div class="designer-page__meta">
          <span>草稿版本：v{{ draftVersion }}</span>
          <span>发布版本：v{{ publishedVersion || '-' }}</span>
          <span>{{ operationHint }}</span>
        </div>
        <div class="designer-page__history">
          <span class="designer-page__history-label">发布历史</span>
          <ul v-if="publishedHistory.length > 0" class="designer-page__history-list">
            <li v-for="record in publishedHistory.slice(0, 5)" :key="record.id">
              <span>v{{ record.version }}</span>
              <span>{{ record.note }}</span>
            </li>
          </ul>
          <span v-else class="designer-page__history-empty">暂无发布记录</span>
        </div>
      </div>
      <div class="designer-page__actions-panel">
        <label class="designer-page__note">
          <span>发布备注</span>
          <input v-model="publishNote" type="text" maxlength="50" />
        </label>
        <div class="designer-page__actions">
          <label class="designer-page__rollback">
            <span>回滚版本</span>
            <select
              :value="rollbackVersion"
              :disabled="publishedHistory.length === 0"
              @change="handleRollbackVersionChange"
            >
              <option value="">最新发布版本</option>
              <option v-for="record in publishedHistory" :key="record.id" :value="record.version">
                v{{ record.version }} - {{ record.note }}
              </option>
            </select>
          </label>
          <button type="button" @click="publishDraft">发布</button>
          <button type="button" :disabled="!publishedVersion" @click="rollbackToPublished">
            回滚
          </button>
        </div>
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
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  padding: 8px 12px;
  border-bottom: 1px solid #d8dee8;
  background: #f8fafc;
}

.designer-page__meta-panel {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
}

.designer-page__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #334155;
  font-size: 12px;
}

.designer-page__history {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.designer-page__history-label {
  color: #475569;
  font-size: 12px;
  line-height: 20px;
}

.designer-page__history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.designer-page__history-list li {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border: 1px solid #dbeafe;
  background: #eff6ff;
  color: #1e3a8a;
  font-size: 12px;
}

.designer-page__history-empty {
  color: #94a3b8;
  font-size: 12px;
  line-height: 20px;
}

.designer-page__actions-panel {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.designer-page__note {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #334155;
  font-size: 12px;
}

.designer-page__note input {
  width: 220px;
  padding: 4px 6px;
  border: 1px solid #cbd5e1;
  background: #fff;
}

.designer-page__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.designer-page__rollback {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #334155;
  font-size: 12px;
}

.designer-page__rollback select {
  width: 180px;
  padding: 4px 6px;
  border: 1px solid #cbd5e1;
  background: #fff;
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

@media (max-width: 1180px) {
  .designer-page__toolbar {
    grid-template-columns: 1fr;
  }

  .designer-page__actions-panel {
    align-items: flex-start;
  }
}
</style>
