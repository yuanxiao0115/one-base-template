<!-- eslint-disable vue/no-v-html -->
<template>
  <UnifiedContainerDisplay :content="containerContentConfig" :style="containerStyleConfig">
    <div class="base-text" :style="textStyleObj">
      <div v-if="asHtml" class="base-text__html" v-html="textValue" />
      <div v-else class="base-text__plain">{{ textValue || '请在属性面板填写文字内容。' }}</div>
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
import { toNonNegativeNumber, toPositiveNumber } from '../common/material-utils';

type AlignType = 'left' | 'center' | 'right' | 'justify';
type BorderStyleType = 'none' | 'solid' | 'dashed' | 'dotted';

interface BaseTextSchema {
  content?: {
    container?: Partial<UnifiedContainerContentConfigModel>;
    text?: {
      value?: string;
      asHtml?: boolean;
    };
  };
  style?: {
    container?: Partial<UnifiedContainerStyleConfigModel>;
    text?: {
      align?: AlignType;
      fontSize?: number;
      fontWeight?: number;
      lineHeight?: number;
      letterSpacing?: number;
      textColor?: string;
      backgroundColor?: string;
      padding?: number;
      borderStyle?: BorderStyleType;
      borderWidth?: number;
      borderColor?: string;
      borderRadius?: number;
      maxLines?: number;
    };
  };
}

const props = defineProps<{
  schema: BaseTextSchema;
}>();

const containerContentConfig = computed(() => props.schema?.content?.container);
const containerStyleConfig = computed(() => props.schema?.style?.container);

const textConfig = computed(() => props.schema?.content?.text || {});
const styleConfig = computed(() => props.schema?.style?.text || {});

const textValue = computed(() => String(textConfig.value.value || ''));
const asHtml = computed(() => textConfig.value.asHtml === true);

const textStyleObj = computed<CSSProperties>(() => {
  const style = styleConfig.value;
  const maxLines = Math.max(0, Number(style.maxLines) || 0);
  const borderStyle = style.borderStyle || 'none';
  const borderWidth = toNonNegativeNumber(style.borderWidth, 0);

  return {
    color: style.textColor || '#334155',
    background: style.backgroundColor || 'transparent',
    textAlign: style.align || 'left',
    fontSize: `${Math.max(12, toPositiveNumber(style.fontSize, 15))}px`,
    fontWeight: `${Math.max(300, Math.min(900, Number(style.fontWeight) || 400))}`,
    lineHeight: String(Number(style.lineHeight) > 0 ? Number(style.lineHeight) : 1.7),
    letterSpacing: `${toNonNegativeNumber(style.letterSpacing, 0)}px`,
    padding: `${toNonNegativeNumber(style.padding, 0)}px`,
    border:
      borderStyle !== 'none' && borderWidth > 0
        ? `${borderWidth}px ${borderStyle} ${style.borderColor || '#e2e8f0'}`
        : 'none',
    borderRadius: `${toNonNegativeNumber(style.borderRadius, 0)}px`,
    display: maxLines > 0 ? '-webkit-box' : 'block',
    WebkitLineClamp: maxLines > 0 ? `${maxLines}` : undefined,
    WebkitBoxOrient: maxLines > 0 ? 'vertical' : undefined,
    overflow: maxLines > 0 ? 'hidden' : 'visible',
    whiteSpace: asHtml.value ? 'normal' : 'pre-wrap',
    wordBreak: 'break-word'
  };
});

defineOptions({
  name: 'base-text-index'
});
</script>

<style scoped>
.base-text {
  width: 100%;
}

.base-text__html,
.base-text__plain {
  width: 100%;
}
</style>
