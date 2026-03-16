<template>
  <UnifiedContainerDisplay :content="containerContentConfig" :style="containerStyleConfig">
    <div class="base-carousel" :style="carouselRootStyleObj">
      <el-carousel
        :autoplay="autoplay"
        :interval="interval"
        :trigger="trigger"
        :arrow="arrow"
        :indicator-position="indicatorPosition"
        :height="`${height}px`"
      >
        <el-carousel-item v-for="item in slides" :key="item.id">
          <a
            v-if="item.linkUrl"
            class="carousel-item"
            :href="item.linkUrl"
            :target="item.openInNewTab ? '_blank' : '_self'"
            :rel="item.openInNewTab ? 'noopener noreferrer' : undefined"
          >
            <img
              v-if="item.image"
              class="carousel-item__image"
              :src="item.image"
              :style="imageStyleObj"
              alt="carousel"
            />
            <div v-else class="carousel-item__placeholder">请在属性面板配置轮播图片</div>
            <div class="carousel-item__mask" :style="maskStyleObj">
              <div class="carousel-item__title" :style="titleStyleObj">
                {{ item.title || '轮播标题' }}
              </div>
              <div v-if="item.subtitle" class="carousel-item__subtitle" :style="subtitleStyleObj">
                {{ item.subtitle }}
              </div>
            </div>
          </a>

          <div v-else class="carousel-item">
            <img
              v-if="item.image"
              class="carousel-item__image"
              :src="item.image"
              :style="imageStyleObj"
              alt="carousel"
            />
            <div v-else class="carousel-item__placeholder">请在属性面板配置轮播图片</div>
            <div class="carousel-item__mask" :style="maskStyleObj">
              <div class="carousel-item__title" :style="titleStyleObj">
                {{ item.title || '轮播标题' }}
              </div>
              <div v-if="item.subtitle" class="carousel-item__subtitle" :style="subtitleStyleObj">
                {{ item.subtitle }}
              </div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>
  </UnifiedContainerDisplay>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';
import { UnifiedContainerDisplay } from '../../common/unified-container';
import type {
  UnifiedContainerContentConfigModel,
  UnifiedContainerStyleConfigModel
} from '../../common/unified-container';
import {
  normalizeImageSource,
  toNonNegativeNumber,
  toPositiveNumber
} from '../common/material-utils';

type TriggerType = 'hover' | 'click';
type ArrowType = 'always' | 'hover' | 'never';
type IndicatorPositionType = 'outside' | 'none';
type ContentAlignType = 'left' | 'center' | 'right';
type FitType = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';

interface CarouselItemSchema {
  id?: string;
  image?: string;
  title?: string;
  subtitle?: string;
  linkUrl?: string;
  openInNewTab?: boolean;
}

interface BaseCarouselSchema {
  content?: {
    container?: Partial<UnifiedContainerContentConfigModel>;
    carousel?: {
      autoplay?: boolean;
      interval?: number;
      trigger?: TriggerType;
      arrow?: ArrowType;
      indicatorPosition?: IndicatorPositionType;
      items?: CarouselItemSchema[];
    };
  };
  style?: {
    container?: Partial<UnifiedContainerStyleConfigModel>;
    carousel?: {
      height?: number;
      borderRadius?: number;
      overlayBgColor?: string;
      titleColor?: string;
      subtitleColor?: string;
      titleFontSize?: number;
      subtitleFontSize?: number;
      contentAlign?: ContentAlignType;
      contentPaddingX?: number;
      contentPaddingY?: number;
      imageFit?: FitType;
    };
  };
}

interface SlideViewModel {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  linkUrl: string;
  openInNewTab: boolean;
}

const props = defineProps<{
  schema: BaseCarouselSchema;
}>();

const containerContentConfig = computed(() => props.schema?.content?.container);
const containerStyleConfig = computed(() => props.schema?.style?.container);

const contentConfig = computed(() => props.schema?.content?.carousel || {});
const styleConfig = computed(() => props.schema?.style?.carousel || {});

const slides = computed<SlideViewModel[]>(() => {
  const items = Array.isArray(contentConfig.value.items) ? contentConfig.value.items : [];
  if (items.length === 0) {
    return [
      {
        id: 'placeholder-slide',
        image: '',
        title: '轮播图',
        subtitle: '请在属性面板添加轮播项',
        linkUrl: '',
        openInNewTab: false
      }
    ];
  }

  return items.map((item, index) => ({
    id: String(item.id || `slide-${index + 1}`),
    image: normalizeImageSource(item.image),
    title: String(item.title || ''),
    subtitle: String(item.subtitle || ''),
    linkUrl: String(item.linkUrl || '').trim(),
    openInNewTab: item.openInNewTab === true
  }));
});

const autoplay = computed(() => contentConfig.value.autoplay !== false);
const interval = computed(() =>
  Math.max(1000, toPositiveNumber(contentConfig.value.interval, 4000))
);
const trigger = computed<TriggerType>(() =>
  contentConfig.value.trigger === 'click' ? 'click' : 'hover'
);
const arrow = computed<ArrowType>(() => {
  const value = contentConfig.value.arrow;
  if (value === 'always' || value === 'hover' || value === 'never') {
    return value;
  }
  return 'hover';
});
const indicatorPosition = computed<IndicatorPositionType>(() =>
  contentConfig.value.indicatorPosition === 'none' ? 'none' : 'outside'
);

const height = computed(() => Math.max(160, toPositiveNumber(styleConfig.value.height, 260)));

const carouselRootStyleObj = computed<CSSProperties>(
  () =>
    ({
      '--carousel-radius': `${toNonNegativeNumber(styleConfig.value.borderRadius, 10)}px`
    }) as CSSProperties
);

const imageStyleObj = computed<CSSProperties>(() => ({
  objectFit: styleConfig.value.imageFit || 'cover'
}));

const alignMap: Record<ContentAlignType, CSSProperties['justifyContent']> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end'
};

const maskStyleObj = computed<CSSProperties>(() => {
  const align = (styleConfig.value.contentAlign || 'left') as ContentAlignType;
  return {
    justifyContent: alignMap[align] || 'flex-start',
    textAlign: align,
    background: styleConfig.value.overlayBgColor || 'rgba(15, 23, 42, 0.35)',
    padding: `${toNonNegativeNumber(styleConfig.value.contentPaddingY, 16)}px ${toNonNegativeNumber(styleConfig.value.contentPaddingX, 20)}px`
  };
});

const titleStyleObj = computed<CSSProperties>(() => ({
  color: styleConfig.value.titleColor || '#ffffff',
  fontSize: `${Math.max(14, toPositiveNumber(styleConfig.value.titleFontSize, 20))}px`
}));

const subtitleStyleObj = computed<CSSProperties>(() => ({
  color: styleConfig.value.subtitleColor || 'rgba(255,255,255,0.9)',
  fontSize: `${Math.max(12, toPositiveNumber(styleConfig.value.subtitleFontSize, 14))}px`
}));

defineOptions({
  name: 'base-carousel-index'
});
</script>

<style scoped>
.base-carousel {
  width: 100%;
}

.base-carousel :deep(.el-carousel__container) {
  border-radius: var(--carousel-radius, 10px);
}

.carousel-item {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  color: inherit;
  text-decoration: none;
}

.carousel-item__image,
.carousel-item__placeholder {
  width: 100%;
  height: 100%;
}

.carousel-item__image {
  display: block;
}

.carousel-item__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  background: #f8fafc;
}

.carousel-item__mask {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.carousel-item__title {
  font-weight: 600;
  line-height: 1.45;
}

.carousel-item__subtitle {
  line-height: 1.5;
}
</style>
