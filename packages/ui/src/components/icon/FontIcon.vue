<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';

type FontLibrary = 'cp' | 'dj' | 'om';

const props = withDefaults(
  defineProps<{
    name: string;
    library?: FontLibrary;
    size?: string | number;
    color?: string;
    tag?: string;
  }>(),
  {
    library: 'cp',
    size: undefined,
    color: undefined,
    tag: 'i'
  }
);

type FontLibraryConfig = {
  baseClass: string;
  prefix: string;
};

const LIBRARY_CONFIG: Record<FontLibrary, FontLibraryConfig> = {
  cp: {
    baseClass: 'iconfont',
    prefix: 'icon-'
  },
  dj: {
    baseClass: 'dj-icons',
    prefix: 'dj-icon-'
  },
  om: {
    baseClass: 'i-icon-menu',
    prefix: 'i-icon-'
  }
};

const resolvedConfig = computed(() => LIBRARY_CONFIG[props.library]);

const resolvedIconClass = computed(() => {
  const raw = props.name.trim();
  if (!raw) return '';

  const { prefix } = resolvedConfig.value;
  return raw.startsWith(prefix) ? raw : `${prefix}${raw}`;
});

const iconClasses = computed(() => {
  if (!resolvedIconClass.value) return [];
  return [resolvedConfig.value.baseClass, resolvedIconClass.value];
});

const iconStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {};

  if (props.size != null && props.size !== '') {
    style.fontSize = typeof props.size === 'number' ? `${props.size}px` : props.size;
  }

  if (props.color) {
    style.color = props.color;
  }

  return style;
});
</script>

<template>
  <component
    :is="props.tag"
    :class="iconClasses"
    :style="iconStyle"
    v-bind="$attrs"
  />
</template>
