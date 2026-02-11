<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore, useMenuStore, useTabsStore } from '@standard-base-tamplate/core';
import ThemeSwitcher from '../theme/ThemeSwitcher.vue';

const router = useRouter();
const authStore = useAuthStore();
const menuStore = useMenuStore();
const tabsStore = useTabsStore();

const userName = computed(() => authStore.user?.name ?? '未登录');

async function onLogout() {
  await authStore.logout();
  menuStore.reset();
  tabsStore.reset();
  router.replace('/login');
}
</script>

<template>
  <div class="h-14 px-4 flex items-center justify-between bg-white border-b border-[var(--el-border-color)]">
    <div class="font-medium">后台管理</div>
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
