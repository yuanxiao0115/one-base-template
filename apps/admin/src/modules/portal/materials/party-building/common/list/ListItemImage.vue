<template>
  <div class="pb-list-item-image" :style="containerStyle">
    <slot>
      <img v-if="src" :src="src" :alt="alt" :style="imgStyle">
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';

const props = withDefaults(
  defineProps<{
    src?: string;
    alt?: string;
    width?: number;
    height?: number;
    borderRadius?: number;
  }>(),
  {
    src: '',
    alt: '列表图片',
    width: 80,
    height: 55,
    borderRadius: 4
  }
);

const containerStyle = computed<CSSProperties>(() => ({
  width: `${props.width}px`,
  height: `${props.height}px`,
  borderRadius: `${props.borderRadius}px`
}));

const imgStyle = computed<CSSProperties>(() => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: `${props.borderRadius}px`
}));

defineOptions({
  name: 'pb-list-item-image'
});
</script>

<style scoped>
.pb-list-item-image {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  margin-right: 14px;
  background-color: #f0f2f5;
  flex-shrink: 0;
}
</style>
