<script setup lang="ts">
  import { computed, useSlots, type CSSProperties } from 'vue';
  import { TopRight } from '@element-plus/icons-vue';
  import { MenuIcon } from '@one-base-template/ui';

  import {
    mergeUnifiedContainerContentConfig,
    mergeUnifiedContainerStyleConfig,
  } from './unified-container.defaults';
  import type { UnifiedContainerContentConfig, UnifiedContainerStyleConfig } from './unified-container.types';

  const props = defineProps<{
    content?: Partial<UnifiedContainerContentConfig> | null;
    style?: Partial<UnifiedContainerStyleConfig> | null;
  }>();

  const slots = useSlots();

  const contentConfig = computed(() => mergeUnifiedContainerContentConfig(props.content));
  const styleConfig = computed(() => mergeUnifiedContainerStyleConfig(props.style));

  const showHeader = computed(
    () => contentConfig.value.showTitle || contentConfig.value.showExternalLink || Boolean(slots['header-extra'])
  );

  const showSubtitle = computed(
    () => contentConfig.value.showTitle && contentConfig.value.subtitle.trim().length > 0
  );
  const isSubtitleInline = computed(() => showSubtitle.value && contentConfig.value.subtitleLayout === 'inline');

  const externalLinkText = computed(() => {
    const text = contentConfig.value.externalLinkText.trim();
    return text || '更多';
  });

  const hasExternalLinkUrl = computed(() => contentConfig.value.externalLinkUrl.trim().length > 0);

  const externalLinkTarget = computed(() => (contentConfig.value.openExternalInNewTab ? '_blank' : '_self'));

  const externalLinkRel = computed(() => (contentConfig.value.openExternalInNewTab ? 'noopener noreferrer' : undefined));

  const containerStyleObj = computed<CSSProperties>(() => {
    const style = styleConfig.value;

    return {
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      backgroundColor: style.backgroundColor,
      borderStyle: style.borderStyle,
      borderColor: style.borderColor,
      borderWidth: `${style.borderWidth}px`,
      borderRadius: `${style.borderRadius}px`,
      boxShadow: style.boxShadow,
      padding: `${style.paddingTop}px ${style.paddingRight}px ${style.paddingBottom}px ${style.paddingLeft}px`,
      margin: `${style.marginTop}px ${style.marginRight}px ${style.marginBottom}px ${style.marginLeft}px`,
    };
  });

  const headerStyleObj = computed<CSSProperties>(() => {
    const style = styleConfig.value;

    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '10px',
      backgroundColor: style.headerBackgroundColor,
      borderBottom: `1px solid ${style.headerDividerColor}`,
      padding: `${style.headerPaddingTop}px ${style.headerPaddingRight}px ${style.headerPaddingBottom}px ${style.headerPaddingLeft}px`,
    };
  });

  const titleStyleObj = computed<CSSProperties>(() => ({
    color: styleConfig.value.titleColor,
    fontSize: `${styleConfig.value.titleFontSize}px`,
  }));

  const subtitleStyleObj = computed<CSSProperties>(() => ({
    color: styleConfig.value.subtitleColor,
    fontSize: `${styleConfig.value.subtitleFontSize}px`,
  }));

  const iconStyleObj = computed<CSSProperties>(() => ({
    color: styleConfig.value.iconColor,
  }));

  const linkStyleObj = computed<CSSProperties>(() => ({
    color: styleConfig.value.linkColor,
    fontSize: `${styleConfig.value.linkFontSize}px`,
  }));

  const contentStyleObj = computed<CSSProperties>(() => ({
    minHeight: 0,
    flex: 1,
    marginTop: showHeader.value ? `${styleConfig.value.contentTopGap}px` : '0px',
  }));

  defineOptions({
    name: 'PortalUnifiedContainerDisplay',
  });
</script>

<template>
  <section class="unified-container" :style="containerStyleObj">
    <header v-if="showHeader" class="unified-container__header" :style="headerStyleObj">
      <div v-if="contentConfig.showTitle" class="unified-container__title-group">
        <span v-if="contentConfig.icon" class="unified-container__title-icon" :style="iconStyleObj">
          <MenuIcon :icon="contentConfig.icon" />
        </span>
        <div class="unified-container__title-content">
          <div v-if="isSubtitleInline" class="unified-container__title-line">
            <h3 class="unified-container__title" :style="titleStyleObj">{{ contentConfig.title }}</h3>
            <p class="unified-container__subtitle" :style="subtitleStyleObj">{{ contentConfig.subtitle }}</p>
          </div>

          <template v-else>
            <h3 class="unified-container__title" :style="titleStyleObj">{{ contentConfig.title }}</h3>
            <p v-if="showSubtitle" class="unified-container__subtitle" :style="subtitleStyleObj">
              {{ contentConfig.subtitle }}
            </p>
          </template>
        </div>
      </div>

      <div class="unified-container__header-actions">
        <slot name="header-extra" />

        <a
          v-if="contentConfig.showExternalLink && hasExternalLinkUrl"
          class="unified-container__external-link"
          :href="contentConfig.externalLinkUrl"
          :target="externalLinkTarget"
          :rel="externalLinkRel"
          :style="linkStyleObj"
        >
          <span>{{ externalLinkText }}</span>
          <TopRight class="unified-container__external-link-icon" />
        </a>

        <span
          v-else-if="contentConfig.showExternalLink"
          class="unified-container__external-link is-disabled"
          :style="linkStyleObj"
        >
          <span>{{ externalLinkText }}</span>
          <TopRight class="unified-container__external-link-icon" />
        </span>
      </div>
    </header>

    <div class="unified-container__content" :style="contentStyleObj">
      <slot>
        <div class="unified-container__placeholder">请在此放置组件内容</div>
      </slot>
    </div>
  </section>
</template>

<style scoped>
  .unified-container {
    min-height: 0;
  }

  .unified-container__header {
    flex-shrink: 0;
  }

  .unified-container__title-group {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 10px;
  }

  .unified-container__title-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    font-size: 18px;
    flex-shrink: 0;
  }

  .unified-container__title-icon :deep(i),
  .unified-container__title-icon :deep(svg),
  .unified-container__title-icon :deep(img) {
    width: 18px;
    height: 18px;
    line-height: 1;
  }

  .unified-container__title-content {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 2px;
  }

  .unified-container__title {
    margin: 0;
    font-weight: 600;
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .unified-container__subtitle {
    margin: 0;
    line-height: 1.45;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .unified-container__title-line {
    display: flex;
    align-items: baseline;
    min-width: 0;
    gap: 8px;
  }

  .unified-container__title-line .unified-container__title,
  .unified-container__title-line .unified-container__subtitle {
    min-width: 0;
    flex-shrink: 1;
  }

  .unified-container__header-actions {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    margin-left: auto;
    flex-shrink: 0;
  }

  .unified-container__external-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }

  .unified-container__external-link:hover {
    opacity: 0.85;
  }

  .unified-container__external-link.is-disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  .unified-container__external-link-icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  .unified-container__content {
    width: 100%;
    overflow: auto;
  }

  .unified-container__placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 120px;
    color: #94a3b8;
    border: 1px dashed rgb(148 163 184 / 0.35);
    border-radius: 8px;
    background: rgb(148 163 184 / 0.08);
  }
</style>
