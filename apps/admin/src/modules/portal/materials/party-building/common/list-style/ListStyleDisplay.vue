<template>
  <div class="pb-list-style-display" :style="styleVars">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ListStyleModelType } from './types';

const props = defineProps<{ styles?: ListStyleModelType }>();

const withUnit = (value?: number, fallback?: number) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${value}px`;
  }
  if (typeof fallback === 'number') {
    return `${fallback}px`;
  }
  return undefined;
};

const styleVars = computed(() => ({
  '--list-title-color': props.styles?.titleColor,
  '--list-title-font-size': withUnit(props.styles?.titleFontSize),
  '--list-title-font-weight': props.styles?.titleFontWeight,
  '--list-title-hover-color': props.styles?.titleHoverColor,
  '--list-date-color': props.styles?.dateColor,
  '--list-date-font-size': withUnit(props.styles?.dateFontSize),
  '--list-dot-color': props.styles?.dotColor,
  '--list-dot-size': withUnit(props.styles?.dotSize),
  '--list-dot-gap': withUnit(props.styles?.dotGap),
  '--list-divider-color': props.styles?.rowDividerColor,
  '--list-divider-style': props.styles?.rowDividerStyle,
  '--list-divider-width': withUnit(props.styles?.rowDividerWidth),
  '--list-row-padding-y': withUnit(props.styles?.rowPaddingY)
}));

defineOptions({
  name: 'pb-list-style-display'
});
</script>

<style scoped>
.pb-list-style-display {
  width: 100%;
}
</style>
