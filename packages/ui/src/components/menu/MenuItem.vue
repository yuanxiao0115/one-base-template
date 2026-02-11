<script setup lang="ts">
import type { AppMenuItem } from '@one-base-template/core';
import MenuIcon from './MenuIcon.vue';

defineOptions({
  name: 'ObMenuItem'
});

defineProps<{
  item: AppMenuItem;
}>();
</script>

<template>
  <el-sub-menu v-if="item.children?.length" :index="item.path">
    <template #title>
      <div class="flex items-center gap-2 min-w-0">
        <MenuIcon :icon="item.icon" class="text-base shrink-0" />
        <span class="truncate">{{ item.title }}</span>
      </div>
    </template>
    <ObMenuItem
      v-for="child in item.children"
      :key="child.path"
      :item="child"
    />
  </el-sub-menu>

  <el-menu-item v-else :index="item.path">
    <div class="flex items-center gap-2 min-w-0">
      <MenuIcon :icon="item.icon" class="text-base shrink-0" />
      <span class="truncate">{{ item.title }}</span>
    </div>
  </el-menu-item>
</template>
