<script setup lang="ts">
import { computed, markRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  type AppMenuItem,
  useAuthStore,
  useLayoutStore,
  useMenuStore,
  useSystemStore
} from '@one-base-template/core';
import { useTagStoreHook } from '@one-base-template/tag';
import { closeDialog, message, openDialog, ThemeSwitcher } from '@one-base-template/ui';
import { ui } from '@/config';
import { routePaths } from '@/router/constants';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const layoutStore = useLayoutStore();
const menuStore = useMenuStore();
const systemStore = useSystemStore();
const tagStore = useTagStoreHook();
const PERSONALIZATION_DIALOG_ID = 'topbar-personalization-dialog';

const currentSystemCode = computed(() => systemStore.currentSystemCode);
const systems = computed(() => systemStore.systems);
const showSystemSwitcher = computed(() => systems.value.length > 1);
const systemSwitchStyle = computed(() => layoutStore.systemSwitchStyle);
const showSystemSwitcherDropdown = computed(
  () => showSystemSwitcher.value && systemSwitchStyle.value === 'dropdown'
);
const showSystemSwitcherMenu = computed(
  () => showSystemSwitcher.value && systemSwitchStyle.value === 'menu'
);
const currentSystemName = computed(() => systemStore.currentSystemName);
const title = computed(() => `${currentSystemName.value} | ${ui.topbar.titleSuffix}`);
const topbarHeight = computed(() => layoutStore.topbarHeight);
const userName = computed(() => authStore.user?.nickName || authStore.user?.name || '当前用户');
const commandPaletteHistoryKeyBase = computed(() => {
  const systemCode = systemStore.currentSystemCode || 'default';
  return `ob_command_palette_history_${systemCode}`;
});

const headerStyle = computed(() => ({
  '--ob-topbar-height': topbarHeight.value
}));

function findFirstLeafPath(item: AppMenuItem): string | undefined {
  if (item.children?.length) {
    for (const child of item.children) {
      const leafPath = findFirstLeafPath(child);
      if (leafPath) {
        return leafPath;
      }
    }
    return undefined;
  }

  if (!item.external && item.path) {
    return item.path;
  }
  return undefined;
}

function findFirstLeafPathFromList(list: AppMenuItem[]): string | undefined {
  for (const item of list) {
    const leafPath = findFirstLeafPath(item);
    if (leafPath) {
      return leafPath;
    }
  }
  return undefined;
}

async function onLogout() {
  let logoutError: unknown = null;
  try {
    await authStore.logout();
  } catch (error) {
    logoutError = error;
  } finally {
    closeDialog(PERSONALIZATION_DIALOG_ID);
    menuStore.reset();
    systemStore.reset();
    tagStore.handleTags('equal', []);
    await router.replace(routePaths.login);
  }

  if (logoutError) {
    message.warning('退出接口异常，已清理本地登录状态');
  }
}

async function onSwitchSystem(systemCode: string) {
  if (!systemCode || systemCode === systemStore.currentSystemCode) {
    return;
  }

  systemStore.setCurrentSystem(systemCode);

  if (!(menuStore.loaded || menuStore.remoteSynced)) {
    await menuStore.loadMenus();
  }

  let home = systemStore.resolveHomePath(systemCode);
  if (!(home && menuStore.isAllowed(home))) {
    const firstLeaf = findFirstLeafPathFromList(menuStore.menus);
    if (firstLeaf) {
      home = firstLeaf;
    }
  }

  if (home) {
    await router.replace(home);
  }
}

function onSelectSystemMenu(systemCode: string) {
  void onSwitchSystem(systemCode);
}

function openPersonalizationDrawer() {
  openDialog({
    id: PERSONALIZATION_DIALOG_ID,
    container: 'drawer',
    title: '个性设置',
    size: 520,
    closeOnClickModal: true,
    destroyOnClose: false,
    showFooter: false,
    component: markRaw(ThemeSwitcher)
  });
}

async function onCommandPaletteNavigate(payload: { path: string; external: boolean }) {
  if (!payload.path) {
    return;
  }

  if (payload.external) {
    window.open(payload.path, '_blank', 'noopener');
    return;
  }

  if (payload.path === route.path) {
    return;
  }

  await router.replace(payload.path);
}
</script>

<template>
  <div class="ob-topbar" :style="headerStyle">
    <div class="ob-topbar__left">
      <p class="ob-topbar__title" :title="title">{{ title }}</p>

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
      <ObCommandPalette
        :menu-items="menuStore.menus"
        :history-key-base="commandPaletteHistoryKeyBase"
        @navigate="onCommandPaletteNavigate"
      />
      <el-dropdown>
        <button type="button" class="ob-topbar__account">
          <span class="ob-topbar__avatar">{{ userName.slice(0, 1) }}</span>
          <span class="ob-topbar__user">{{ userName }}</span>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-if="ui.topbar.personalization" @click="openPersonalizationDrawer">
              个性设置
            </el-dropdown-item>
            <el-dropdown-item divided @click="onLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
  <ObDialogHost />
</template>

<style scoped>
.ob-topbar {
  height: var(--ob-topbar-height, 64px);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgb(255 255 255 / 92%);
  background: var(--el-color-primary);
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
  --el-menu-horizontal-height: var(--ob-topbar-height, 64px);
}

.ob-topbar__system-menu-item {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.ob-topbar__account {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 10px 0 6px;
  color: #fff;
  cursor: pointer;
  background: rgb(255 255 255 / 12%);
  border: 1px solid rgb(255 255 255 / 20%);
  border-radius: 999px;
}

.ob-topbar__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--el-color-primary);
  background: #fff;
  border-radius: 999px;
}

.ob-topbar__user {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ob-topbar :deep(.ob-topbar__system-menu.el-menu--horizontal) {
  border-bottom: 0;
}

.ob-topbar :deep(.ob-topbar__system-menu.el-menu--horizontal > .el-menu-item),
.ob-topbar :deep(.ob-topbar__system-menu.el-menu--horizontal > .el-sub-menu .el-sub-menu__title) {
  height: var(--ob-topbar-height, 64px);
  line-height: var(--ob-topbar-height, 64px);
  border-bottom: 0;
  padding: 0 28px;
  transition: background-color 180ms ease;
}

.ob-topbar :deep(.ob-topbar__system-menu.el-menu--horizontal > .el-menu-item:hover),
.ob-topbar
  :deep(.ob-topbar__system-menu.el-menu--horizontal > .el-sub-menu .el-sub-menu__title:hover) {
  background: rgb(255 255 255 / 12%);
}

.ob-topbar :deep(.ob-topbar__system-menu.el-menu--horizontal > .el-menu-item.is-active) {
  background: var(--one-color-primary-light-9, var(--el-color-primary-dark-2));
  color: #fff;
  border-bottom: 0;
}
</style>
