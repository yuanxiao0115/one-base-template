<template>
  <UnifiedContainerDisplay :content="containerContentConfig" :style="containerStyleConfig">
    <div class="base-iframe-container">
      <div class="base-iframe-container__shell" :style="iframeStyleObj">
        <iframe
          v-if="iframeSrc"
          class="base-iframe-container__frame"
          :src="iframeSrc"
          :title="iframeTitle"
          :loading="iframeLoading"
          :allow="allowAttr"
          :sandbox="sandboxAttr"
          :allowfullscreen="allowFullscreen"
          :referrerpolicy="referrerPolicy"
        />
        <div v-else class="base-iframe-container__empty">{{ emptyText }}</div>
      </div>
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
  normalizeIframeSource,
  toNonNegativeNumber,
  toPositiveNumber
} from '../common/material-utils';

type BorderStyleType = 'none' | 'solid' | 'dashed' | 'dotted';
type LoadingType = 'lazy' | 'eager';
type IframeReferrerPolicy =
  | 'no-referrer'
  | 'origin'
  | 'strict-origin'
  | 'origin-when-cross-origin'
  | 'strict-origin-when-cross-origin'
  | 'no-referrer-when-downgrade'
  | 'unsafe-url';

interface BaseIframeSchema {
  content?: {
    container?: Partial<UnifiedContainerContentConfigModel>;
    iframe?: {
      src?: string;
      title?: string;
      loading?: LoadingType;
      allowFullscreen?: boolean;
      allow?: string;
      sandbox?: string;
      referrerPolicy?: IframeReferrerPolicy;
    };
  };
  style?: {
    container?: Partial<UnifiedContainerStyleConfigModel>;
    iframe?: {
      height?: number;
      backgroundColor?: string;
      borderStyle?: BorderStyleType;
      borderWidth?: number;
      borderColor?: string;
      borderRadius?: number;
      boxShadow?: string;
    };
  };
}

const props = defineProps<{
  schema: BaseIframeSchema;
}>();

const containerContentConfig = computed(() => props.schema?.content?.container);
const containerStyleConfig = computed(() => props.schema?.style?.container);
const iframeConfig = computed(() => props.schema?.content?.iframe || {});
const iframeStyleConfig = computed(() => props.schema?.style?.iframe || {});

const rawSrc = computed(() => String(iframeConfig.value.src || '').trim());
const iframeSrc = computed(() => normalizeIframeSource(rawSrc.value));
const iframeTitle = computed(() => String(iframeConfig.value.title || '内嵌页面'));
const iframeLoading = computed<LoadingType>(() =>
  iframeConfig.value.loading === 'eager' ? 'eager' : 'lazy'
);
const allowFullscreen = computed(() => iframeConfig.value.allowFullscreen !== false);
const allowAttr = computed(() => String(iframeConfig.value.allow || '').trim() || undefined);
const sandboxAttr = computed(() => String(iframeConfig.value.sandbox || '').trim() || undefined);
const referrerPolicy = computed<IframeReferrerPolicy | undefined>(() => {
  switch (iframeConfig.value.referrerPolicy) {
    case 'no-referrer':
    case 'origin':
    case 'strict-origin':
    case 'origin-when-cross-origin':
    case 'strict-origin-when-cross-origin':
    case 'no-referrer-when-downgrade':
    case 'unsafe-url':
      return iframeConfig.value.referrerPolicy;
    default:
      return undefined;
  }
});

const emptyText = computed(() => {
  if (!rawSrc.value) {
    return '请在属性面板配置可嵌入链接';
  }
  return '链接协议不受支持，仅允许 http/https/相对路径';
});

const iframeStyleObj = computed<CSSProperties>(() => {
  const style = iframeStyleConfig.value;
  const borderStyle = style.borderStyle || 'solid';
  const borderWidth = toNonNegativeNumber(style.borderWidth, 1);
  const borderColor = style.borderColor || '#e2e8f0';

  return {
    width: '100%',
    height: `${Math.max(160, toPositiveNumber(style.height, 460))}px`,
    background: style.backgroundColor || '#ffffff',
    border:
      borderStyle !== 'none' && borderWidth > 0
        ? `${borderWidth}px ${borderStyle} ${borderColor}`
        : `${Math.max(0, borderWidth)}px solid transparent`,
    borderRadius: `${toNonNegativeNumber(style.borderRadius, 8)}px`,
    boxShadow: style.boxShadow || 'none',
    overflow: 'hidden'
  };
});

defineOptions({
  name: 'base-iframe-container-index'
});
</script>

<style scoped>
.base-iframe-container {
  width: 100%;
}

.base-iframe-container__shell {
  position: relative;
}

.base-iframe-container__frame {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  background: transparent;
}

.base-iframe-container__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0 16px;
  text-align: center;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}
</style>
