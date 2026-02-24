<template>
  <div class="content-config">
    <el-form label-position="top">
      <!-- 使用TitleConfig组件 -->
      <el-divider content-position="left">标题相关</el-divider>
      <TitleConfig v-model="sectionData.title" />

      <CarouselConfig v-model="sectionData.dataSource" />
    </el-form>
  </div>
</template>

<script setup lang="ts">
import TitleConfig, { type TitleConfigModelType } from '../common/title/TitleConfig.vue';
import CarouselConfig, { type CarouselConfigModelValue } from './CarouselConfig.vue';
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
interface ComponentData {
  title: TitleConfigModelType;
  dataSource: CarouselConfigModelValue;
}

// 使用通用hooks处理schema配置
const { sectionData } = useSchemaConfig<ComponentData>({
  name: 'pb-carousel-text-list-content',
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
  name: 'pb-carousel-text-list-content'
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
