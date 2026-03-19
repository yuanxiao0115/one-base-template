<template>
  <UnifiedContainerDisplay :content="containerContentConfig" :style="containerStyleConfig">
    <div class="placeholder-block" :style="blockStyleObj">
      <div v-if="!htmlContent" class="placeholder-empty">请在右侧属性面板填写 HTML 内容</div>
      <div v-else class="placeholder-html" v-html="htmlContent" />
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

type PlaceholderBlockBorderStyle = 'none' | 'solid' | 'dashed' | 'dotted';

interface PlaceholderBlockSchema {
  content?: {
    container?: Partial<UnifiedContainerContentConfigModel>;
    block?: {
      html?: string;
    };
  };
  style?: {
    container?: Partial<UnifiedContainerStyleConfigModel>;
    block?: {
      minHeight?: number;
      padding?: number;
      backgroundColor?: string;
      textColor?: string;
      borderWidth?: number;
      borderStyle?: PlaceholderBlockBorderStyle;
      borderColor?: string;
      borderRadius?: number;
      fontSize?: number;
      lineHeight?: number | string;
    };
  };
}

const props = defineProps<{
  schema: PlaceholderBlockSchema;
}>();

const htmlContent = computed(() => {
  const value = props.schema?.content?.block?.html;
  return typeof value === 'string' ? value : '';
});

const containerContentConfig = computed(() => props.schema?.content?.container);
const containerStyleConfig = computed(() => props.schema?.style?.container);

const BORDER_STYLE_SET = new Set<PlaceholderBlockBorderStyle>([
  'none',
  'solid',
  'dashed',
  'dotted'
]);

function toNonNegativeNumber(value: unknown, fallback: number): number {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return fallback;
  }
  return numberValue < 0 ? 0 : numberValue;
}

function toBorderStyle(
  value: unknown,
  fallback: PlaceholderBlockBorderStyle
): PlaceholderBlockBorderStyle {
  return typeof value === 'string' && BORDER_STYLE_SET.has(value as PlaceholderBlockBorderStyle)
    ? (value as PlaceholderBlockBorderStyle)
    : fallback;
}

const blockStyleObj = computed<CSSProperties>(() => {
  const style = props.schema?.style?.block || {};
  const minHeight = Math.max(80, toNonNegativeNumber(style.minHeight, 180));
  const padding = toNonNegativeNumber(style.padding, 0);
  const borderWidth = toNonNegativeNumber(style.borderWidth, 0);
  const borderStyle = toBorderStyle(style.borderStyle, 'solid');
  const borderColor = typeof style.borderColor === 'string' ? style.borderColor : 'transparent';

  return {
    minHeight: `${minHeight}px`,
    padding: `${padding}px`,
    backgroundColor: style.backgroundColor || 'transparent',
    color: style.textColor || '#0f172a',
    border:
      borderWidth > 0 && borderStyle !== 'none'
        ? `${borderWidth}px ${borderStyle} ${borderColor}`
        : 'none',
    borderRadius: `${toNonNegativeNumber(style.borderRadius, 0)}px`,
    fontSize: `${Math.max(12, toNonNegativeNumber(style.fontSize, 14))}px`,
    lineHeight: String(style.lineHeight || 1.6)
  };
});

defineOptions({
  name: 'base-placeholder-block-index'
});
</script>

<style scoped>
.placeholder-block {
  box-sizing: border-box;
  width: 100%;
  min-height: 100%;
  overflow-wrap: break-word;
}

.placeholder-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 120px;
  color: #64748b;
}

.placeholder-html {
  width: 100%;
}
</style>
