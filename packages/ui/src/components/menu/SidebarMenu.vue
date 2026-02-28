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
        :collapsed="collapsed"
      />
    </el-menu>
  </el-scrollbar>
</template>

<style scoped>
/* 侧边菜单：按设计稿统一三级导航的默认/悬浮/激活状态 */
:deep(.ob-sider-menu) {
  --el-menu-item-height: 48px;
  background: transparent !important;
  border: none;
}

:deep(.ob-sider-menu .el-menu-item),
:deep(.ob-sider-menu .el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
  font-weight: 400;
  color: var(--one-text-color-regular, #333333);
  background: transparent !important;
  transition:
    color 180ms ease,
    background-color 180ms ease;
}

:deep(.ob-sider-menu .el-sub-menu__icon-arrow) {
  color: var(--one-text-color-secondary, #666666);
}

:deep(.ob-sider-menu:not(.el-menu--collapse) .el-menu-item),
:deep(.ob-sider-menu:not(.el-menu--collapse) .el-sub-menu__title) {
  padding: 0 16px !important;
}

:deep(.ob-sider-menu:not(.el-menu--collapse) .el-menu .el-menu-item),
:deep(.ob-sider-menu:not(.el-menu--collapse) .el-menu .el-sub-menu__title) {
  padding-left: 40px !important;
}

:deep(.ob-sider-menu:not(.el-menu--collapse) .el-menu .el-menu .el-menu-item),
:deep(.ob-sider-menu:not(.el-menu--collapse) .el-menu .el-menu .el-sub-menu__title) {
  padding-left: 56px !important;
}

:deep(.ob-sider-menu .el-menu-item:not(.is-active):hover),
:deep(.ob-sider-menu .el-sub-menu__title:hover) {
  color: var(--one-color-primary-light-7, var(--el-color-primary)) !important;
  background: var(--one-color-primary-light-1, var(--el-color-primary-light-9)) !important;
}

/* 菜单组不做激活高亮，避免父级与叶子同时高亮造成视觉噪音 */
:deep(.ob-sider-menu .el-sub-menu.is-active > .el-sub-menu__title) {
  color: var(--one-text-color-regular, #333333) !important;
  background: transparent !important;
}

/* 激活项背景铺满整行，符合侧栏选中态视觉规范 */
:deep(.ob-sider-menu .el-menu-item.is-active) {
  color: var(--one-color-primary-light-7, var(--el-color-primary)) !important;
  background: var(--one-color-primary-light-1, var(--el-color-primary-light-9)) !important;
}

:deep(.ob-sider-menu .el-sub-menu.is-active > .el-sub-menu__title .el-sub-menu__icon-arrow) {
  color: var(--one-text-color-secondary, #666666) !important;
}

:deep(.ob-sider-menu .el-menu-item.is-disabled),
:deep(.ob-sider-menu .el-sub-menu.is-disabled > .el-sub-menu__title) {
  color: var(--one-text-color-disabled, #999999) !important;
  background: transparent !important;
}
</style>
