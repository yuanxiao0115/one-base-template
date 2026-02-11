<script setup lang="ts">
import type { AppMenuItem } from '@one-base-template/core';
import MenuIcon from './MenuIcon.vue';

defineProps<{
  systems: AppMenuItem[];
  active: string;
}>();

const emit = defineEmits<{
  (e: 'select', path: string): void;
}>();

function onSelect(index: string) {
  emit('select', index);
}
</script>

<template>
  <div v-if="systems.length" class="bg-white border-b border-[var(--el-border-color)] px-2">
    <el-menu
      class="border-0"
      mode="horizontal"
      :default-active="active"
      @select="onSelect"
    >
      <el-menu-item
        v-for="sys in systems"
        :key="sys.path"
        :index="sys.path"
      >
        <div class="flex items-center gap-2">
          <MenuIcon :icon="sys.icon" class="text-base" />
          <span>{{ sys.title }}</span>
        </div>
      </el-menu-item>
    </el-menu>
  </div>
</template>

