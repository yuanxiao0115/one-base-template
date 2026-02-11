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
  <div v-if="systems.length > 1" class="bg-white border-b border-[var(--el-border-color)] px-2">
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
