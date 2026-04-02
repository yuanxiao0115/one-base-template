<script setup lang="ts">
import { computed } from 'vue';
import { resolveExternalTargetUrl, type AppMenuItem, useMenuStore } from '@one-base-template/core';
import { useRoute } from 'vue-router';

defineOptions({
  name: 'MenuExternalFrameHostPage'
});

const route = useRoute();
const menuStore = useMenuStore();

function findMenuByPath(list: AppMenuItem[], path: string): AppMenuItem | undefined {
  for (const item of list) {
    if (item.path === path) {
      return item;
    }
    if (item.children?.length) {
      const found = findMenuByPath(item.children, path);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

const currentMenu = computed(() => findMenuByPath(menuStore.menus, route.path));
const frameSrc = computed(() =>
  resolveExternalTargetUrl({
    redirect: currentMenu.value?.redirect
  })
);
const hasValidTarget = computed(() => Boolean(frameSrc.value));

function openInNewTab() {
  if (!frameSrc.value) {
    return;
  }
  window.open(frameSrc.value, '_blank', 'noopener,noreferrer');
}
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <div class="external-frame-page">
      <div class="external-frame-page__toolbar">
        <div class="external-frame-page__title">内嵌外链</div>
        <div class="external-frame-page__url" :title="frameSrc || ''">
          {{ frameSrc || '未配置可用外链地址，请在菜单“跳转地址”中填写 http(s) 地址。' }}
        </div>
        <el-button type="primary" link :disabled="!hasValidTarget" @click="openInNewTab"
          >新标签打开</el-button
        >
      </div>

      <iframe
        v-if="hasValidTarget"
        class="external-frame-page__iframe"
        :src="frameSrc"
        title="external-frame-host"
        referrerpolicy="no-referrer-when-downgrade"
      />

      <el-empty
        v-else
        class="external-frame-page__empty"
        description="请在菜单管理中把“跳转地址”配置为 http(s) 地址。"
      />
    </div>
  </ObPageContainer>
</template>

<style scoped>
.external-frame-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--el-bg-color-page);
}

.external-frame-page__toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

.external-frame-page__title {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.external-frame-page__url {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.external-frame-page__iframe {
  width: 100%;
  height: calc(100% - 40px);
  border: none;
  background: #fff;
}

.external-frame-page__empty {
  flex: 1;
}
</style>
