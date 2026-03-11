<script setup lang="ts">
  import { computed } from "vue";

  import type { PortalHeaderConfig, PortalShellNavItem } from "../../../utils/templateDetails";

  const props = defineProps<{
    config: PortalHeaderConfig;
    navItems: PortalShellNavItem[];
    activeTabId: string;
    embedded?: boolean;
  }>();

  const emit = defineEmits<{
    (e: "navigate", item: PortalShellNavItem): void;
  }>();

  const headerStyle = computed(() => ({
    "--portal-header-bg": props.config.tokens.bgColor,
    "--portal-header-text": props.config.tokens.textColor,
    "--portal-header-active-bg": props.config.tokens.activeBgColor,
    "--portal-header-active-text": props.config.tokens.activeTextColor,
    "--portal-header-height": `${Math.max(36, props.config.tokens.height)}px`,
    "--portal-header-shadow": props.config.tokens.shadow,
    "--portal-header-z": String(Math.max(1, props.config.tokens.zIndex)),
    "--portal-header-container-width": `${Math.max(320, props.config.tokens.containerWidth)}px`,
  }));

  const logoStyle = computed(() => ({
    width: `${Math.max(48, props.config.tokens.logoWidth)}px`,
    marginLeft: `${Math.max(0, props.config.tokens.logoLeftMargin)}px`,
  }));

  const navClass = computed(() => `nav nav--${props.config.behavior.navAlign}`);

  function isActive(item: PortalShellNavItem): boolean {
    return Boolean(item.tabId && item.tabId === props.activeTabId);
  }
</script>

<template>
  <div class="header-wrap" :class="{ 'header-wrap--sticky': props.config.tokens.sticky }" :style="headerStyle">
    <div v-if="props.config.behavior.showTopNotice && props.config.behavior.topNoticeText" class="top-notice">
      {{ props.config.behavior.topNoticeText }}
    </div>
    <header class="header-main">
      <div class="header-inner">
        <div class="brand" :style="logoStyle">
          <img v-if="props.config.tokens.logo" class="brand-logo" :src="props.config.tokens.logo" alt="logo" />
          <span v-else class="brand-text">门户</span>
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

        <div v-if="props.config.behavior.showUserCenter && !props.embedded" class="user-center">
          <span class="user-avatar">U</span>
          <span class="user-name">预览用户</span>
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
    background: color-mix(in srgb, var(--portal-header-bg) 84%, #000000);
    color: var(--portal-header-text);
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

  .brand {
    display: flex;
    align-items: center;
    min-width: 0;
    height: 100%;
  }

  .brand-logo {
    width: 100%;
    max-height: 36px;
    object-fit: contain;
    display: block;
  }

  .brand-text {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 1px;
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

  @media (max-width: 768px) {
    .header-inner {
      width: 100%;
      grid-template-columns: auto 1fr;
    }

    .user-center {
      display: none;
    }
  }
</style>
