<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMenuStore, type AppMenuItem } from '@one-base-template/core';
import MenuItem from './MenuItem.vue';

const props = defineProps<{
  menus?: AppMenuItem[];
}>();

const menuStore = useMenuStore();
const router = useRouter();
const route = useRoute();

const menus = computed(() => props.menus ?? menuStore.menus);

function onSelect(index: string) {
  const item = findMenuByPath(menus.value, index);
  if (item?.external) {
    window.open(item.path, '_blank', 'noopener,noreferrer');
    return;
  }
  router.push(index);
}

function findMenuByPath(list: AppMenuItem[], path: string): AppMenuItem | undefined {
  for (const item of list) {
    if (item.path === path) return item;
    if (item.children?.length) {
      const found = findMenuByPath(item.children, path);
      if (found) return found;
    }
  }
  return undefined;
}
</script>

<template>
  <div class="px-4 bg-white border-b border-[var(--el-border-color)]">
    <el-menu
      class="border-0"
      mode="horizontal"
      :default-active="route.path"
      @select="onSelect"
    >
      <MenuItem
        v-for="item in menus"
        :key="item.path"
        :item="item"
      />
    </el-menu>
  </div>
</template>

