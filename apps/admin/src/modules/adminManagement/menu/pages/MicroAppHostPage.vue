<script setup lang="ts">
import { computed } from 'vue';
import { type AppMenuItem, useAuthStore, useMenuStore } from '@one-base-template/core';
import { useRoute } from 'vue-router';

defineOptions({
  name: 'MenuMicroAppHostPage'
});

interface MicroRemarkConfig {
  appName?: string;
  disableSandbox?: boolean;
  [key: string]: unknown;
}

const route = useRoute();
const menuStore = useMenuStore();
const authStore = useAuthStore();

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

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

function parseRemarkConfig(raw: string | undefined): MicroRemarkConfig {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as MicroRemarkConfig) : {};
  } catch {
    return {};
  }
}

function buildDefaultAppName(pathname: string): string {
  const slug = pathname
    .replace(/^\/micro\/?/, '')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
  return `micro-${slug || 'app'}`;
}

const currentMenu = computed(() => findMenuByPath(menuStore.menus, route.path));
const remarkConfig = computed(() => parseRemarkConfig(currentMenu.value?.remark));
const rawTarget = computed(() => {
  const redirect =
    typeof currentMenu.value?.redirect === 'string' ? currentMenu.value.redirect.trim() : '';
  return redirect || '';
});
const frameSrc = computed(() => (isHttpUrl(rawTarget.value) ? rawTarget.value : ''));
const hasValidTarget = computed(() => Boolean(frameSrc.value));
const microAppAvailable = computed(() => {
  if (typeof window === 'undefined') {
    return false;
  }
  return (
    typeof window.customElements?.get === 'function' &&
    Boolean(window.customElements.get('micro-app'))
  );
});

const appName = computed(() => {
  const configuredName = remarkConfig.value.appName;
  if (typeof configuredName === 'string' && configuredName.trim()) {
    return configuredName.trim();
  }
  return buildDefaultAppName(route.path);
});
const disableSandbox = computed(() => remarkConfig.value.disableSandbox === true);
const microData = computed(() => ({
  routePath: route.path,
  user: authStore.user ?? undefined
}));

function openInNewTab() {
  if (!frameSrc.value) {
    return;
  }
  window.open(frameSrc.value, '_blank', 'noopener,noreferrer');
}
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <div class="micro-app-host-page">
      <div class="micro-app-host-page__toolbar">
        <div class="micro-app-host-page__title">Micro App 宿主</div>
        <div class="micro-app-host-page__url" :title="frameSrc || ''">
          {{ frameSrc || '未配置可用入口地址，请在菜单“跳转地址”中填写 http(s) 地址。' }}
        </div>
        <el-tag size="small" type="info">{{
          microAppAvailable ? 'micro-app' : 'iframe 回退'
        }}</el-tag>
        <el-button type="primary" link :disabled="!hasValidTarget" @click="openInNewTab"
          >新标签打开</el-button
        >
      </div>

      <component
        :is="'micro-app'"
        v-if="hasValidTarget && microAppAvailable"
        class="micro-app-host-page__micro"
        :name="appName"
        :url="frameSrc"
        :data="microData"
        :disable-sandbox="disableSandbox"
      />

      <div v-else-if="hasValidTarget" class="micro-app-host-page__iframe-wrapper">
        <el-alert
          type="warning"
          :closable="false"
          show-icon
          title="未检测到 micro-app 运行时，当前自动回退为 iframe 内嵌。"
        />
        <iframe
          class="micro-app-host-page__iframe"
          :src="frameSrc"
          title="micro-app-host-iframe-fallback"
          referrerpolicy="no-referrer-when-downgrade"
        />
      </div>

      <el-empty
        v-else
        class="micro-app-host-page__empty"
        description="请在菜单管理中把“跳转地址”配置为 micro 应用入口地址。"
      />
    </div>
  </ObPageContainer>
</template>

<style scoped>
.micro-app-host-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--el-bg-color-page);
}

.micro-app-host-page__toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

.micro-app-host-page__title {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.micro-app-host-page__url {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.micro-app-host-page__micro,
.micro-app-host-page__iframe-wrapper {
  width: 100%;
  height: calc(100% - 40px);
}

.micro-app-host-page__iframe-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
}

.micro-app-host-page__iframe {
  flex: 1;
  width: 100%;
  border: none;
  background: #fff;
}

.micro-app-host-page__empty {
  flex: 1;
}
</style>
