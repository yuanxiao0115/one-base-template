<template>
  <UnifiedContainerDisplay :content="containerContentConfig" :style="containerStyleConfig">
    <div class="base-notice" :style="noticeStyleObj">
      <el-icon class="base-notice__icon" :style="iconStyleObj"><Bell /></el-icon>

      <el-carousel
        v-if="normalizedItems.length > 1"
        class="base-notice__carousel"
        direction="vertical"
        :interval="interval"
        :autoplay="autoplay"
        indicator-position="none"
        :height="`${height}px`"
      >
        <el-carousel-item v-for="item in normalizedItems" :key="item.id">
          <button class="base-notice__item" type="button" @click="handleItemClick(item)">
            <span v-if="showBullet" class="base-notice__bullet" :style="bulletStyleObj" />
            <span class="base-notice__text" :style="textStyleObj">{{ item.text }}</span>
          </button>
        </el-carousel-item>
      </el-carousel>

      <button v-else-if="singleNoticeItem" class="base-notice__item" type="button" @click="handleItemClick(singleNoticeItem)">
        <span v-if="showBullet" class="base-notice__bullet" :style="bulletStyleObj" />
        <span class="base-notice__text" :style="textStyleObj">{{ singleNoticeItem.text }}</span>
      </button>

      <div v-else class="base-notice__empty">暂无公告</div>
    </div>
  </UnifiedContainerDisplay>
</template>

<script setup lang="ts">
  import { computed, type CSSProperties } from 'vue';
  import { useRouter } from 'vue-router';
  import { Bell } from '@element-plus/icons-vue';
  import { UnifiedContainerDisplay } from '../../common/unified-container';
  import type {
    UnifiedContainerContentConfigModel,
    UnifiedContainerStyleConfigModel,
  } from '../../common/unified-container';
  import { resolveValueByPath, toPositiveNumber } from '../common/material-utils';
  import { mergePortalLinkConfig, openPortalLink, resolvePortalLink, type PortalLinkConfig } from '../common/portal-link';

  interface NoticeItem {
    id?: string;
    text?: string;
    linkPath?: string;
    linkParamKey?: string;
    linkValueKey?: string;
    openType?: PortalLinkConfig['openType'];
    link?: Partial<PortalLinkConfig>;
  }

  interface BaseNoticeSchema {
    content?: {
      container?: Partial<UnifiedContainerContentConfigModel>;
      notice?: {
        autoplay?: boolean;
        interval?: number;
        showBullet?: boolean;
        items?: NoticeItem[];
      };
    };
    style?: {
      container?: Partial<UnifiedContainerStyleConfigModel>;
      notice?: {
        height?: number;
        radius?: number;
        backgroundColor?: string;
        borderColor?: string;
        textColor?: string;
        textFontSize?: number;
        bulletColor?: string;
        iconColor?: string;
      };
    };
  }

  const props = defineProps<{
    schema: BaseNoticeSchema;
  }>();

  let router: ReturnType<typeof useRouter> | null = null;
  try {
    router = useRouter();
  } catch {
    router = null;
  }

  const containerContentConfig = computed(() => props.schema?.content?.container);
  const containerStyleConfig = computed(() => props.schema?.style?.container);
  const noticeConfig = computed(() => props.schema?.content?.notice || {});
  const styleConfig = computed(() => props.schema?.style?.notice || {});

  const normalizedItems = computed(() => {
    const raw = Array.isArray(noticeConfig.value.items) ? noticeConfig.value.items : [];
    return raw.map((item, index) => ({
      id: String(item.id || `notice-${index + 1}`),
      text: String(item.text || `示例公告${index + 1}`),
      link: mergePortalLinkConfig(
        item.link || {
          path: item.linkPath,
          paramKey: item.linkParamKey,
          valueKey: item.linkValueKey,
          openType: item.openType,
        }
      ),
    }));
  });
  const singleNoticeItem = computed(() => normalizedItems.value[0] ?? null);

  const autoplay = computed(() => noticeConfig.value.autoplay !== false);
  const interval = computed(() => Math.max(1000, toPositiveNumber(noticeConfig.value.interval, 3500)));
  const showBullet = computed(() => noticeConfig.value.showBullet !== false);
  const height = computed(() => Math.max(30, toPositiveNumber(styleConfig.value.height, 40)));

  const noticeStyleObj = computed<CSSProperties>(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    height: `${height.value}px`,
    border: `1px solid ${styleConfig.value.borderColor || '#e2e8f0'}`,
    borderRadius: `${Math.max(0, Number(styleConfig.value.radius) || 8)}px`,
    background: styleConfig.value.backgroundColor || '#f8fafc',
    padding: '0 12px',
    boxSizing: 'border-box',
  }));

  const iconStyleObj = computed<CSSProperties>(() => ({
    color: styleConfig.value.iconColor || '#f59e0b',
    fontSize: '16px',
    flexShrink: 0,
  }));

  const textStyleObj = computed<CSSProperties>(() => ({
    color: styleConfig.value.textColor || '#0f172a',
    fontSize: `${Math.max(12, toPositiveNumber(styleConfig.value.textFontSize, 14))}px`,
  }));

  const bulletStyleObj = computed<CSSProperties>(() => ({
    background: styleConfig.value.bulletColor || '#ef4444',
  }));

  function handleItemClick(item: (typeof normalizedItems.value)[number]) {
    const valueKey = String(item.link?.valueKey || 'id');
    const paramValue = resolveValueByPath(item, valueKey);
    const link = resolvePortalLink(item.link, paramValue);
    openPortalLink({
      link,
      openType: item.link?.openType,
      routerPush: router ? (nextLink: string) => router!.push(nextLink) : null,
    });
  }

  defineOptions({
    name: 'base-notice-index',
  });
</script>

<style scoped>
  .base-notice {
    width: 100%;
  }

  .base-notice__carousel {
    width: 100%;
  }

  .base-notice__item {
    display: inline-flex;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    text-align: left;
    gap: 8px;
  }

  .base-notice__bullet {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    flex-shrink: 0;
  }

  .base-notice__text {
    line-height: 1.4;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .base-notice__empty {
    font-size: 12px;
    color: #94a3b8;
  }
</style>
