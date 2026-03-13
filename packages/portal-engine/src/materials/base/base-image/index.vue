<template>
  <UnifiedContainerDisplay :content="containerContentConfig" :style="containerStyleConfig">
    <div class="base-image" :style="wrapperStyleObj">
      <a
        v-if="linkUrl"
        class="base-image__link"
        :href="linkUrl"
        :target="openInNewTab ? '_blank' : '_self'"
        :rel="openInNewTab ? 'noopener noreferrer' : undefined"
      >
        <el-image
          v-if="imageSrc"
          class="base-image__image"
          :src="imageSrc"
          :alt="imageAlt"
          :fit="objectFit"
          :style="imageStyleObj"
        >
          <template #error>
            <div class="base-image__placeholder">图片加载失败</div>
          </template>
        </el-image>
        <div v-else class="base-image__placeholder">请在属性面板配置图片</div>
      </a>

      <template v-else>
        <el-image
          v-if="imageSrc"
          class="base-image__image"
          :src="imageSrc"
          :alt="imageAlt"
          :fit="objectFit"
          :style="imageStyleObj"
        >
          <template #error>
            <div class="base-image__placeholder">图片加载失败</div>
          </template>
        </el-image>
        <div v-else class="base-image__placeholder">请在属性面板配置图片</div>
      </template>

      <div v-if="caption" class="base-image__caption" :style="captionStyleObj">{{ caption }}</div>
    </div>
  </UnifiedContainerDisplay>
</template>

<script setup lang="ts">
  import { computed, type CSSProperties } from 'vue';
  import { UnifiedContainerDisplay } from '../../common/unified-container';
  import type {
    UnifiedContainerContentConfigModel,
    UnifiedContainerStyleConfigModel,
  } from '../../common/unified-container';
  import { normalizeImageSource, toNonNegativeNumber, toPositiveNumber } from '../common/material-utils';

  type BorderStyleType = 'none' | 'solid' | 'dashed' | 'dotted';
  type WidthModeType = 'full' | 'custom';
  type FitType = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';

  interface BaseImageSchema {
    content?: {
      container?: Partial<UnifiedContainerContentConfigModel>;
      image?: {
        src?: string;
        alt?: string;
        caption?: string;
        linkUrl?: string;
        openInNewTab?: boolean;
      };
    };
    style?: {
      container?: Partial<UnifiedContainerStyleConfigModel>;
      image?: {
        height?: number;
        widthMode?: WidthModeType;
        width?: number;
        objectFit?: FitType;
        backgroundColor?: string;
        borderStyle?: BorderStyleType;
        borderWidth?: number;
        borderColor?: string;
        borderRadius?: number;
        boxShadow?: string;
        captionColor?: string;
        captionFontSize?: number;
        captionMarginTop?: number;
      };
    };
  }

  const props = defineProps<{
    schema: BaseImageSchema;
  }>();

  const containerContentConfig = computed(() => props.schema?.content?.container);
  const containerStyleConfig = computed(() => props.schema?.style?.container);

  const imageConfig = computed(() => props.schema?.content?.image || {});
  const imageStyleConfig = computed(() => props.schema?.style?.image || {});

  const imageSrc = computed(() => normalizeImageSource(imageConfig.value.src));
  const imageAlt = computed(() => String(imageConfig.value.alt || 'image'));
  const linkUrl = computed(() => String(imageConfig.value.linkUrl || '').trim());
  const openInNewTab = computed(() => imageConfig.value.openInNewTab !== false);
  const caption = computed(() => String(imageConfig.value.caption || '').trim());

  const objectFit = computed<FitType>(() => {
    const fit = imageStyleConfig.value.objectFit;
    if (fit === 'fill' || fit === 'contain' || fit === 'cover' || fit === 'none' || fit === 'scale-down') {
      return fit;
    }
    return 'cover';
  });

  const imageStyleObj = computed<CSSProperties>(() => {
    const style = imageStyleConfig.value;
    const height = Math.max(80, toPositiveNumber(style.height, 220));
    const widthMode = style.widthMode === 'custom' ? 'custom' : 'full';
    const width = Math.max(120, toPositiveNumber(style.width, 320));
    const borderStyle = style.borderStyle || 'none';
    const borderWidth = toNonNegativeNumber(style.borderWidth, 0);
    const borderColor = style.borderColor || '#e2e8f0';

    return {
      width: widthMode === 'full' ? '100%' : `${width}px`,
      height: `${height}px`,
      backgroundColor: style.backgroundColor || '#f8fafc',
      border:
        borderStyle !== 'none' && borderWidth > 0
          ? `${borderWidth}px ${borderStyle} ${borderColor}`
          : `${Math.max(0, borderWidth)}px solid transparent`,
      borderRadius: `${toNonNegativeNumber(style.borderRadius, 8)}px`,
      boxShadow: style.boxShadow || 'none',
      display: 'block',
    };
  });

  const wrapperStyleObj = computed<CSSProperties>(() => ({
    width: '100%',
  }));

  const captionStyleObj = computed<CSSProperties>(() => {
    const style = imageStyleConfig.value;
    return {
      marginTop: `${toNonNegativeNumber(style.captionMarginTop, 8)}px`,
      color: style.captionColor || '#475569',
      fontSize: `${Math.max(12, toPositiveNumber(style.captionFontSize, 13))}px`,
      lineHeight: '1.6',
    };
  });

  defineOptions({
    name: 'base-image-index',
  });
</script>

<style scoped>
  .base-image {
    width: 100%;
  }

  .base-image__link {
    display: block;
    text-decoration: none;
  }

  .base-image__image,
  .base-image__placeholder {
    width: 100%;
  }

  .base-image__placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 120px;
    color: #64748b;
    background: #f8fafc;
    border-radius: 8px;
  }

  .base-image__caption {
    overflow-wrap: break-word;
  }
</style>
