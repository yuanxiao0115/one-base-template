<template>
  <div class="title-stripe" :style="wrapperStyle">
    <div class="title-stripe-base" :style="baseStyle" />
    <div
      v-if="accentCountValue > 0"
      class="title-stripe-accent"
      :style="accentStyle"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  height?: number;
  width?: number;
  accentCount?: number;
  accentColor?: string;
  baseColor?: string;
}>();

const toPositiveNumber = (value: unknown, fallback: number) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : fallback;
};

const heightValue = computed(() => toPositiveNumber(props.height, 8));
const widthValue = computed(() => toPositiveNumber(props.width, 3));
const gapValue = computed(() => widthValue.value);
const skewValue = computed(() => widthValue.value);
const tileWidthValue = computed(() => widthValue.value + gapValue.value);
const accentCountValue = computed(() => {
  const count = Number(props.accentCount);
  return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
});

const createParallelogramStripe = (color: string) => {
  const height = heightValue.value;
  const width = widthValue.value;
  const skew = skewValue.value;
  const tileWidth = tileWidthValue.value;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tileWidth}" height="${height}" viewBox="0 0 ${tileWidth} ${height}"><polygon points="${skew} 0 ${skew + width} 0 ${width} ${height} 0 ${height}" fill="${color}"/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};

const wrapperStyle = computed(() => ({
  height: `${heightValue.value}px`,
  width: '100%',
  overflow: 'hidden',
  position: 'relative' as const
}));

const baseStyle = computed(() => ({
  height: `${heightValue.value}px`,
  width: `calc(100% + ${tileWidthValue.value}px)`,
  backgroundImage: createParallelogramStripe(props.baseColor || '#E2E7F0'),
  backgroundPosition: 'right center'
}));

const accentStyle = computed(() => ({
  height: `${heightValue.value}px`,
  width: `${tileWidthValue.value * accentCountValue.value}px`,
  backgroundImage: createParallelogramStripe(props.accentColor || '#2B6DE5'),
  backgroundPosition: 'left center'
}));

defineOptions({ name: 'pb-title-stripe-display' });
</script>

<style scoped>
.title-stripe-base,
.title-stripe-accent {
  position: absolute;
  top: 0;
  left: 0;
  background-repeat: repeat;
}
</style>
