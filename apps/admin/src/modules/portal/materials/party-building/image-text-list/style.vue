<template>
  <div class="style-config">
    <el-form label-position="top">
      <el-collapse accordion>
        <TitleStyleConfig v-model="sectionData.title" />
        <LayoutStyleConfig v-model="sectionData.container" />
        <ListStyleConfig v-model="sectionData.list" />
      </el-collapse>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import TitleStyleConfig, {
  type TitleStyleModelType
} from '../common/title/TitleStyleConfig.vue';
import LayoutStyleConfig, {
  type ContainerStyleModelType
} from '../common/layout/LayoutStyleConfig.vue';
import ListStyleConfig from '../common/list-style/ListStyleConfig.vue';
import type { ListStyleModelType } from '../common/list-style/types';
import { useSchemaConfig } from '../../../hooks/useSchemaConfig';

// 定义 props
const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

// 定义 emit
const emit = defineEmits(['schemaChange']);

// 定义整体数据类型
interface StyleData {
  title: TitleStyleModelType;
  container: ContainerStyleModelType;
  list: ListStyleModelType;
}

// 使用通用hooks处理schema配置
const { sectionData } = useSchemaConfig<StyleData>({
  name: 'pb-image-text-list-style',
  sections: {
    title: {},
    container: {},
    list: {}
  },
  schema: props.schema,
  onChange: newSchema => {
    emit('schemaChange', 'style', newSchema);
  }
});

defineOptions({
  name: 'pb-image-text-list-style'
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
