<script setup lang="ts">
import { computed } from 'vue';

import type { PortalHeaderConfig, PortalShellNavItem } from '../../../shell/template-details';

const props = defineProps<{
  config: PortalHeaderConfig;
  navItems: PortalShellNavItem[];
  activeTabId: string;
}>();

const emit = defineEmits<(e: 'navigate', item: PortalShellNavItem) => void>();

const barStyle = computed(() => ({
  '--news-header-bg': props.config.tokens.bgColor || '#b91c1c',
  '--news-header-text': props.config.tokens.textColor || '#ffffff',
  '--news-header-active-bg': props.config.tokens.activeBgColor || '#991b1b',
  '--news-header-active-text': props.config.tokens.activeTextColor || '#ffffff',
  '--news-header-height': `${Math.max(56, props.config.tokens.height)}px`
}));

function isActive(item: PortalShellNavItem): boolean {
  return Boolean(item.tabId && item.tabId === props.activeTabId);
}
</script>

<template>
  <header class="news-header" :style="barStyle">
    <div class="news-header__top">
      <div class="news-header__title">新闻门户</div>
      <div class="news-header__meta">权威发布 · 及时更新</div>
    </div>

    <nav class="news-header__nav" aria-label="新闻门户导航">
      <button
        v-for="item in props.navItems"
        :key="item.key"
        class="news-header__item"
        :class="{ 'news-header__item--active': isActive(item) }"
        type="button"
        @click="emit('navigate', item)"
      >
        {{ item.label }}
      </button>
    </nav>
  </header>
</template>

<style scoped>
.news-header {
  background: var(--news-header-bg);
  color: var(--news-header-text);
  box-shadow: 0 2px 10px rgba(153, 27, 27, 0.25);
}

.news-header__top {
  width: min(100%, 1200px);
  margin: 0 auto;
  min-height: var(--news-header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  box-sizing: border-box;
}

.news-header__title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 2px;
}

.news-header__meta {
  font-size: 13px;
  opacity: 0.92;
}

.news-header__nav {
  width: min(100%, 1200px);
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  box-sizing: border-box;
  overflow-x: auto;
  background: color-mix(in srgb, var(--news-header-bg) 88%, #000000);
}

.news-header__item {
  flex: none;
  min-width: 88px;
  height: 34px;
  border: 0;
  border-radius: 2px;
  color: var(--news-header-text);
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.news-header__item:hover {
  background: color-mix(in srgb, var(--news-header-active-bg) 65%, transparent);
}

.news-header__item--active {
  background: var(--news-header-active-bg);
  color: var(--news-header-active-text);
  font-weight: 600;
}

@media (max-width: 768px) {
  .news-header__title {
    font-size: 18px;
  }

  .news-header__meta {
    display: none;
  }
}
</style>
