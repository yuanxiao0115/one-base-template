<script setup lang="ts">
import { computed } from 'vue';
import type { AppMenuItem } from '@one-base-template/core';
import MenuIcon from './MenuIcon.vue';
import MenuLabel from './MenuLabel.vue';

defineOptions({
  name: 'ObMenuItem'
});

const props = defineProps<{
  item: AppMenuItem;
  collapsed?: boolean;
}>();

const collapsed = computed(() => Boolean(props.collapsed));
</script>

<template>
  <el-sub-menu v-if="props.item.children?.length" :index="props.item.path">
    <template #title>
      <div class="ob-menu-item__inner">
        <MenuIcon :icon="props.item.icon" class="text-base shrink-0" />
        <MenuLabel v-if="!collapsed" :title="props.item.title" class="ob-menu-item__label" />
      </div>
    </template>
    <ObMenuItem
      v-for="child in props.item.children"
      :key="child.path"
      :item="child"
      :collapsed="collapsed"
    />
  </el-sub-menu>

  <el-menu-item v-else :index="props.item.path">
    <div class="ob-menu-item__inner">
      <MenuIcon :icon="props.item.icon" class="text-base shrink-0" />
      <MenuLabel v-if="!collapsed" :title="props.item.title" class="ob-menu-item__label" />
    </div>
  </el-menu-item>
</template>

<style scoped>
.ob-menu-item__inner {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  gap: 8px;
}

.ob-menu-item__label {
  flex: 1;
  min-width: 0;
}
</style>
