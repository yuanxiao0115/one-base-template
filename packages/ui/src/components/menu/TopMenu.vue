<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { resolveExternalTargetUrl, useMenuStore, type AppMenuItem } from '@one-base-template/core';
import MenuItem from './MenuItem.vue';

const props = defineProps<{
  menus?: AppMenuItem[];
}>();

const menuStore = useMenuStore();
const router = useRouter();
const route = useRoute();

const menuItems = computed(() => props.menus ?? menuStore.menus);

function onSelect(index: string) {
  const item = findMenuByPath(menuItems.value, index);
  if (item?.external) {
    const target = resolveExternalTargetUrl({ redirect: item.redirect, path: item.path });
    if (!target) {
      return;
    }
    window.open(target, '_blank', 'noopener,noreferrer');
    return;
  }
  router.push(index);
}

function findMenuByPath(list: AppMenuItem[], path: string): AppMenuItem | undefined {
  for (const item of list) {
    if (item.path === path) {
      return item;
    }
    if (item.children?.length) {
      const found = findMenuByPath(item.children, path);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}
</script>

<template>
  <div class="px-4 bg-white border-b border-[var(--el-border-color)]">
    <el-menu class="border-0" mode="horizontal" :default-active="route.path" @select="onSelect">
      <MenuItem v-for="item in menuItems" :key="item.path" :item="item" />
    </el-menu>
  </div>
</template>
