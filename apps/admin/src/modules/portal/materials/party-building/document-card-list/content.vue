<template>
  <div class="content-config">
    <el-form label-position="top">
      <el-divider content-position="left">标题相关</el-divider>
      <TitleConfig v-model="sectionData.title" />

      <ListConfig v-model="sectionData.dataSource" />
    </el-form>
  </div>
</template>

<script setup lang="ts">
import TitleConfig, { type TitleConfigModelType } from '../common/title/TitleConfig.vue';
import ListConfig, { type CardListConfigModelType } from './ListConfig.vue';
import { useSchemaConfig } from '../../../hooks/useSchemaConfig';

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

interface ComponentData {
  title: TitleConfigModelType;
  dataSource: CardListConfigModelType;
}

const { sectionData } = useSchemaConfig<ComponentData>({
  name: 'pb-document-card-list-content',
  sections: {
    title: {},
    dataSource: {}
  },
  schema: props.schema,
  onChange: newSchema => {
    emit('schemaChange', 'content', newSchema);
  }
});

defineOptions({
  name: 'pb-document-card-list-content'
});
</script>

<style scoped>
.content-config {
  --config-text: #0f172a;
  --config-muted: #64748b;

  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-config :deep(.el-divider__text) {
  font-weight: 600;
  color: var(--config-text);
  letter-spacing: 0.2px;
}

.content-config :deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--config-muted);
}
</style>
