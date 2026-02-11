<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore, useLayoutStore, useMenuStore, useSystemStore, useTabsStore } from '@one-base-template/core';
import ThemeSwitcher from '../theme/ThemeSwitcher.vue';

const router = useRouter();
const authStore = useAuthStore();
const layoutStore = useLayoutStore();
const menuStore = useMenuStore();
const systemStore = useSystemStore();
const tabsStore = useTabsStore();

const userName = computed(() => authStore.user?.name ?? '未登录');
// top-side 布局会在顶栏下方渲染 SystemMenu（横向系统切换），此处不重复展示下拉切换
const showSystemSwitcher = computed(() => systemStore.systems.length > 1 && layoutStore.mode !== 'top-side');
const currentSystemName = computed(() => systemStore.currentSystemName);

async function onLogout() {
  await authStore.logout();
  menuStore.reset();
  systemStore.reset();
  tabsStore.reset();
  router.replace('/login');
}

async function onSwitchSystem(systemCode: string) {
  if (!systemCode || systemCode === systemStore.currentSystemCode) return;

  systemStore.setCurrentSystem(systemCode);

  // 切系统后确保当前系统菜单已加载（fetchMenuSystems 模式通常一次性拉全量，这里主要兜底缓存不全/系统列表变更）
  if (!menuStore.loaded) {
    await menuStore.loadMenus();
  }

  const home = systemStore.resolveHomePath(systemCode);
  if (home) {
    await router.replace(home);
  }
}
</script>

<template>
  <div class="h-14 px-4 flex items-center justify-between bg-white border-b border-[var(--el-border-color)]">
    <div class="flex items-center gap-2 min-w-0">
      <div class="font-medium shrink-0">后台管理</div>
      <el-dropdown
        v-if="showSystemSwitcher"
        @command="onSwitchSystem"
      >
        <span class="cursor-pointer select-none text-[var(--el-text-color-regular)] hover:text-[var(--el-color-primary)] truncate">
          {{ currentSystemName }}
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
      <div
        v-else
        class="text-sm text-[var(--el-text-color-regular)] truncate"
        :title="currentSystemName"
      >
        {{ currentSystemName }}
      </div>
    </div>
    <div class="flex items-center gap-3">
      <ThemeSwitcher />
      <el-dropdown>
        <span class="cursor-pointer select-none">
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
