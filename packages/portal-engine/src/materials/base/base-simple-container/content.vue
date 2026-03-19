<template>
  <div class="content-config">
    <UnifiedContainerContentConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="容器说明">
        <el-alert
          title="单容器内部提供独立子画布，支持拖拽添加和编排物料。"
          type="info"
          :closable="false"
          show-icon
        />
      </ObCard>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ObCard } from '@one-base-template/ui';

import { useSchemaConfig } from '../../../composables/useSchemaConfig';
import {
  UnifiedContainerContentConfig,
  createDefaultUnifiedContainerContentConfig,
  mergeUnifiedContainerContentConfig
} from '../../common/unified-container';
import type { UnifiedContainerContentConfigModel } from '../../common/unified-container';
import {
  BASE_SIMPLE_CONTAINER_CONTENT_NAME,
  ensureBaseSimpleContainerTabs,
  resolveBaseSimpleContainerActiveTabId
} from './model';

interface BaseSimpleContainerContentData {
  container: UnifiedContainerContentConfigModel;
  tabs: unknown;
  activeTabId: string;
}

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

const { sectionData } = useSchemaConfig<BaseSimpleContainerContentData>({
  name: BASE_SIMPLE_CONTAINER_CONTENT_NAME,
  sections: {
    container: {},
    tabs: {},
    activeTabId: {}
  },
  schema: props.schema,
  onChange: (newSchema) => {
    emit('schemaChange', 'content', newSchema);
  }
});

sectionData.container = mergeUnifiedContainerContentConfig(sectionData.container);
const defaultContainerContent = createDefaultUnifiedContainerContentConfig();
if (!sectionData.container.title.trim()) {
  sectionData.container.title = '单容器';
}
if (!sectionData.container.subtitle.trim()) {
  sectionData.container.subtitle = '承载门户组件内容';
}
if (!sectionData.container.externalLinkText.trim()) {
  sectionData.container.externalLinkText = defaultContainerContent.externalLinkText;
}

const tabs = ensureBaseSimpleContainerTabs(sectionData.tabs);
sectionData.tabs = tabs;
sectionData.activeTabId = resolveBaseSimpleContainerActiveTabId(tabs, sectionData.activeTabId);

defineOptions({
  name: 'base-simple-container-content'
});
</script>

<style scoped>
.content-config {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
