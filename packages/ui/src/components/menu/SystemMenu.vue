<script setup lang="ts">
import type { AppSystemInfo } from '@one-base-template/core';

defineProps<{
  systems: AppSystemInfo[];
  active: string;
}>();

const emit = defineEmits<{
  (e: 'select', systemCode: string): void;
}>();

function onSelect(index: string) {
  emit('select', index);
}
</script>

<template>
  <div v-if="systems.length > 1" class="ob-system-menu px-4">
    <el-menu
      class="border-0"
      mode="horizontal"
      :default-active="active"
      @select="onSelect"
    >
      <el-menu-item
        v-for="sys in systems"
        :key="sys.code"
        :index="sys.code"
      >
        <span :title="sys.code">{{ sys.name }}</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style scoped>
.ob-system-menu {
  height: 44px;
  display: flex;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid var(--el-border-color);
}

:deep(.ob-system-menu .el-menu) {
  background: transparent !important;
}

:deep(.ob-system-menu .el-menu-item) {
  height: 32px;
  line-height: 32px;
  margin-right: 8px;
  border-radius: 2px;
  color: var(--el-text-color-primary);
}

:deep(.ob-system-menu .el-menu-item.is-active) {
  background: var(--el-color-primary-light-9) !important;
  color: var(--el-color-primary) !important;
}
</style>
