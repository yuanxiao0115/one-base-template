<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useAssetStore } from '@one-base-template/core';

const props = defineProps<{
  icon?: string;
}>();

const assetStore = useAssetStore();

const rawIcon = computed(() => (props.icon ?? '').trim());

type IconKind = 'empty' | 'class' | 'url' | 'id';

const kind = computed<IconKind>(() => {
  const raw = rawIcon.value;
  if (!raw) return 'empty';

  // 直接传入 url（例如后端已返回可访问地址，或业务侧自行拼接）
  if (raw.startsWith('data:') || raw.startsWith('blob:') || raw.startsWith('http://') || raw.startsWith('https://')) {
    return 'url';
  }

  // 后端有时会直接返回多 class（例如：`i-icon-menu i-icon-xxx`）
  if (raw.includes(' ')) return 'class';

  // iconfont class
  if (raw.startsWith('i-icon-') || raw.startsWith('icon-') || raw.startsWith('pure-iconfont-')) {
    return 'class';
  }

  // 默认按“资源 id”（minio）处理
  return 'id';
});

const classes = computed(() => {
  const raw = rawIcon.value;
  if (!raw || kind.value !== 'class') return [];

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

const imgSrc = ref<string>('');

watch(
  () => [rawIcon.value, kind.value] as const,
  async ([raw, k]) => {
    imgSrc.value = '';

    if (!raw || k === 'empty') return;
    if (k === 'url') {
      imgSrc.value = raw;
      return;
    }
    if (k === 'id') {
      imgSrc.value = (await assetStore.getImageUrl(raw)) ?? '';
    }
  },
  { immediate: true }
);
</script>

<template>
  <img
    v-if="imgSrc"
    :src="imgSrc"
    class="w-4 h-4 object-contain"
    alt=""
    aria-hidden="true"
  >
  <i v-else-if="classes.length" :class="classes" aria-hidden="true" />
</template>
