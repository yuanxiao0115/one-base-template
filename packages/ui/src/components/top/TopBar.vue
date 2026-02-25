<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore, useLayoutStore, useMenuStore, useSystemStore, type AppMenuItem } from '@one-base-template/core';
import { useTagStoreHook } from '@one/tag';
import ThemeSwitcher from '../theme/ThemeSwitcher.vue';
import headerBgUrl from '../../assets/app-header-bg.webp';

const router = useRouter();
const authStore = useAuthStore();
const layoutStore = useLayoutStore();
const menuStore = useMenuStore();
const systemStore = useSystemStore();
const tagStore = useTagStoreHook();

const userName = computed(() => authStore.user?.name ?? '未登录');
const currentSystemCode = computed(() => systemStore.currentSystemCode);
const systems = computed(() => systemStore.systems);
const showSystemSwitcher = computed(() => systems.value.length > 1);
const systemSwitchStyle = computed(() => layoutStore.systemSwitchStyle);
const showSystemSwitcherDropdown = computed(() => showSystemSwitcher.value && systemSwitchStyle.value === 'dropdown');
const showSystemSwitcherMenu = computed(() => showSystemSwitcher.value && systemSwitchStyle.value === 'menu');
const currentSystemName = computed(() => systemStore.currentSystemName);
const title = computed(() => `${currentSystemName.value} | 后台管理`);
const themeDialogVisible = ref(false);

const headerStyle = computed(() => ({
  backgroundImage: `url(${headerBgUrl})`
}));

async function onLogout() {
  await authStore.logout();
  menuStore.reset();
  systemStore.reset();
  tagStore.handleTags('equal', []);
  router.replace('/login');
}

function findFirstLeafPath(item: AppMenuItem): string | undefined {
  if (item.children?.length) {
    for (const child of item.children) {
      const leaf = findFirstLeafPath(child);
      if (leaf) return leaf;
    }
    return undefined;
  }

  if (!item.external && item.path) return item.path;
  return undefined;
}

function findFirstLeafPathFromList(list: AppMenuItem[]): string | undefined {
  for (const item of list) {
    const leaf = findFirstLeafPath(item);
    if (leaf) return leaf;
  }
  return undefined;
}

async function onSwitchSystem(systemCode: string) {
  if (!systemCode || systemCode === systemStore.currentSystemCode) return;

  systemStore.setCurrentSystem(systemCode);

  // 切系统后确保当前系统菜单已加载（fetchMenuSystems 模式通常一次性拉全量，这里主要兜底缓存不全/系统列表变更）
  if (!menuStore.loaded) {
    await menuStore.loadMenus();
  }

  let home = systemStore.resolveHomePath(systemCode);
  if (!home || !menuStore.isAllowed(home)) {
    const firstLeaf = findFirstLeafPathFromList(menuStore.menus);
    if (firstLeaf) home = firstLeaf;
  }

  if (home) {
    await router.replace(home);
  }
}

function onSelectSystemMenu(systemCode: string) {
  void onSwitchSystem(systemCode);
}

function openThemeDialog() {
  themeDialogVisible.value = true;
}
</script>

<template>
  <div class="ob-topbar" :style="headerStyle">
    <div class="ob-topbar__left">
      <p class="ob-topbar__title" :title="title">
        {{ title }}
      </p>

      <el-dropdown
        v-if="showSystemSwitcherDropdown"
        class="ob-topbar__system"
        @command="onSwitchSystem"
      >
        <span class="ob-topbar__system-trigger" :title="currentSystemName">
          切换系统：{{ currentSystemName }}
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="sys in systemStore.systems"
              :key="sys.code"
              :command="sys.code"
            >
              {{ sys.name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-menu
        v-if="showSystemSwitcherMenu"
        class="ob-topbar__system-menu"
        mode="horizontal"
        :ellipsis="true"
        :default-active="currentSystemCode"
        aria-label="系统切换菜单"
        @select="onSelectSystemMenu"
      >
        <el-menu-item
          v-for="sys in systems"
          :key="sys.code"
          :index="sys.code"
          class="ob-topbar__system-menu-item"
          :title="sys.name"
        >
          {{ sys.name }}
        </el-menu-item>
      </el-menu>
    </div>

    <div class="ob-topbar__right">
      <el-dropdown class="ob-topbar__user">
        <span class="ob-topbar__user-trigger" :title="userName">
          {{ userName }}
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="openThemeDialog">主题设置</el-dropdown-item>
            <el-dropdown-item divided @click="onLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>

  <el-dialog
    v-model="themeDialogVisible"
    class="ob-theme-dialog"
    width="560px"
    title="主题外观设置"
    append-to-body
    destroy-on-close
  >
    <div class="ob-theme-dialog__desc">
      内置主题与自定义主色互斥，切换后会自动持久化到当前项目命名空间。
    </div>
    <ThemeSwitcher />
  </el-dialog>
</template>

<style scoped>
.ob-topbar {
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgb(255 255 255 / 92%);
  background: var(--el-color-primary);
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.ob-topbar__left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.ob-topbar__title {
  margin: 0;
  padding-right: 14px;
  font-size: 20px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ob-topbar__system-trigger {
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  padding: 6px 10px;
  border-radius: 999px;
  color: #fff;
  background: rgb(255 255 255 / 14%);
  border: 1px solid rgb(255 255 255 / 22%);
  transition:
    background-color 150ms ease,
    border-color 150ms ease;
}

.ob-topbar__system-trigger:hover {
  background: rgb(255 255 255 / 18%);
  border-color: rgb(255 255 255 / 28%);
}

.ob-topbar__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ob-topbar__system-menu {
  min-width: 0;
  flex: 1;
  max-width: 58%;
  border-bottom: 0;
  background: transparent;
  --el-menu-bg-color: transparent;
  --el-menu-text-color: rgb(255 255 255 / 94%);
  --el-menu-active-color: #fff;
  --el-menu-hover-bg-color: rgb(255 255 255 / 12%);
  --el-menu-item-font-size: 14px;
  --el-menu-horizontal-height: 64px;
}

.ob-topbar__system-menu-item {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.ob-topbar :deep(.ob-topbar__system-menu.el-menu--horizontal) {
  border-bottom: 0;
}

.ob-topbar :deep(.ob-topbar__system-menu.el-menu--horizontal > .el-menu-item),
.ob-topbar :deep(.ob-topbar__system-menu.el-menu--horizontal > .el-sub-menu .el-sub-menu__title) {
  height: 64px;
  line-height: 64px;
  border-bottom: 0;
  padding: 0 28px;
  transition: background-color 180ms ease;
}

.ob-topbar :deep(.ob-topbar__system-menu.el-menu--horizontal > .el-menu-item:hover),
.ob-topbar :deep(.ob-topbar__system-menu.el-menu--horizontal > .el-sub-menu .el-sub-menu__title:hover) {
  background: rgb(255 255 255 / 12%);
}

.ob-topbar :deep(.ob-topbar__system-menu.el-menu--horizontal > .el-menu-item.is-active) {
  background: var(--one-color-primary-light-9, var(--el-color-primary-dark-2));
  color: #fff;
  border-bottom: 0;
}

.ob-topbar :deep(.ob-topbar__system-menu .el-sub-menu.is-in-menu-bar > .el-sub-menu__title) {
  color: rgb(255 255 255 / 94%);
}

.ob-topbar :deep(.ob-topbar__system-menu .el-sub-menu.is-in-menu-bar .el-sub-menu__icon-arrow) {
  color: rgb(255 255 255 / 84%);
}

.ob-topbar__user-trigger {
  cursor: pointer;
  user-select: none;
  color: #fff;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgb(255 255 255 / 12%);
  transition: background-color 150ms ease;
}

.ob-topbar__user-trigger:hover {
  background: rgb(255 255 255 / 18%);
}

/* 顶栏里，Element Plus 表单控件默认是白底，放在蓝色背景上会突兀，这里做轻量“玻璃态”处理。 */
.ob-topbar :deep(.el-input__wrapper) {
  background: rgb(255 255 255 / 14%);
  box-shadow: none;
  border: 1px solid rgb(255 255 255 / 22%);
}

.ob-topbar :deep(.el-input__inner) {
  color: #fff;
}

.ob-topbar :deep(.el-select__placeholder) {
  color: rgb(255 255 255 / 70%);
}

.ob-topbar :deep(.el-select__caret) {
  color: rgb(255 255 255 / 85%);
}

:deep(.ob-theme-dialog .el-dialog) {
  border-radius: 14px;
  overflow: hidden;
}

:deep(.ob-theme-dialog .el-dialog__header) {
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--one-border-color-light, #e4e7ed);
}

:deep(.ob-theme-dialog .el-dialog__body) {
  padding: 18px 20px 20px;
  background: linear-gradient(180deg, rgb(255 255 255 / 96%) 0%, rgb(250 252 255 / 96%) 100%);
}

.ob-theme-dialog__desc {
  margin-bottom: 14px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--one-text-color-secondary, #666666);
}
</style>
