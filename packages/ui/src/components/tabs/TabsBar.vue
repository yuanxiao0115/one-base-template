<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTabsStore } from '@one-base-template/core';

const router = useRouter();
const tabsStore = useTabsStore();

const model = computed({
  get: () => tabsStore.activeKey,
  set: v => {
    tabsStore.activeKey = v;
  }
});

type TabClickContext = {
  paneName?: string | number;
};

function onTabClick(pane: TabClickContext) {
  const key = String(pane.paneName ?? '');
  if (!key) return;
  const tab = tabsStore.tabs.find(t => t.key === key);
  if (!tab) return;
  router.push(tab.fullPath);
}

function onTabRemove(name: string | number) {
  const { nextFullPath } = tabsStore.close(String(name));
  if (nextFullPath) router.push(nextFullPath);
}

function onRefresh() {
  tabsStore.refreshActive();
}

function onCloseOthers() {
  tabsStore.closeOthers(tabsStore.activeKey);
  const tab = tabsStore.activeTab;
  if (tab?.fullPath) router.push(tab.fullPath);
}

function onCloseAll() {
  const { nextFullPath } = tabsStore.closeAll();
  if (nextFullPath) router.push(nextFullPath);
  else router.push('/');
}

function onCloseLeft() {
  tabsStore.closeLeft(tabsStore.activeKey);
  const tab = tabsStore.activeTab;
  if (tab?.fullPath) router.push(tab.fullPath);
}

function onCloseRight() {
  tabsStore.closeRight(tabsStore.activeKey);
  const tab = tabsStore.activeTab;
  if (tab?.fullPath) router.push(tab.fullPath);
}

type ContextCommand = 'refresh' | 'close' | 'closeLeft' | 'closeRight' | 'closeOthers' | 'closeAll';

function onContextCommand(command: ContextCommand, tabKey: string) {
  switch (command) {
    case 'refresh':
      tabsStore.activeKey = tabKey;
      tabsStore.refreshActive();
      return;
    case 'close': {
      const { nextFullPath } = tabsStore.close(tabKey);
      if (nextFullPath) router.push(nextFullPath);
      return;
    }
    case 'closeLeft':
      tabsStore.activeKey = tabKey;
      tabsStore.closeLeft(tabKey);
      break;
    case 'closeRight':
      tabsStore.activeKey = tabKey;
      tabsStore.closeRight(tabKey);
      break;
    case 'closeOthers':
      tabsStore.closeOthers(tabKey);
      break;
    case 'closeAll': {
      const { nextFullPath } = tabsStore.closeAll();
      if (nextFullPath) router.push(nextFullPath);
      else router.push('/');
      return;
    }
  }

  const tab = tabsStore.activeTab;
  if (tab?.fullPath) router.push(tab.fullPath);
}

function canCloseCurrent(tabKey: string) {
  const tab = tabsStore.tabs.find(t => t.key === tabKey);
  return Boolean(tab && !tab.affix);
}

function hasClosableLeft(tabKey: string) {
  const index = tabsStore.tabs.findIndex(t => t.key === tabKey);
  if (index <= 0) return false;
  return tabsStore.tabs.slice(0, index).some(t => !t.affix);
}

function hasClosableRight(tabKey: string) {
  const index = tabsStore.tabs.findIndex(t => t.key === tabKey);
  if (index < 0) return false;
  return tabsStore.tabs.slice(index + 1).some(t => !t.affix);
}
</script>

<template>
  <div class="ob-tabs-bar h-12 shrink-0 flex items-center">
    <div class="flex-1 min-w-0 px-4">
      <el-tabs
        v-model="model"
        type="card"
        class="ob-tabs"
        @tab-click="onTabClick"
        @tab-remove="onTabRemove"
      >
        <el-tab-pane
          v-for="tab in tabsStore.tabs"
          :key="tab.key"
          :name="tab.key"
          :closable="!tab.affix"
        >
          <template #label>
            <el-dropdown
              trigger="contextmenu"
              @command="(cmd: ContextCommand) => onContextCommand(cmd, tab.key)"
            >
              <span class="ob-tab-label" :title="tab.title">
                {{ tab.title }}
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="refresh">刷新</el-dropdown-item>
                  <el-dropdown-item command="close" :disabled="!canCloseCurrent(tab.key)">关闭</el-dropdown-item>
                  <el-dropdown-item command="closeLeft" :disabled="!hasClosableLeft(tab.key)">关闭左侧</el-dropdown-item>
                  <el-dropdown-item command="closeRight" :disabled="!hasClosableRight(tab.key)">关闭右侧</el-dropdown-item>
                  <el-dropdown-item command="closeOthers">关闭其他</el-dropdown-item>
                  <el-dropdown-item command="closeAll">关闭全部</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="shrink-0 px-4 flex items-center gap-2">
      <el-button size="small" @click="onRefresh">刷新</el-button>
      <el-dropdown>
        <el-button size="small">更多</el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="onCloseLeft">关闭左侧</el-dropdown-item>
            <el-dropdown-item @click="onCloseRight">关闭右侧</el-dropdown-item>
            <el-dropdown-item @click="onCloseOthers">关闭其他</el-dropdown-item>
            <el-dropdown-item @click="onCloseAll">关闭全部</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style scoped>
/* sczfw 风格：白底 + 轻阴影 */
.ob-tabs-bar {
  background: #fff;
  box-shadow: 0 0 1px rgb(136 136 136 / 90%);
}

/* 避免 tabs 把高度挤压 + 做“标签页”外观 */
:deep(.el-tabs__header) {
  margin: 0;
}
:deep(.el-tabs__nav-wrap) {
  padding: 0;
}

:deep(.ob-tabs .el-tabs__nav-wrap::after) {
  height: 0;
}

:deep(.ob-tabs .el-tabs__nav) {
  border: none;
}

:deep(.ob-tabs .el-tabs__item) {
  height: 28px;
  line-height: 28px;
  margin: 10px 8px 10px 0;
  border: 1px solid transparent;
  border-radius: 2px;
  background: var(--el-bg-color-page);
  color: var(--el-text-color-primary);
  transition:
    color 150ms ease,
    background-color 150ms ease,
    border-color 150ms ease;
}

.ob-tab-label {
  display: inline-flex;
  align-items: center;
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.ob-tabs .el-tabs__item:hover) {
  color: var(--el-color-primary);
}

:deep(.ob-tabs .el-tabs__item.is-active) {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
}

:deep(.ob-tabs .el-tabs__item .is-icon-close) {
  top: 50%;
  transform: translateY(-50%);
}
</style>
