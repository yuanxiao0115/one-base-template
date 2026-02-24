<template>
  <div class="content-config">
    <el-form label-position="top">
      <el-divider content-position="left">图片设置</el-divider>
      <ImageConfig v-model="sectionData.image" />

      <ListConfig v-model="sectionData.dataSource" />
    </el-form>
  </div>
</template>

<script setup lang="ts">
import ImageConfig, { type ImageConfigModelType } from './ImageConfig.vue';
import ListConfig, { type ColumnListConfigModelType } from './ListConfig.vue';
import { useSchemaConfig } from '../../../hooks/useSchemaConfig';

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

interface ComponentData {
  image: ImageConfigModelType;
  dataSource: ColumnListConfigModelType;
}

const { sectionData } = useSchemaConfig<ComponentData>({
  name: 'pb-image-text-column-content',
  sections: {
    image: {},
    dataSource: {}
  },
  schema: props.schema,
  onChange: newSchema => {
    emit('schemaChange', 'content', newSchema);
  }
});

defineOptions({
  name: 'pb-image-text-column-content'
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
