<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMenuStore, type AppMenuItem } from '@standard-base-tamplate/core';

const menuStore = useMenuStore();
const router = useRouter();
const route = useRoute();

const menus = computed(() => menuStore.menus);

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
  <el-scrollbar class="h-[calc(100vh-56px)]">
    <el-menu
      class="border-0"
      :default-active="route.path"
      @select="onSelect"
    >
      <template v-for="item in menus" :key="item.path">
        <el-sub-menu v-if="item.children?.length" :index="item.path">
          <template #title>
            <span>{{ item.title }}</span>
          </template>
          <el-menu-item
            v-for="child in item.children"
            :key="child.path"
            :index="child.path"
          >
            {{ child.title }}
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item v-else :index="item.path">
          {{ item.title }}
        </el-menu-item>
      </template>
    </el-menu>
  </el-scrollbar>
</template>
