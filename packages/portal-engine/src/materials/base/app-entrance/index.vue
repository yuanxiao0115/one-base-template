<template>
  <UnifiedContainerDisplay :content="containerContentConfig" :style="containerStyleConfig">
    <el-skeleton v-if="loading" :rows="4" animated />
    <div v-else class="app-entrance" :style="containerStyleObj">
      <div
        v-for="(app, index) in displayItems"
        :key="app.id || index"
        class="app-item"
        :style="itemStyleObj"
        @click="openApp(app)"
      >
        <div class="app-icon" :style="iconStyleObj">
          <img v-if="resolveImageUrl(app)" :src="resolveImageUrl(app)" :alt="app.title" />
          <MenuIcon
            v-else-if="resolveMenuIcon(app)"
            :icon="resolveMenuIcon(app)!"
            :style="iconFontStyleObj"
          />
          <span v-else>{{ getShortName(app.title) }}</span>
        </div>
        <div class="app-name" :style="nameStyleObj">{{ app.title }}</div>
        <div v-if="showDescription" class="app-desc" :style="descStyleObj">
          {{ app.description }}
        </div>
      </div>

      <div class="app-item add-item" :style="itemStyleObj" @click="openAppCenter">
        <div class="app-icon add-icon" :style="iconStyleObj">
          <img :src="addIcon" alt="添加应用" />
        </div>
        <div class="app-name add-name" :style="nameStyleObj">{{ addText }}</div>
      </div>
    </div>
  </UnifiedContainerDisplay>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, type CSSProperties } from 'vue';
import { useRouter } from 'vue-router';
import { MenuIcon } from '@one-base-template/ui';
import { UnifiedContainerDisplay } from '../../common/unified-container';
import type {
  UnifiedContainerContentConfigModel,
  UnifiedContainerStyleConfigModel
} from '../../common/unified-container';
import {
  loadPortalDataSourceRows,
  mergePortalDataSourceModel,
  type PortalDataSourceModel
} from '../common/portal-data-source';
import {
  normalizeImageSource,
  resolveValueByPath,
  toNonNegativeNumber,
  toPositiveNumber
} from '../common/material-utils';
import {
  mergePortalLinkConfig,
  openPortalLink,
  resolvePortalLink,
  type PortalLinkConfig
} from '../common/portal-link';
import addIcon from './icon-add.svg';

interface EntranceItem {
  id?: string;
  title?: string;
  description?: string;
  icon?: string;
  image?: string;
  badge?: string;
  linkPath?: string;
  linkParamKey?: string;
  linkValueKey?: string;
  openType?: PortalLinkConfig['openType'];
  link?: Partial<PortalLinkConfig>;
}

interface AppEntranceSchema {
  content?: {
    container?: Partial<UnifiedContainerContentConfigModel>;
    dataSource?: Partial<PortalDataSourceModel>;
    addText?: string;
    appCenterUrl?: string;
    entrance?: {
      columnCount?: number;
      showDescription?: boolean;
      idKey?: string;
      titleKey?: string;
      descriptionKey?: string;
      iconKey?: string;
      imageKey?: string;
      badgeKey?: string;
      linkKey?: string;
      items?: EntranceItem[];
    };
  };
  style?: {
    container?: Partial<UnifiedContainerStyleConfigModel>;
    entrance?: {
      cardBgColor?: string;
      cardHoverBgColor?: string;
      cardBorderColor?: string;
      cardRadius?: number;
      cardPadding?: number;
      iconColor?: string;
      titleColor?: string;
      descriptionColor?: string;
      badgeBgColor?: string;
      badgeTextColor?: string;
      titleFontSize?: number;
      descriptionFontSize?: number;
      iconSize?: number;
      imageHeight?: number;
      rowGap?: number;
      columnGap?: number;
    };
  };
}

const props = defineProps<{
  schema: AppEntranceSchema;
}>();

let router: ReturnType<typeof useRouter> | null = null;
try {
  router = useRouter();
} catch {
  router = null;
}

const loading = ref(false);
const sourceRows = ref<Record<string, unknown>[]>([]);
const dataSourceLoadError = ref(false);
let requestController: AbortController | null = null;

const containerContentConfig = computed(() => props.schema?.content?.container);
const containerStyleConfig = computed(() => props.schema?.style?.container);
const entranceConfig = computed(() => props.schema?.content?.entrance || {});
const dataSource = computed(() => mergePortalDataSourceModel(props.schema?.content?.dataSource));
const entranceStyle = computed(() => props.schema?.style?.entrance || {});

const fallbackItems = computed(() => {
  const items = Array.isArray(entranceConfig.value.items) ? entranceConfig.value.items : [];
  return items.map((item, index) => ({
    id: String(item.id || `app-${index + 1}`),
    title: String(item.title || `入口${index + 1}`),
    description: String(item.description || ''),
    icon: String(item.icon || ''),
    image: String(item.image || ''),
    badge: String(item.badge || ''),
    link: mergePortalLinkConfig(
      item.link || {
        path: item.linkPath,
        paramKey: item.linkParamKey,
        valueKey: item.linkValueKey,
        openType: item.openType
      }
    )
  }));
});

const itemMapping = computed(() => ({
  idKey: String(entranceConfig.value.idKey || 'id'),
  titleKey: String(entranceConfig.value.titleKey || 'title'),
  descriptionKey: String(entranceConfig.value.descriptionKey || 'description'),
  iconKey: String(entranceConfig.value.iconKey || 'icon'),
  imageKey: String(entranceConfig.value.imageKey || 'image'),
  badgeKey: String(entranceConfig.value.badgeKey || 'badge'),
  linkKey: String(entranceConfig.value.linkKey || 'link')
}));

function resolveRowLinkConfig(row: Record<string, unknown>): Partial<PortalLinkConfig> {
  const linkValue = resolveValueByPath(row, itemMapping.value.linkKey);
  if (linkValue && typeof linkValue === 'object' && !Array.isArray(linkValue)) {
    return linkValue as Partial<PortalLinkConfig>;
  }
  return {
    path: resolveValueByPath(row, 'linkPath'),
    paramKey: resolveValueByPath(row, 'linkParamKey'),
    valueKey: resolveValueByPath(row, 'linkValueKey'),
    openType: resolveValueByPath(row, 'openType')
  };
}

const dataSourceItems = computed(() => {
  return sourceRows.value.map((row, index) => {
    return {
      id: String(resolveValueByPath(row, itemMapping.value.idKey) || `app-${index + 1}`),
      title: String(resolveValueByPath(row, itemMapping.value.titleKey) || `入口${index + 1}`),
      description: String(resolveValueByPath(row, itemMapping.value.descriptionKey) || ''),
      icon: String(resolveValueByPath(row, itemMapping.value.iconKey) || ''),
      image: String(resolveValueByPath(row, itemMapping.value.imageKey) || ''),
      badge: String(resolveValueByPath(row, itemMapping.value.badgeKey) || ''),
      link: mergePortalLinkConfig(resolveRowLinkConfig(row))
    };
  });
});

const displayItems = computed(() => {
  if (dataSourceLoadError.value) {
    return fallbackItems.value;
  }
  return dataSourceItems.value;
});

const showDescription = computed(() => entranceConfig.value.showDescription === true);
const columnCount = computed(() =>
  Math.min(6, Math.max(1, Number(entranceConfig.value.columnCount) || 4))
);
const addText = computed(() => String(props.schema?.content?.addText || '添加应用'));
const appCenterUrl = computed(() =>
  String(props.schema?.content?.appCenterUrl || '/application/center')
);

const rowGap = computed(() => toNonNegativeNumber(entranceStyle.value.rowGap, 16));
const columnGap = computed(() => toNonNegativeNumber(entranceStyle.value.columnGap, 16));
const iconBoxSize = computed(() =>
  Math.max(36, toPositiveNumber(entranceStyle.value.imageHeight, 64))
);
const iconTextSize = computed(() =>
  Math.max(14, toPositiveNumber(entranceStyle.value.iconSize, 20))
);

const containerStyleObj = computed<CSSProperties>(() => ({
  rowGap: `${rowGap.value}px`,
  columnGap: `${columnGap.value}px`
}));

const itemWidthStyle = computed(() => {
  const cols = columnCount.value;
  const colGapPx = columnGap.value;
  return `calc((100% - ${(cols - 1) * colGapPx}px) / ${cols})`;
});

const itemStyleObj = computed<CSSProperties>(() => ({
  width: itemWidthStyle.value,
  minWidth: itemWidthStyle.value
}));

const iconStyleObj = computed<CSSProperties>(() => ({
  width: `${iconBoxSize.value}px`,
  height: `${iconBoxSize.value}px`,
  borderRadius: `${toNonNegativeNumber(entranceStyle.value.cardRadius, 8)}px`,
  backgroundColor: entranceStyle.value.cardBgColor || 'transparent',
  color: entranceStyle.value.iconColor || '#606266'
}));

const iconFontStyleObj = computed<CSSProperties>(() => ({
  fontSize: `${iconTextSize.value}px`,
  color: entranceStyle.value.iconColor || '#606266'
}));

const nameStyleObj = computed<CSSProperties>(() => ({
  color: entranceStyle.value.titleColor || '#303133',
  fontSize: `${Math.max(12, toPositiveNumber(entranceStyle.value.titleFontSize, 14))}px`
}));

const descStyleObj = computed<CSSProperties>(() => ({
  color: entranceStyle.value.descriptionColor || '#86909c',
  fontSize: `${Math.max(12, toPositiveNumber(entranceStyle.value.descriptionFontSize, 12))}px`
}));

function isMenuIconValue(value: string): boolean {
  return /^[a-z][a-z\d-]*:/i.test(value);
}

function resolveImageUrl(item: (typeof displayItems.value)[number]): string {
  const imageValue = String(item.image || '').trim();
  if (imageValue) {
    return normalizeImageSource(imageValue);
  }

  const iconValue = String(item.icon || '').trim();
  if (!iconValue || isMenuIconValue(iconValue)) {
    return '';
  }
  return normalizeImageSource(iconValue);
}

function resolveMenuIcon(item: (typeof displayItems.value)[number]): string {
  const iconValue = String(item.icon || '').trim();
  if (!iconValue || !isMenuIconValue(iconValue)) {
    return '';
  }
  return iconValue;
}

function getShortName(name?: string): string {
  const text = String(name || '').trim();
  if (!text) {
    return 'A';
  }
  return text.slice(0, 1);
}

function resolveAppLink(item: (typeof displayItems.value)[number]): string {
  const valueKey = String(item.link?.valueKey || 'id');
  const paramValue = resolveValueByPath(item, valueKey);
  return resolvePortalLink(item.link, paramValue);
}

function openApp(item: (typeof displayItems.value)[number]) {
  const link = resolveAppLink(item);
  if (!link) {
    return;
  }

  openPortalLink({
    link,
    openType: item.link?.openType,
    routerPush: router ? (nextLink: string) => router!.push(nextLink) : null
  });
}

function openAppCenter() {
  if (!appCenterUrl.value.trim()) {
    return;
  }

  openPortalLink({
    link: appCenterUrl.value,
    openType: 'newTab',
    routerPush: router ? (nextLink: string) => router!.push(nextLink) : null
  });
}

function cancelRequest() {
  if (requestController) {
    requestController.abort();
    requestController = null;
  }
}

async function loadSourceRows() {
  cancelRequest();
  requestController = new AbortController();

  loading.value = true;
  const result = await loadPortalDataSourceRows<Record<string, unknown>>(dataSource.value, {
    page: 1,
    pageSize: 120,
    signal: requestController.signal
  });

  if (requestController.signal.aborted) {
    return;
  }

  dataSourceLoadError.value = !result.success;
  sourceRows.value = result.success ? result.rows : [];
  loading.value = false;
}

watch(
  () => [dataSource.value, itemMapping.value],
  () => {
    loadSourceRows();
  },
  {
    deep: true,
    immediate: true
  }
);

onBeforeUnmount(() => {
  cancelRequest();
});

defineOptions({
  name: 'app-entrance-index'
});
</script>

<style scoped>
.app-entrance {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  align-content: flex-start;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}

.app-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.app-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-size: 20px;
  font-weight: 600;
}

.app-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.app-name {
  margin-top: 8px;
  width: 100%;
  text-align: center;
  line-height: 1.4;
  word-break: break-all;
}

.app-desc {
  margin-top: 4px;
  width: 100%;
  text-align: center;
  line-height: 1.4;
  word-break: break-all;
}

.add-item .add-icon {
  color: #909399;
  background-color: transparent;
  font-size: 24px;
}

.add-item .add-name {
  color: #606266;
}
</style>
