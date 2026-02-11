<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTabsStore } from '@one-base-template/core';

const router = useRouter();
const tabsStore = useTabsStore();

const model = computed({
  get: () => tabsStore.activeFullPath,
  set: v => {
    tabsStore.activeFullPath = v;
  }
});

type TabClickContext = {
  paneName?: string | number;
};

function onTabClick(pane: TabClickContext) {
  const name = String(pane.paneName ?? '');
  if (!name) return;
  router.push(name);
}

function onTabRemove(name: string | number) {
  const { next } = tabsStore.close(String(name));
  if (next) router.push(next);
}

function onRefresh() {
  tabsStore.refreshActive();
}

function onCloseOthers() {
  tabsStore.closeOthers(tabsStore.activeFullPath);
}

function onCloseAll() {
  const { next } = tabsStore.closeAll();
  if (next) router.push(next);
  else router.push('/');
}
</script>

<template>
  <div class="h-12 shrink-0 flex items-center bg-white border-b border-[var(--el-border-color)]">
    <div class="flex-1 min-w-0 px-2">
      <el-tabs
        v-model="model"
        type="card"
        class="ob-tabs"
        @tab-click="onTabClick"
        @tab-remove="onTabRemove"
      >
        <el-tab-pane
          v-for="tab in tabsStore.tabs"
          :key="tab.fullPath"
          :name="tab.fullPath"
          :label="tab.title"
          :closable="!tab.affix"
        />
      </el-tabs>
    </div>

    <div class="shrink-0 px-2 flex items-center gap-2">
      <el-button size="small" @click="onRefresh">刷新</el-button>
      <el-dropdown>
        <el-button size="small">更多</el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="onCloseOthers">关闭其他</el-dropdown-item>
            <el-dropdown-item @click="onCloseAll">关闭全部</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style scoped>
/* 避免 tabs 把高度挤压 */
:deep(.el-tabs__header) {
  margin: 0;
}
:deep(.el-tabs__nav-wrap) {
  padding: 0;
}
</style>
