<template>
  <div class="style-config">
    <el-form label-position="top">
      <el-collapse accordion>
        <TitleStyleConfig v-model="sectionData.title" />
        <LayoutStyleConfig v-model="sectionData.container" />
        <CarouselStyleConfig v-model="sectionData.carousel" />
        <ListStyleConfig v-model="sectionData.list" :show-dot="showDot" />
      </el-collapse>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import TitleStyleConfig, { type TitleStyleModelType } from '../common/title/TitleStyleConfig.vue';
import LayoutStyleConfig, { type ContainerStyleModelType } from '../common/layout/LayoutStyleConfig.vue';
import CarouselStyleConfig, { type CarouselStyleModelType } from './CarouselStyleConfig.vue';
import ListStyleConfig, { type ListStyleModelType } from './ListStyleConfig.vue';
import { useSchemaConfig } from '../../../hooks/useSchemaConfig';

// 定义 props - 直接接收完整的schema对象
const props = defineProps<{
  schema: Record<string, any>;
}>();

// 定义事件
const emit = defineEmits(['schemaChange']);

// 定义样式数据类型
interface StyleData {
  title: TitleStyleModelType;
  container: ContainerStyleModelType;
  carousel: CarouselStyleModelType;
  list: ListStyleModelType;
}

// 使用通用hooks处理schema配置 - 不提供默认值，完全依赖props
const { sectionData } = useSchemaConfig<StyleData>({
  name: 'pb-carousel-text-list-style',
  sections: {
    title: {},
    container: {},
    carousel: {},
    list: {}
  },
  schema: props.schema,
  onChange: newSchema => {
    emit('schemaChange', 'style', newSchema);
  }
});

// 计算是否显示圆点样式选项
const showDot = computed(() => {
  try {
    // 从schema中获取内容配置，检查list.showDot的值
    const contentSchema = props.schema?.['pb-carousel-text-list-content'] || {};
    return contentSchema?.list?.showDot ?? true;
  } catch {
    return true;
  }
});

defineOptions({
  name: 'pb-carousel-text-list-style'
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
