<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useAssetStore } from '@one-base-template/core';

const props = defineProps<{
  icon?: string;
}>();

const assetStore = useAssetStore();

const rawIcon = computed(() => (props.icon ?? '').trim());

// 历史 OD 菜单图标：后端常下发 `icon-xxx`，但字体基类是 `iconfont-od`。
const LEGACY_OD_ICON_CLASSES = new Set([
  'icon-kaoqinguanli',
  'icon-tongjibaobiao',
  'icon-shouwenguanli',
  'icon-fawenguanli',
  'icon-gongwenku',
  'icon-wodeyiban',
  'icon-gexinghuashezhi',
  'icon-wodedaiban',
  'icon-huishouzhan',
  'icon-shouye'
]);

const MENU_ICON_BASE_CLASSES = new Set(['iconfont', 'iconfont-od', 'dj-icons', 'i-icon-menu', 'pure-iconfont']);

function splitClassNames(raw: string): string[] {
  return raw
    .split(/\s+/)
    .map(token => token.trim())
    .filter(Boolean);
}

function dedupeClassNames(classNames: string[]): string[] {
  return Array.from(new Set(classNames));
}

function resolveBaseClass(iconClass: string): string | undefined {
  if (iconClass.startsWith('i-icon-')) return 'i-icon-menu';
  if (iconClass.startsWith('dj-icon-')) return 'dj-icons';
  if (iconClass.startsWith('pure-iconfont-')) return 'pure-iconfont';
  if (iconClass.startsWith('icon-')) {
    return LEGACY_OD_ICON_CLASSES.has(iconClass) ? 'iconfont-od' : 'iconfont';
  }
  return undefined;
}

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
  if (raw.startsWith('i-icon-') || raw.startsWith('icon-') || raw.startsWith('dj-icon-') || raw.startsWith('pure-iconfont-')) {
    return 'class';
  }

  // 默认按“资源 id”（minio）处理
  return 'id';
});

const classes = computed(() => {
  const raw = rawIcon.value;
  if (!raw || kind.value !== 'class') return [];

  const tokens = splitClassNames(raw);
  if (!tokens.length) return [];

  // 后端可能返回多 class；如果已包含字体基类，按原样透传。
  if (tokens.some(token => MENU_ICON_BASE_CLASSES.has(token))) {
    return dedupeClassNames(tokens);
  }

  // 多 class 但缺少字体基类时，按第一个 icon token 自动补齐。
  const iconToken = tokens.find(token =>
    token.startsWith('i-icon-') ||
    token.startsWith('icon-') ||
    token.startsWith('dj-icon-') ||
    token.startsWith('pure-iconfont-')
  );
  if (iconToken) {
    const baseClass = resolveBaseClass(iconToken);
    if (baseClass) {
      return dedupeClassNames([baseClass, ...tokens]);
    }
  }

  // 单 class 或无法识别的 class：尽量按前缀推导基类，保持向后兼容。
  const firstToken = tokens[0];
  if (firstToken) {
    const fallbackBaseClass = resolveBaseClass(firstToken);
    if (fallbackBaseClass) {
      return dedupeClassNames([fallbackBaseClass, ...tokens]);
    }
  }

  return dedupeClassNames(tokens);
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
