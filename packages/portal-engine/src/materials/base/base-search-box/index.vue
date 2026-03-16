<template>
  <UnifiedContainerDisplay :content="containerContentConfig" :style="containerStyleConfig">
    <div class="base-search-box" :style="wrapperStyleObj">
      <el-input
        v-model="keyword"
        :placeholder="placeholder"
        :style="inputStyleObj"
        @keyup.enter="handleSearch"
      />
      <el-button :style="buttonStyleObj" @click="handleSearch">{{ buttonText }}</el-button>
    </div>
  </UnifiedContainerDisplay>
</template>

<script setup lang="ts">
import { computed, ref, watch, type CSSProperties } from 'vue';
import { useRouter } from 'vue-router';
import { UnifiedContainerDisplay } from '../../common/unified-container';
import type {
  UnifiedContainerContentConfigModel,
  UnifiedContainerStyleConfigModel
} from '../../common/unified-container';
import { appendQueryToUrl, toNonNegativeNumber, toPositiveNumber } from '../common/material-utils';
import {
  mergePortalLinkConfig,
  openPortalLink,
  type PortalLinkConfig
} from '../common/portal-link';

interface BaseSearchBoxSchema {
  content?: {
    container?: Partial<UnifiedContainerContentConfigModel>;
    search?: {
      placeholder?: string;
      buttonText?: string;
      defaultKeyword?: string;
      keywordParamKey?: string;
      linkPath?: string;
      linkParamKey?: string;
      linkValueKey?: string;
      openType?: PortalLinkConfig['openType'];
      link?: Partial<PortalLinkConfig>;
    };
  };
  style?: {
    container?: Partial<UnifiedContainerStyleConfigModel>;
    search?: {
      height?: number;
      radius?: number;
      inputBgColor?: string;
      inputBorderColor?: string;
      inputTextColor?: string;
      buttonBgColor?: string;
      buttonTextColor?: string;
      buttonWidth?: number;
    };
  };
}

const props = defineProps<{
  schema: BaseSearchBoxSchema;
}>();

let router: ReturnType<typeof useRouter> | null = null;
try {
  router = useRouter();
} catch {
  router = null;
}

const containerContentConfig = computed(() => props.schema?.content?.container);
const containerStyleConfig = computed(() => props.schema?.style?.container);
const searchConfig = computed(() => props.schema?.content?.search || {});
const styleConfig = computed(() => props.schema?.style?.search || {});
const searchLink = computed(() =>
  mergePortalLinkConfig(
    searchConfig.value.link || {
      path: searchConfig.value.linkPath,
      paramKey: searchConfig.value.linkParamKey,
      valueKey: searchConfig.value.linkValueKey,
      openType: searchConfig.value.openType
    }
  )
);

const placeholder = computed(() => String(searchConfig.value.placeholder || '请输入关键字'));
const buttonText = computed(() => String(searchConfig.value.buttonText || '搜索'));

const keyword = ref('');
watch(
  () => searchConfig.value.defaultKeyword,
  (value) => {
    keyword.value = String(value || '');
  },
  { immediate: true }
);

const wrapperStyleObj = computed<CSSProperties>(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
}));

const inputStyleObj = computed<CSSProperties>(() => ({
  '--el-input-height': `${Math.max(30, toPositiveNumber(styleConfig.value.height, 40))}px`,
  '--el-input-bg-color': styleConfig.value.inputBgColor || '#ffffff',
  '--el-input-border-color': styleConfig.value.inputBorderColor || '#d0d7e2',
  '--el-input-text-color': styleConfig.value.inputTextColor || '#0f172a',
  '--el-input-border-radius': `${toNonNegativeNumber(styleConfig.value.radius, 8)}px`
}));

const buttonStyleObj = computed<CSSProperties>(() => ({
  width: `${Math.max(68, toPositiveNumber(styleConfig.value.buttonWidth, 96))}px`,
  height: `${Math.max(30, toPositiveNumber(styleConfig.value.height, 40))}px`,
  borderRadius: `${toNonNegativeNumber(styleConfig.value.radius, 8)}px`,
  borderColor: styleConfig.value.buttonBgColor || '#2563eb',
  backgroundColor: styleConfig.value.buttonBgColor || '#2563eb',
  color: styleConfig.value.buttonTextColor || '#ffffff',
  flexShrink: 0
}));

function handleSearch() {
  const path = String(searchLink.value.path || '').trim();
  if (!path) {
    return;
  }

  const paramKey =
    String(searchConfig.value.keywordParamKey || searchLink.value.paramKey || 'keyword').trim() ||
    'keyword';
  const link = appendQueryToUrl(path, {
    [paramKey]: keyword.value
  });

  openPortalLink({
    link,
    openType: searchLink.value.openType,
    routerPush: router ? (nextLink: string) => router!.push(nextLink) : null
  });
}

defineOptions({
  name: 'base-search-box-index'
});
</script>

<style scoped>
.base-search-box {
  width: 100%;
}
</style>
