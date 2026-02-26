<script setup lang="ts">
import { computed } from 'vue';
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

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
}>();

const drawerVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

function closeDrawer() {
  drawerVisible.value = false;
}
</script>

<template>
  <el-drawer
    v-model="drawerVisible"
    class="ob-personalization-drawer"
    direction="rtl"
    :size="420"
    :with-header="false"
    append-to-body
    destroy-on-close
  >
    <div class="ob-personalization-drawer__inner">
      <header class="ob-personalization-drawer__header">
        <h3>{{ title }}</h3>
        <button
          type="button"
          class="ob-personalization-drawer__close"
          aria-label="关闭个性配置"
          @click="closeDrawer"
        >
          ×
        </button>
      </header>

      <p class="ob-personalization-drawer__desc">
        支持主题风格切换、主色微调与灰色模式，配置会自动持久化到当前项目命名空间。
      </p>

      <div class="ob-personalization-drawer__content">
        <ThemeSwitcher />
      </div>
    </div>
  </el-drawer>
</template>

<style scoped>
.ob-personalization-drawer__inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--one-bg-color-overlay, #ffffff);
}

.ob-personalization-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--one-border-color-light, #e4e7ed);
}

.ob-personalization-drawer__header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--one-text-color-primary, #112129);
}

.ob-personalization-drawer__close {
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--one-text-color-secondary, #667085);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.ob-personalization-drawer__close:hover {
  background: rgb(15 23 42 / 7%);
}

.ob-personalization-drawer__desc {
  margin: 0;
  padding: 14px 16px 2px;
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
    width: min(100vw, 420px) !important;
  }
}
</style>
