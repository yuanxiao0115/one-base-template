<script setup lang="ts">
import { computed } from 'vue';

import type { PortalHeaderConfig, PortalShellNavItem } from '../../shell/template-details';

const props = defineProps<{
  config: PortalHeaderConfig;
  navItems: PortalShellNavItem[];
  activeTabId: string;
  embedded?: boolean;
  sticky?: boolean | null;
}>();

const emit = defineEmits<(e: 'navigate', item: PortalShellNavItem) => void>();

const headerContainerWidth = computed(() => {
  const width = props.config.tokens.containerWidth;
  if (width === '100%') {
    return '100%';
  }
  const normalized = Number(width);
  return `${Math.max(320, Number.isFinite(normalized) ? normalized : 1200)}px`;
});

const headerStyle = computed(() => ({
  '--portal-header-bg': props.config.tokens.bgColor,
  '--portal-header-text': props.config.tokens.textColor,
  '--portal-header-active-bg': props.config.tokens.activeBgColor,
  '--portal-header-active-text': props.config.tokens.activeTextColor,
  '--portal-header-notice-bg': props.config.tokens.noticeBgColor,
  '--portal-header-notice-text': props.config.tokens.noticeTextColor,
  '--portal-header-height': `${Math.max(40, props.config.tokens.height)}px`,
  '--portal-header-shadow': props.config.tokens.shadow,
  '--portal-header-z': String(Math.max(1, props.config.tokens.zIndex)),
  '--portal-header-container-width': headerContainerWidth.value,
  '--portal-header-action-bg': props.config.tokens.actionBgColor,
  '--portal-header-action-text': props.config.tokens.actionTextColor,
  '--portal-header-action-border': props.config.tokens.actionBorderColor,
  '--portal-header-title-size': `${Math.max(12, props.config.behavior.titleFontSize)}px`,
  '--portal-header-sub-title-size': `${Math.max(10, props.config.behavior.subTitleFontSize)}px`
}));

const logoStyle = computed(() => ({
  width: `${Math.max(48, props.config.tokens.logoWidth)}px`,
  marginLeft: `${Math.max(0, props.config.tokens.logoLeftMargin)}px`
}));

const navClass = computed(() => `nav nav--${props.config.behavior.navAlign}`);
const titlePositionClass = computed(() => `brand-cluster--${props.config.behavior.titlePosition}`);

const titleText = computed(() => props.config.behavior.title.trim() || '门户');
const subTitleText = computed(() => props.config.behavior.subTitle.trim());
const hasSubTitle = computed(() => Boolean(subTitleText.value));
const isDividerLayout = computed(
  () => props.config.behavior.titleLayout === 'divider' && hasSubTitle.value
);

const logoSource = computed(() => {
  const value = props.config.tokens.logo.trim();
  if (!value) {
    return '';
  }
  if (/^https?:\/\//.test(value) || value.startsWith('/')) {
    return value;
  }
  return `/cmict/file/resource/show?id=${encodeURIComponent(value)}`;
});

const showActionButton = computed(
  () =>
    props.config.behavior.showActionButton && Boolean(props.config.behavior.actionButtonText.trim())
);
const useSticky = computed(() =>
  typeof props.sticky === 'boolean' ? props.sticky : props.config.tokens.sticky
);

function isActive(item: PortalShellNavItem): boolean {
  return Boolean(item.tabId && item.tabId === props.activeTabId);
}

function onActionButtonClick() {
  const url = props.config.behavior.actionButtonUrl.trim();
  if (!url) {
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}
</script>

<template>
  <div class="header-wrap" :class="{ 'header-wrap--sticky': useSticky }" :style="headerStyle">
    <div
      v-if="props.config.behavior.showTopNotice && props.config.behavior.topNoticeText"
      class="top-notice"
    >
      {{ props.config.behavior.topNoticeText }}
    </div>

    <header class="header-main">
      <div class="header-inner">
        <div class="brand-cluster" :class="titlePositionClass">
          <img
            v-if="logoSource"
            class="brand-logo"
            :style="logoStyle"
            :src="logoSource"
            alt="logo"
          />

          <div class="brand-text-wrap" :class="{ 'brand-text-wrap--divider': isDividerLayout }">
            <span class="brand-title">{{ titleText }}</span>
            <template v-if="isDividerLayout">
              <i class="brand-divider" aria-hidden="true" />
              <span class="brand-sub-title">{{ subTitleText }}</span>
            </template>
            <span v-else-if="hasSubTitle" class="brand-sub-title">{{ subTitleText }}</span>
          </div>
        </div>

        <nav :class="navClass" aria-label="门户导航">
          <button
            v-for="item in props.navItems"
            :key="item.key"
            type="button"
            class="nav-item"
            :class="{ 'nav-item--active': isActive(item) }"
            @click="emit('navigate', item)"
          >
            {{ item.label }}
          </button>
        </nav>

        <div class="header-side">
          <button
            v-if="showActionButton"
            type="button"
            class="action-btn"
            @click="onActionButtonClick"
          >
            {{ props.config.behavior.actionButtonText }}
          </button>

          <div v-if="props.config.behavior.showUserCenter && !props.embedded" class="user-center">
            <span class="user-avatar">U</span>
            <span class="user-name">预览用户</span>
          </div>
        </div>
      </div>
    </header>
  </div>
</template>

<style scoped>
.header-wrap {
  position: relative;
  background: var(--portal-header-bg);
  color: var(--portal-header-text);
  box-shadow: var(--portal-header-shadow);
  z-index: var(--portal-header-z);
}

.header-wrap--sticky {
  position: sticky;
  top: 0;
}

.top-notice {
  min-height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  font-size: 12px;
  background: var(--portal-header-notice-bg);
  color: var(--portal-header-notice-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-main {
  height: var(--portal-header-height);
}

.header-inner {
  width: min(100%, var(--portal-header-container-width));
  height: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  box-sizing: border-box;
}

.brand-cluster {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: 10px;
  max-width: min(42vw, 520px);
}

.brand-cluster--logoRight {
  flex-direction: row;
}

.brand-cluster--leftEdge {
  flex-direction: row-reverse;
  justify-self: start;
}

.brand-logo {
  max-height: 38px;
  object-fit: contain;
  display: block;
  flex: none;
}

.brand-text-wrap {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.brand-text-wrap--divider {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.brand-title {
  font-size: var(--portal-header-title-size);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.brand-sub-title {
  margin-top: 2px;
  font-size: var(--portal-header-sub-title-size);
  line-height: 1.2;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.brand-text-wrap--divider .brand-sub-title {
  margin-top: 0;
  opacity: 0.95;
}

.brand-divider {
  width: 1px;
  height: 0.98em;
  background: color-mix(in srgb, var(--portal-header-text) 72%, transparent);
  opacity: 0.55;
  flex: none;
}

.nav {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: thin;
}

.nav--left {
  justify-content: flex-start;
}

.nav--center {
  justify-content: center;
}

.nav--right {
  justify-content: flex-end;
}

.nav-item {
  flex: none;
  height: 34px;
  border: 0;
  border-radius: 2px;
  padding: 0 12px;
  background: transparent;
  color: var(--portal-header-text);
  font-size: 14px;
  line-height: 34px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.nav-item:hover {
  background: color-mix(in srgb, var(--portal-header-active-bg) 60%, transparent);
}

.nav-item--active {
  background: var(--portal-header-active-bg);
  color: var(--portal-header-active-text);
}

.header-side {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.action-btn {
  height: 30px;
  padding: 0 12px;
  border: 1px solid var(--portal-header-action-border);
  color: var(--portal-header-action-text);
  background: var(--portal-header-action-bg);
  font-size: 12px;
  line-height: 30px;
  cursor: pointer;
}

.action-btn:hover {
  filter: brightness(0.96);
}

.user-center {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--portal-header-text);
}

.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  font-size: 12px;
}

@media (max-width: 900px) {
  .header-inner {
    width: 100%;
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 8px 12px;
    height: auto;
  }

  .header-main {
    height: auto;
    min-height: var(--portal-header-height);
  }

  .brand-cluster {
    max-width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .brand-cluster--leftEdge {
    flex-direction: row;
  }

  .nav {
    justify-content: flex-start;
  }

  .header-side {
    justify-content: flex-start;
  }
}
</style>
