<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  icon?: string;
}>();

const classes = computed(() => {
  const raw = (props.icon ?? '').trim();
  if (!raw) return [];

  // 后端有时会直接返回多 class（例如：`i-icon-menu i-icon-xxx`）
  if (raw.includes(' ')) {
    return raw.split(/\s+/g).filter(Boolean);
  }

  // 兼容 standard-oa-web-sczfw 菜单 icon 约定：`i-icon-xxx` 需要叠加基类 `i-icon-menu`
  if (raw.startsWith('i-icon-')) {
    return ['i-icon-menu', raw];
  }

  // 常见 iconfont 约定：`icon-xxx` 需要叠加基类 `iconfont`
  if (raw.startsWith('icon-')) {
    return ['iconfont', raw];
  }

  return [raw];
});
</script>

<template>
  <i v-if="classes.length" :class="classes" aria-hidden="true" />
</template>

