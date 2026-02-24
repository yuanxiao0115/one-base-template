<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore, useLayoutStore, useMenuStore, useSystemStore, type AppMenuItem } from '@one-base-template/core';
import { useTagStoreHook } from '@one/tag';
import ThemeSwitcher from '../theme/ThemeSwitcher.vue';
import headerBgUrl from '../../assets/app-header-bg.png';

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
const systemSwitchStyle = computed(() => {
  // top-side 固定使用菜单式系统切换，保证“上方系统 + 左侧当前系统菜单”的结构一致性。
  if (layoutStore.mode === 'top-side') return 'menu';
  return layoutStore.systemSwitchStyle;
});
const showSystemSwitcherDropdown = computed(() => showSystemSwitcher.value && systemSwitchStyle.value === 'dropdown');
const showSystemSwitcherMenu = computed(() => showSystemSwitcher.value && systemSwitchStyle.value === 'menu');
const currentSystemName = computed(() => systemStore.currentSystemName);
const title = computed(() => `${currentSystemName.value} | 后台管理`);

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

      <nav
        v-if="showSystemSwitcherMenu"
        class="ob-topbar__system-menu"
        aria-label="系统切换菜单"
      >
        <button
          v-for="sys in systems"
          :key="sys.code"
          type="button"
          class="ob-topbar__system-menu-item"
          :class="{ 'is-active': currentSystemCode === sys.code }"
          :title="sys.name"
          @click="onSwitchSystem(sys.code)"
        >
          {{ sys.name }}
        </button>
      </nav>
    </div>

    <div class="ob-topbar__right">
      <ThemeSwitcher class="ob-topbar__theme" />
      <el-dropdown class="ob-topbar__user">
        <span class="ob-topbar__user-trigger" :title="userName">
          {{ userName }}
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="onLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
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
  gap: 16px;
  min-width: 0;
}

.ob-topbar__title {
  margin: 0;
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
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
}

.ob-topbar__system-menu-item {
  cursor: pointer;
  border: 1px solid rgb(255 255 255 / 25%);
  background: rgb(255 255 255 / 12%);
  color: #fff;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 13px;
  white-space: nowrap;
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    transform 150ms ease;
}

.ob-topbar__system-menu-item:hover {
  background: rgb(255 255 255 / 18%);
  border-color: rgb(255 255 255 / 32%);
}

.ob-topbar__system-menu-item.is-active {
  background: #fff;
  color: var(--el-color-primary);
  border-color: #fff;
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
</style>
