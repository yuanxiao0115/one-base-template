<template>
  <UnifiedContainerDisplay :content="containerContentConfig" :style="containerStyleConfig">
    <div class="image-link-list" :style="wrapperStyleObj">
      <button
        v-for="item in displayItems"
        :key="item.id"
        class="image-link-list__card"
        type="button"
        :style="cardStyleObj"
        @click="handleItemClick(item)"
      >
        <div class="image-link-list__media" :style="imageWrapStyleObj">
          <img v-if="item.imageSrc" class="image-link-list__image" :src="item.imageSrc" :alt="item.title" />
          <div v-else class="image-link-list__image image-link-list__image--placeholder">未配置图片</div>
          <span v-if="item.tag" class="image-link-list__tag" :style="tagStyleObj">{{ item.tag }}</span>
        </div>

        <div class="image-link-list__body">
          <h4 class="image-link-list__title" :style="titleStyleObj">{{ item.title }}</h4>
          <p v-if="showDescription" class="image-link-list__description" :style="descriptionStyleObj">
            {{ item.description }}
          </p>
        </div>
      </button>
    </div>
  </UnifiedContainerDisplay>
</template>

<script setup lang="ts">
  import { computed, type CSSProperties } from 'vue';
  import { useRouter } from 'vue-router';
  import { UnifiedContainerDisplay } from '../../common/unified-container';
  import type {
    UnifiedContainerContentConfigModel,
    UnifiedContainerStyleConfigModel,
  } from '../../common/unified-container';
  import { normalizeImageSource, resolveValueByPath, toNonNegativeNumber, toPositiveNumber } from '../common/material-utils';
  import { mergePortalLinkConfig, openPortalLink, resolvePortalLink, type PortalLinkConfig } from '../common/portal-link';

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

  const displayItems = computed(() => {
    const rawItems = Array.isArray(listContent.value.items) ? listContent.value.items : [];
    return rawItems.map((item, index) => ({
      id: String(item.id || `image-link-${index + 1}`),
      title: String(item.title || `图文项${index + 1}`),
      description: String(item.description || ''),
      imageSrc: normalizeImageSource(item.image),
      tag: String(item.tag || ''),
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

  const columnCount = computed(() => Math.min(4, Math.max(1, Number(listContent.value.columnCount) || 3)));
  const showDescription = computed(() => listContent.value.showDescription !== false);

  const wrapperStyleObj = computed<CSSProperties>(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${columnCount.value}, minmax(0, 1fr))`,
    rowGap: `${toNonNegativeNumber(listStyle.value.rowGap, 12)}px`,
    columnGap: `${toNonNegativeNumber(listStyle.value.columnGap, 12)}px`,
  }));

  const cardStyleObj = computed<CSSProperties>(() => ({
    border: `1px solid ${listStyle.value.cardBorderColor || '#e2e8f0'}`,
    borderRadius: `${toNonNegativeNumber(listStyle.value.cardRadius, 10)}px`,
    background: listStyle.value.cardBgColor || '#ffffff',
    overflow: 'hidden',
  }));

  const imageWrapStyleObj = computed<CSSProperties>(() => ({
    height: `${Math.max(60, toPositiveNumber(listStyle.value.imageHeight, 140))}px`,
  }));

  const titleStyleObj = computed<CSSProperties>(() => ({
    color: listStyle.value.titleColor || '#0f172a',
    fontSize: `${Math.max(12, toPositiveNumber(listStyle.value.titleFontSize, 15))}px`,
  }));

  const descriptionStyleObj = computed<CSSProperties>(() => ({
    color: listStyle.value.descriptionColor || '#64748b',
    fontSize: `${Math.max(12, toPositiveNumber(listStyle.value.descriptionFontSize, 12))}px`,
  }));

  const tagStyleObj = computed<CSSProperties>(() => ({
    background: listStyle.value.tagBgColor || '#e0f2fe',
    color: listStyle.value.tagTextColor || '#0369a1',
  }));

  function handleItemClick(item: (typeof displayItems.value)[number]) {
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
    name: 'image-link-list-index',
  });
</script>

<style scoped>
  .image-link-list {
    width: 100%;
  }

  .image-link-list__card {
    display: flex;
    width: 100%;
    border: none;
    cursor: pointer;
    text-align: left;
    padding: 0;
    flex-direction: column;
    transition: transform 0.2s ease;
  }

  .image-link-list__card:hover {
    transform: translateY(-1px);
  }

  .image-link-list__media {
    position: relative;
    width: 100%;
    overflow: hidden;
  }

  .image-link-list__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .image-link-list__image--placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    color: #94a3b8;
    font-size: 12px;
  }

  .image-link-list__tag {
    position: absolute;
    top: 8px;
    right: 8px;
    border-radius: 999px;
    padding: 2px 8px;
    font-size: 11px;
    line-height: 1.4;
  }

  .image-link-list__body {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px;
  }

  .image-link-list__title {
    margin: 0;
    font-weight: 600;
    line-height: 1.4;
    word-break: break-word;
  }

  .image-link-list__description {
    margin: 0;
    line-height: 1.55;
    word-break: break-word;
  }

  @media (max-width: 768px) {
    .image-link-list {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
  }
</style>
