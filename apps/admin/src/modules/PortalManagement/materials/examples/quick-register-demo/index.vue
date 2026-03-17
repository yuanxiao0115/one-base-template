<template>
  <div class="quick-demo" :style="styleObject">
    <div class="quick-demo__title">{{ title }}</div>
    <div class="quick-demo__desc">{{ description }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';

interface QuickDemoSchema {
  content?: {
    title?: string;
    description?: string;
  };
  style?: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
  };
}

const props = defineProps<{
  schema: QuickDemoSchema;
}>();

const title = computed(() => props.schema?.content?.title || '注册示例卡片');
const description = computed(
  () => props.schema?.content?.description || '这里是 admin 外部注册示例。'
);

const styleObject = computed<CSSProperties>(() => ({
  backgroundColor: props.schema?.style?.backgroundColor || '#fff7ed',
  color: props.schema?.style?.textColor || '#9a3412',
  border: `1px solid ${props.schema?.style?.borderColor || '#fdba74'}`
}));

defineOptions({
  name: 'admin-quick-demo-index'
});
</script>

<style scoped>
.quick-demo {
  display: flex;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  padding: 16px;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.quick-demo__title {
  font-size: 18px;
  font-weight: 700;
}

.quick-demo__desc {
  font-size: 13px;
  opacity: 0.9;
}
</style>
