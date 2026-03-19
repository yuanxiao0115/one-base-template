<template>
  <div class="content-config">
    <UnifiedContainerContentConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="页签配置">
        <div class="tabs-actions">
          <el-button size="small" type="primary" plain @click="addTab">新增页签</el-button>
        </div>

        <div v-if="sectionData.tabs.length > 0" class="tabs-list">
          <div v-for="tab in sectionData.tabs" :key="tab.id" class="tabs-item">
            <el-radio
              :model-value="sectionData.activeTabId"
              :label="tab.id"
              class="tabs-item__radio"
              @change="setActiveTab(tab.id)"
            >
              当前激活
            </el-radio>

            <el-input
              v-model.trim="tab.title"
              maxlength="24"
              show-word-limit
              placeholder="页签标题"
            />

            <div class="tabs-item__meta">
              ID: {{ tab.id }} · 子组件: {{ tab.layoutItems.length }}
            </div>

            <el-button
              size="small"
              type="danger"
              plain
              :disabled="sectionData.tabs.length <= 1"
              @click="removeTab(tab.id)"
            >
              删除
            </el-button>
          </div>
        </div>

        <el-empty v-else description="请至少保留一个页签" :image-size="70" />

        <div class="tip">说明：Tab 内子组件由画布区域直接拖拽编辑，这里仅维护页签结构。</div>
      </ObCard>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { ObCard } from '@one-base-template/ui';

import { deepClone } from '../../../utils/deep';
import {
  createTabContainerTabId,
  normalizeTabContainerTabs,
  resolveTabContainerActiveTabId
} from '../../../schema/tab-container';
import type { PortalLayoutItem } from '../../../stores/pageLayout';
import {
  UnifiedContainerContentConfig,
  createDefaultUnifiedContainerContentConfig,
  mergeUnifiedContainerContentConfig
} from '../../common/unified-container';
import type { UnifiedContainerContentConfigModel } from '../../common/unified-container';

interface TabMeta {
  id: string;
  title: string;
  layoutItems: PortalLayoutItem[];
}

interface BaseTabContainerContentData {
  container: UnifiedContainerContentConfigModel;
  tabs: TabMeta[];
  activeTabId: string;
}

const props = defineProps<{
  schema: {
    container?: Partial<UnifiedContainerContentConfigModel>;
    tabs?: Array<{ id?: string; title?: string; layoutItems?: PortalLayoutItem[] }>;
    activeTabId?: string;
  };
}>();

const emit = defineEmits<{
  schemaChange: [type: 'content', schema: Record<string, unknown>];
}>();

const syncingFromSchema = ref(false);

const sectionData = reactive<BaseTabContainerContentData>({
  container: createDefaultUnifiedContainerContentConfig(),
  tabs: [],
  activeTabId: ''
});

function syncFromSchema() {
  syncingFromSchema.value = true;
  sectionData.container = mergeUnifiedContainerContentConfig(props.schema?.container);
  sectionData.tabs = normalizeTabContainerTabs<PortalLayoutItem>(props.schema?.tabs).map((tab) => ({
    id: tab.id,
    title: tab.title,
    layoutItems: Array.isArray(tab.layoutItems) ? tab.layoutItems : []
  }));

  if (sectionData.tabs.length === 0) {
    sectionData.tabs = [
      {
        id: createTabContainerTabId(1),
        title: '页签1',
        layoutItems: []
      }
    ];
  }

  sectionData.activeTabId = resolveTabContainerActiveTabId(
    sectionData.tabs,
    props.schema?.activeTabId
  );
  syncingFromSchema.value = false;
}

function nextTabId(): string {
  let seed = sectionData.tabs.length + 1;
  while (sectionData.tabs.some((item) => item.id === createTabContainerTabId(seed))) {
    seed += 1;
  }
  return createTabContainerTabId(seed);
}

function setActiveTab(tabId: string) {
  sectionData.activeTabId = tabId;
}

function addTab() {
  const id = nextTabId();
  sectionData.tabs.push({
    id,
    title: `页签${sectionData.tabs.length + 1}`,
    layoutItems: []
  });
  sectionData.activeTabId = id;
}

function removeTab(tabId: string) {
  if (sectionData.tabs.length <= 1) {
    return;
  }
  sectionData.tabs = sectionData.tabs.filter((tab) => tab.id !== tabId);
  sectionData.activeTabId = resolveTabContainerActiveTabId(
    sectionData.tabs,
    sectionData.activeTabId
  );
}

function emitSchemaChange() {
  emit('schemaChange', 'content', {
    name: 'base-tab-container-content',
    container: deepClone(sectionData.container),
    tabs: deepClone(sectionData.tabs),
    activeTabId: sectionData.activeTabId
  });
}

watch(
  () => props.schema,
  () => {
    syncFromSchema();
  },
  { immediate: true, deep: true }
);

watch(
  sectionData,
  () => {
    if (syncingFromSchema.value) {
      return;
    }
    sectionData.activeTabId = resolveTabContainerActiveTabId(
      sectionData.tabs,
      sectionData.activeTabId
    );
    emitSchemaChange();
  },
  { deep: true }
);

if (!sectionData.container.title.trim()) {
  sectionData.container.title = 'Tab容器';
}
if (!sectionData.container.subtitle.trim()) {
  sectionData.container.subtitle = '按页签分组承载组件内容';
}

defineOptions({
  name: 'base-tab-container-content'
});
</script>

<style scoped>
.content-config {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tabs-actions {
  margin-bottom: 8px;
}

.tabs-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tabs-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 10px;
  background: var(--el-fill-color-blank);
}

.tabs-item__radio {
  margin-right: 0;
}

.tabs-item__meta {
  grid-column: 2 / 3;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.tip {
  margin-top: 8px;
  font-size: 12px;
  color: #64748b;
}
</style>
