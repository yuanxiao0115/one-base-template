<script setup lang="ts">
import { computed } from 'vue';
import CrudContainer from '../container/CrudContainer.vue';
import ThemeSwitcher from './ThemeSwitcher.vue';

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    title?: string;
  }>(),
  {
    modelValue: false,
    title: '个性配置'
  }
);

const emit = defineEmits<(event: 'update:modelValue', value: boolean) => void>();

const drawerVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});
</script>

<template>
  <CrudContainer
    v-model="drawerVisible"
    class="ob-personalization-drawer"
    container="drawer"
    mode="edit"
    :title="title"
    :drawer-size="400"
    :show-footer="false"
    :close-on-click-modal="true"
  >
    <div class="ob-personalization-drawer__inner">
      <p class="ob-personalization-drawer__desc">
        支持主题风格切换、主色微调与灰色模式，配置会自动持久化到当前项目命名空间。
      </p>

      <div class="ob-personalization-drawer__content"><ThemeSwitcher /></div>
    </div>
  </CrudContainer>
</template>

<style scoped>
.ob-personalization-drawer__inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--one-bg-color-overlay, #ffffff);
}

.ob-personalization-drawer__desc {
  margin: 0;
  padding: 14px 16px 4px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--one-text-color-secondary, #667085);
}

.ob-personalization-drawer__content {
  flex: 1;
  overflow: auto;
  padding: 8px 16px 16px;
}

:deep(.ob-personalization-drawer .el-drawer__body) {
  padding: 0;
}

@media (width <= 640px) {
  :deep(.ob-personalization-drawer) {
    width: min(100vw, 400px) !important;
  }
}
</style>
