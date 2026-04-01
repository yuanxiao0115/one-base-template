<template>
  <UnifiedContainerDisplay :content="containerContentConfig" :style="containerStyleConfig">
    <div class="image-links" :style="containerStyleObj">
      <div v-if="links.length === 0" class="empty-links">暂无图片链接</div>
      <div
        v-for="(link, index) in links"
        :key="link.id || index"
        class="cms-image-link-item"
        :style="itemStyleObj"
        @click="handleLinkClick(link)"
      >
        <img
          :src="getImageUrl(link.image)"
          :alt="link.title || '图片链接'"
          class="image-link-img"
        />
      </div>
    </div>
  </UnifiedContainerDisplay>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';
import { useRouter } from 'vue-router';
import { UnifiedContainerDisplay } from '../../common/unified-container';
import type {
  UnifiedContainerContentConfigModel,
  UnifiedContainerStyleConfigModel
} from '../../common/unified-container';
import {
  normalizeImageSource,
  resolveValueByPath,
  toNonNegativeNumber
} from '../common/material-utils';
import {
  mergePortalLinkConfig,
  openPortalLink,
  resolvePortalLink,
  type PortalLinkConfig
} from '../common/portal-link';

interface ImageLinkItem {
  id?: string;
  title?: string;
  description?: string;
  image?: string;
  tag?: string;
  linkPath?: string;
  linkParamKey?: string;
  linkValueKey?: string;
  openType?: PortalLinkConfig['openType'];
  link?: Partial<PortalLinkConfig>;
}

interface ImageLinkListSchema {
  content?: {
    container?: Partial<UnifiedContainerContentConfigModel>;
    list?: {
      columnCount?: number;
      showDescription?: boolean;
      items?: ImageLinkItem[];
    };
  };
  style?: {
    container?: Partial<UnifiedContainerStyleConfigModel>;
    list?: {
      cardBgColor?: string;
      cardBorderColor?: string;
      cardRadius?: number;
      imageHeight?: number;
      titleColor?: string;
      descriptionColor?: string;
      tagBgColor?: string;
      tagTextColor?: string;
      titleFontSize?: number;
      descriptionFontSize?: number;
      rowGap?: number;
      columnGap?: number;
    };
  };
}

const props = defineProps<{
  schema: ImageLinkListSchema;
}>();

let router: ReturnType<typeof useRouter> | null = null;
try {
  router = useRouter();
} catch {
  router = null;
}

const containerContentConfig = computed(() => props.schema?.content?.container);
const containerStyleConfig = computed(() => props.schema?.style?.container);
const listContent = computed(() => props.schema?.content?.list || {});
const listStyle = computed(() => props.schema?.style?.list || {});

const links = computed(() => {
  const rawItems = Array.isArray(listContent.value.items) ? listContent.value.items : [];
  return rawItems.map((item, index) => ({
    id: String(item.id || `image-link-${index + 1}`),
    title: String(item.title || ''),
    image: String(item.image || ''),
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

const columnsPerRow = computed(() =>
  Math.min(4, Math.max(1, Number(listContent.value.columnCount) || 4))
);

const containerStyleObj = computed<CSSProperties>(() => ({
  gridTemplateColumns: `repeat(${columnsPerRow.value}, minmax(0, 1fr))`,
  rowGap: `${toNonNegativeNumber(listStyle.value.rowGap, 16)}px`,
  columnGap: `${toNonNegativeNumber(listStyle.value.columnGap, 16)}px`
}));

const itemStyleObj = computed<CSSProperties>(() => ({
  borderRadius: `${toNonNegativeNumber(listStyle.value.cardRadius, 0)}px`,
  backgroundColor: listStyle.value.cardBgColor || 'transparent'
}));

const defaultImageUrl =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmMGYyZjUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iI2FhYWFhYSI+5pqC5peg5Zu+54mHPC90ZXh0Pjwvc3ZnPg==';

function getImageUrl(image?: string): string {
  const normalized = normalizeImageSource(image);
  return normalized || defaultImageUrl;
}

function resolveLink(item: (typeof links.value)[number]): string {
  const valueKey = String(item.link?.valueKey || 'id');
  const paramValue = resolveValueByPath(item, valueKey);
  return resolvePortalLink(item.link, paramValue);
}

function handleLinkClick(item: (typeof links.value)[number]) {
  const link = resolveLink(item);
  if (!link) {
    return;
  }

  openPortalLink({
    link,
    openType: item.link?.openType,
    routerPush: router ? (nextLink: string) => router!.push(nextLink) : null
  });
}

defineOptions({
  name: 'image-link-list-index'
});
</script>

<style scoped>
.image-links {
  display: grid;
  width: 100%;
  align-items: start;
}

.cms-image-link-item {
  display: block;
  width: 100%;
  overflow: hidden;
  cursor: pointer;
}

.image-link-img {
  display: block;
  width: 100%;
  height: auto;
}

.empty-links {
  padding: 20px 0;
  grid-column: 1 / -1;
  font-size: 14px;
  text-align: center;
  color: #909399;
}
</style>
