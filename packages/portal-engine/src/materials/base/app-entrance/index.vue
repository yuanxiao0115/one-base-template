<template>
  <UnifiedContainerDisplay :content="containerContentConfig" :style="containerStyleConfig">
    <div class="app-entrance" :style="wrapperStyleObj">
      <button
        v-for="item in displayItems"
        :key="item.id"
        class="app-entrance__card"
        type="button"
        :style="cardStyleObj"
        @click="handleItemClick(item)"
      >
        <span v-if="item.badge" class="app-entrance__badge" :style="badgeStyleObj">{{
          item.badge
        }}</span>

        <div class="app-entrance__media" :style="mediaStyleObj">
          <img
            v-if="item.imageSrc"
            :src="item.imageSrc"
            :alt="item.title"
            class="app-entrance__image"
          />
          <MenuIcon
            v-else-if="item.icon"
            :icon="item.icon"
            class="app-entrance__icon"
            :style="iconStyleObj"
          />
          <MenuIcon v-else icon="ri:apps-2-line" class="app-entrance__icon" :style="iconStyleObj" />
        </div>

        <h4 class="app-entrance__title" :style="titleStyleObj">{{ item.title }}</h4>
        <p v-if="showDescription" class="app-entrance__description" :style="descriptionStyleObj">
          {{ item.description }}
        </p>
      </button>
    </div>
  </UnifiedContainerDisplay>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';
import { useRouter } from 'vue-router';
import { MenuIcon } from '@one-base-template/ui';
import { UnifiedContainerDisplay } from '../../common/unified-container';
import type {
  UnifiedContainerContentConfigModel,
  UnifiedContainerStyleConfigModel
} from '../../common/unified-container';
import {
  normalizeImageSource,
  resolveValueByPath,
  toNonNegativeNumber,
  toPositiveNumber
} from '../common/material-utils';
import {
  mergePortalLinkConfig,
  openPortalLink,
  resolvePortalLink,
  type PortalLinkConfig
} from '../common/portal-link';

interface EntranceItem {
  id?: string;
  title?: string;
  description?: string;
  icon?: string;
  image?: string;
  badge?: string;
  linkPath?: string;
  linkParamKey?: string;
  linkValueKey?: string;
  openType?: PortalLinkConfig['openType'];
  link?: Partial<PortalLinkConfig>;
}

interface AppEntranceSchema {
  content?: {
    container?: Partial<UnifiedContainerContentConfigModel>;
    entrance?: {
      columnCount?: number;
      showDescription?: boolean;
      items?: EntranceItem[];
    };
  };
  style?: {
    container?: Partial<UnifiedContainerStyleConfigModel>;
    entrance?: {
      cardBgColor?: string;
      cardHoverBgColor?: string;
      cardBorderColor?: string;
      cardRadius?: number;
      cardPadding?: number;
      iconColor?: string;
      titleColor?: string;
      descriptionColor?: string;
      badgeBgColor?: string;
      badgeTextColor?: string;
      titleFontSize?: number;
      descriptionFontSize?: number;
      iconSize?: number;
      imageHeight?: number;
      rowGap?: number;
      columnGap?: number;
    };
  };
}

const props = defineProps<{
  schema: AppEntranceSchema;
}>();

let router: ReturnType<typeof useRouter> | null = null;
try {
  router = useRouter();
} catch {
  router = null;
}

const containerContentConfig = computed(() => props.schema?.content?.container);
const containerStyleConfig = computed(() => props.schema?.style?.container);
const entranceConfig = computed(() => props.schema?.content?.entrance || {});
const entranceStyle = computed(() => props.schema?.style?.entrance || {});

const displayItems = computed(() => {
  const items = Array.isArray(entranceConfig.value.items) ? entranceConfig.value.items : [];
  return items.map((item, index) => ({
    id: String(item.id || `app-${index + 1}`),
    title: String(item.title || `入口${index + 1}`),
    description: String(item.description || ''),
    icon: String(item.icon || ''),
    imageSrc: normalizeImageSource(item.image),
    badge: String(item.badge || ''),
    link: mergePortalLinkConfig(
      item.link || {
        path: item.linkPath,
        paramKey: item.linkParamKey,
        valueKey: item.linkValueKey,
        openType: item.openType
      }
    )
  }));
});

const showDescription = computed(() => entranceConfig.value.showDescription !== false);
const columnCount = computed(() =>
  Math.min(6, Math.max(1, Number(entranceConfig.value.columnCount) || 4))
);

const wrapperStyleObj = computed<CSSProperties>(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${columnCount.value}, minmax(0, 1fr))`,
  rowGap: `${toNonNegativeNumber(entranceStyle.value.rowGap, 12)}px`,
  columnGap: `${toNonNegativeNumber(entranceStyle.value.columnGap, 12)}px`
}));

const cardStyleObj = computed<CSSProperties>(() => ({
  border: `1px solid ${entranceStyle.value.cardBorderColor || '#e2e8f0'}`,
  background: entranceStyle.value.cardBgColor || '#f8fafc',
  borderRadius: `${toNonNegativeNumber(entranceStyle.value.cardRadius, 10)}px`,
  padding: `${toNonNegativeNumber(entranceStyle.value.cardPadding, 12)}px`,
  '--app-entrance-hover-bg': entranceStyle.value.cardHoverBgColor || '#f1f5f9'
}));

const mediaStyleObj = computed<CSSProperties>(() => ({
  minHeight: `${Math.max(40, toPositiveNumber(entranceStyle.value.imageHeight, 64))}px`
}));

const iconStyleObj = computed<CSSProperties>(() => ({
  color: entranceStyle.value.iconColor || '#2563eb',
  fontSize: `${Math.max(14, toPositiveNumber(entranceStyle.value.iconSize, 20))}px`
}));

const titleStyleObj = computed<CSSProperties>(() => ({
  color: entranceStyle.value.titleColor || '#0f172a',
  fontSize: `${Math.max(12, toPositiveNumber(entranceStyle.value.titleFontSize, 15))}px`
}));

const descriptionStyleObj = computed<CSSProperties>(() => ({
  color: entranceStyle.value.descriptionColor || '#64748b',
  fontSize: `${Math.max(12, toPositiveNumber(entranceStyle.value.descriptionFontSize, 12))}px`
}));

const badgeStyleObj = computed<CSSProperties>(() => ({
  background: entranceStyle.value.badgeBgColor || '#dbeafe',
  color: entranceStyle.value.badgeTextColor || '#1d4ed8'
}));

function handleItemClick(item: (typeof displayItems.value)[number]) {
  const valueKey = String(item.link?.valueKey || 'id');
  const paramValue = resolveValueByPath(item, valueKey);
  const link = resolvePortalLink(item.link, paramValue);
  openPortalLink({
    link,
    openType: item.link?.openType,
    routerPush: router ? (nextLink: string) => router!.push(nextLink) : null
  });
}

defineOptions({
  name: 'app-entrance-index'
});
</script>

<style scoped>
.app-entrance {
  width: 100%;
}

.app-entrance__card {
  position: relative;
  display: flex;
  width: 100%;
  min-height: 120px;
  text-align: left;
  border: none;
  cursor: pointer;
  flex-direction: column;
  gap: 8px;
  transition: all 0.2s ease;
}

.app-entrance__card:hover {
  transform: translateY(-1px);
  background: var(--app-entrance-hover-bg, #f1f5f9);
  box-shadow: 0 6px 16px rgb(15 23 42 / 0.1);
}

.app-entrance__badge {
  position: absolute;
  top: 8px;
  right: 8px;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 11px;
  line-height: 1.4;
}

.app-entrance__media {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 0;
}

.app-entrance__image {
  width: 100%;
  height: 100%;
  max-height: inherit;
  border-radius: 8px;
  object-fit: cover;
}

.app-entrance__icon {
  width: auto;
  height: auto;
}

.app-entrance__title {
  margin: 0;
  line-height: 1.4;
  font-weight: 600;
  word-break: break-word;
}

.app-entrance__description {
  margin: 0;
  line-height: 1.55;
  word-break: break-word;
}

@media (max-width: 768px) {
  .app-entrance {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}
</style>
