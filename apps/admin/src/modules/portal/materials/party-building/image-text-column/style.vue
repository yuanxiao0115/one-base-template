<template>
  <div class="style-config">
    <el-form label-position="top">
      <el-collapse accordion>
        <LayoutStyleConfig v-model="sectionData.container" />
        <ListStyleConfig v-model="sectionData.list" />
      </el-collapse>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import LayoutStyleConfig, {
  type ContainerStyleModelType
} from '../common/layout/LayoutStyleConfig.vue';
import ListStyleConfig from '../common/list-style/ListStyleConfig.vue';
import type { ListStyleModelType } from '../common/list-style/types';
import { useSchemaConfig } from '../../../hooks/useSchemaConfig';

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['schemaChange']);

interface StyleData {
  container: ContainerStyleModelType;
  list: ListStyleModelType;
}

const { sectionData } = useSchemaConfig<StyleData>({
  name: 'pb-image-text-column-style',
  sections: {
    container: {},
    list: {}
  },
  schema: props.schema,
  onChange: newSchema => {
    emit('schemaChange', 'style', newSchema);
  }
});

defineOptions({
  name: 'pb-image-text-column-style'
});
</script>

<style scoped>
.style-config {
  --config-border: #e2e8f0;
  --config-surface: #f8fafc;
  --config-surface-strong: #fff;
  --config-text: #0f172a;
  --config-muted: #64748b;

  padding: 10px;
}

.style-config :deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--config-muted);
}

.style-config :deep(.el-divider__text) {
  font-weight: 600;
  color: var(--config-text);
  letter-spacing: 0.2px;
}
</style>
