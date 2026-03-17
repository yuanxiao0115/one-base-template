<template>
  <div class="content-config">
    <UnifiedContainerContentConfig v-model="sectionData.container" />

    <el-form label-position="top">
      <ObCard title="容器说明">
        <el-alert
          title="该容器不展示页签，内部默认维护一个子画布用于拖拽物料。"
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
import {
  createDefaultUnifiedContainerContentConfig,
  mergeUnifiedContainerContentConfig,
  UnifiedContainerContentConfig,
  useSchemaConfig,
  type UnifiedContainerContentConfigModel
} from '@one-base-template/portal-engine';

import {
  ensureAdminSimpleContainerTabs,
  resolveAdminSimpleContainerActiveTabId,
  ADMIN_SIMPLE_CONTAINER_CONTENT_NAME
} from './model';

interface AdminSimpleContainerContentData {
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

const { sectionData } = useSchemaConfig<AdminSimpleContainerContentData>({
  name: ADMIN_SIMPLE_CONTAINER_CONTENT_NAME,
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
  sectionData.container.title = '容器组件';
}
if (!sectionData.container.subtitle.trim()) {
  sectionData.container.subtitle = '用于承载多个门户组件';
}
if (!sectionData.container.externalLinkText.trim()) {
  sectionData.container.externalLinkText = defaultContainerContent.externalLinkText;
}

const tabs = ensureAdminSimpleContainerTabs(sectionData.tabs);
sectionData.tabs = tabs;
sectionData.activeTabId = resolveAdminSimpleContainerActiveTabId(tabs, sectionData.activeTabId);

defineOptions({
  name: ADMIN_SIMPLE_CONTAINER_CONTENT_NAME
});
</script>

<style scoped>
.content-config {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
