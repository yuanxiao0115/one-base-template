<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMenuStore, type AppMenuItem } from '@one-base-template/core';
import MenuItem from './MenuItem.vue';

const menuStore = useMenuStore();
const router = useRouter();
const route = useRoute();

const props = defineProps<{
  /** 可选：外部传入菜单（例如多系统模式下传入某个 system 的 children） */
  menus?: AppMenuItem[];
  /** 是否折叠侧边栏 */
  collapsed?: boolean;
}>();

const menus = computed(() => props.menus ?? menuStore.menus);
const collapsed = computed(() => Boolean(props.collapsed));
const activePath = computed(() => (typeof route.meta.activePath === 'string' ? route.meta.activePath : route.path));

function findOpenPaths(list: AppMenuItem[], target: string, parents: string[] = []): string[] {
  for (const item of list) {
    if (item.path === target) return parents;
    if (item.children?.length) {
      const found = findOpenPaths(item.children, target, [...parents, item.path]);
      if (found.length) return found;
    }
  }
  return [];
}

const openeds = computed(() => findOpenPaths(menus.value, activePath.value));

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
  <el-scrollbar class="h-full">
    <el-menu
      :key="`${activePath}:${collapsed}`"
      class="ob-sider-menu border-0"
      :default-active="activePath"
      :default-openeds="openeds"
      :collapse="collapsed"
      :collapse-transition="false"
      :unique-opened="true"
      @select="onSelect"
    >
      <MenuItem
        v-for="item in menus"
        :key="item.path"
        :item="item"
      />
    </el-menu>
  </el-scrollbar>
</template>

<style scoped>
/* 侧边菜单：对齐 sczfw 的“轻高亮 + 50px 行高” */
:deep(.ob-sider-menu) {
  background: transparent !important;
  border: none;
}

:deep(.ob-sider-menu .el-menu-item),
:deep(.ob-sider-menu .el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
  background: transparent !important;
}

:deep(.ob-sider-menu .el-menu-item:hover),
:deep(.ob-sider-menu .el-sub-menu__title:hover) {
  color: var(--el-color-primary) !important;
}

:deep(.ob-sider-menu .el-sub-menu.is-active > .el-sub-menu__title) {
  color: var(--el-color-primary) !important;
}

/* 激活叶子节点背景高亮（不改整体 hover 背景，避免“满屏蓝”） */
:deep(.ob-sider-menu .el-menu-item.is-active) {
  position: relative;
  color: var(--el-color-primary) !important;
}

:deep(.ob-sider-menu .el-menu-item.is-active::before) {
  position: absolute;
  inset: 4px 8px;
  border-radius: 3px;
  background: var(--el-color-primary-light-9);
  content: '';
}

:deep(.ob-sider-menu .el-menu-item.is-active > *) {
  position: relative;
  z-index: 1;
}
</style>
