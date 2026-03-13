<template>
  <UnifiedContainerDisplay :content="containerContentConfig" :style="containerStyleConfig">
    <div class="base-timeline" :style="wrapperStyleObj">
      <el-skeleton v-if="loading" :rows="4" animated />

      <template v-else>
        <div v-if="displayRows.length" class="base-timeline__list" :style="listStyleObj">
          <div
            v-for="(row, rowIndex) in displayRows"
            :key="resolveRowId(row, rowIndex)"
            class="base-timeline__item"
            :class="{ 'is-last': rowIndex === displayRows.length - 1 }"
          >
            <p class="base-timeline__time" :style="timeStyleObj">{{ resolveTime(row) }}</p>

            <div class="base-timeline__track">
              <span class="base-timeline__point" :style="pointStyleObj" />
              <span class="base-timeline__line" :style="lineStyleObj" />
            </div>

            <div class="base-timeline__content">
              <button
                v-if="canNavigate"
                class="base-timeline__title base-timeline__title--link"
                :style="titleStyleObj"
                type="button"
                @click="handleRowClick(row)"
              >
                {{ resolveTitle(row) }}
              </button>
              <h4 v-else class="base-timeline__title" :style="titleStyleObj">{{ resolveTitle(row) }}</h4>
              <p class="base-timeline__desc" :style="contentStyleObj">{{ resolveContent(row) }}</p>
            </div>
          </div>
        </div>

        <div v-else class="base-timeline__empty">暂无时间线数据</div>
      </template>
    </div>
  </UnifiedContainerDisplay>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, watch, type CSSProperties } from 'vue';
  import { useRouter } from 'vue-router';
  import { UnifiedContainerDisplay } from '../../common/unified-container';
  import type {
    UnifiedContainerContentConfigModel,
    UnifiedContainerStyleConfigModel,
  } from '../../common/unified-container';
  import { loadPortalDataSourceRows, mergePortalDataSourceModel, type PortalDataSourceModel } from '../common/portal-data-source';
  import { mergePortalLinkConfig, openPortalLink, resolvePortalLink, type PortalLinkConfig } from '../common/portal-link';
  import { resolveValueByPath, toNonNegativeNumber, toPositiveNumber } from '../common/material-utils';

  type RowData = Record<string, unknown>;

  interface BaseTimelineSchema {
    content?: {
      container?: Partial<UnifiedContainerContentConfigModel>;
      dataSource?: Partial<PortalDataSourceModel>;
      timeline?: {
        timeKey?: string;
        titleKey?: string;
        contentKey?: string;
        idKey?: string;
        maxDisplayCount?: number;
        linkPath?: string;
        linkParamKey?: string;
        linkValueKey?: string;
        openType?: PortalLinkConfig['openType'];
        link?: Partial<PortalLinkConfig>;
      };
    };
    style?: {
      container?: Partial<UnifiedContainerStyleConfigModel>;
      timeline?: {
        lineColor?: string;
        pointColor?: string;
        timeColor?: string;
        titleColor?: string;
        contentColor?: string;
        timeFontSize?: number;
        titleFontSize?: number;
        contentFontSize?: number;
        rowGap?: number;
        timeWidth?: number;
      };
    };
  }

  const props = defineProps<{
    schema: BaseTimelineSchema;
  }>();

  let router: ReturnType<typeof useRouter> | null = null;
  try {
    router = useRouter();
  } catch {
    router = null;
  }

  const loading = ref(false);
  const rows = ref<RowData[]>([]);
  let requestController: AbortController | null = null;

  const containerContentConfig = computed(() => props.schema?.content?.container);
  const containerStyleConfig = computed(() => props.schema?.style?.container);
  const dataSource = computed(() => mergePortalDataSourceModel(props.schema?.content?.dataSource));
  const styleConfig = computed(() => props.schema?.style?.timeline || {});

  const timelineConfig = computed(() => {
    const raw = props.schema?.content?.timeline || {};
    return {
      timeKey: String(raw.timeKey || 'time'),
      titleKey: String(raw.titleKey || 'title'),
      contentKey: String(raw.contentKey || 'content'),
      idKey: String(raw.idKey || 'id'),
      maxDisplayCount: Math.max(1, toPositiveNumber(raw.maxDisplayCount, 10)),
      link: mergePortalLinkConfig(
        raw.link || {
          path: raw.linkPath,
          paramKey: raw.linkParamKey,
          valueKey: raw.linkValueKey,
          openType: raw.openType,
        }
      ),
    };
  });

  const canNavigate = computed(() => Boolean(timelineConfig.value.link.path.trim()));

  const displayRows = computed(() => {
    return rows.value.slice(0, timelineConfig.value.maxDisplayCount);
  });

  const wrapperStyleObj = computed<CSSProperties>(() => ({
    width: '100%',
  }));

  const listStyleObj = computed<CSSProperties>(() => ({
    display: 'flex',
    flexDirection: 'column',
    gap: `${toNonNegativeNumber(styleConfig.value.rowGap, 14)}px`,
  }));

  const timeStyleObj = computed<CSSProperties>(() => ({
    width: `${Math.max(80, toPositiveNumber(styleConfig.value.timeWidth, 120))}px`,
    color: styleConfig.value.timeColor || '#64748b',
    fontSize: `${Math.max(12, toPositiveNumber(styleConfig.value.timeFontSize, 12))}px`,
    flexShrink: 0,
  }));

  const pointStyleObj = computed<CSSProperties>(() => ({
    background: styleConfig.value.pointColor || '#2563eb',
  }));

  const lineStyleObj = computed<CSSProperties>(() => ({
    background: styleConfig.value.lineColor || '#cbd5e1',
  }));

  const titleStyleObj = computed<CSSProperties>(() => ({
    color: styleConfig.value.titleColor || '#0f172a',
    fontSize: `${Math.max(12, toPositiveNumber(styleConfig.value.titleFontSize, 14))}px`,
  }));

  const contentStyleObj = computed<CSSProperties>(() => ({
    color: styleConfig.value.contentColor || '#475569',
    fontSize: `${Math.max(12, toPositiveNumber(styleConfig.value.contentFontSize, 12))}px`,
  }));

  function resolveRowId(row: RowData, rowIndex: number): string {
    const value = resolveValueByPath(row, timelineConfig.value.idKey);
    if (value !== undefined && value !== null && `${value}`.trim()) {
      return String(value);
    }

    const fallback = resolveValueByPath(row, '__rowIndex');
    if (fallback !== undefined && fallback !== null && `${fallback}`.trim()) {
      return `timeline-${fallback}`;
    }

    return `timeline-${rowIndex + 1}`;
  }

  function resolveTime(row: RowData): string {
    return String(resolveValueByPath(row, timelineConfig.value.timeKey) || '--');
  }

  function resolveTitle(row: RowData): string {
    return String(resolveValueByPath(row, timelineConfig.value.titleKey) || '未命名事件');
  }

  function resolveContent(row: RowData): string {
    return String(resolveValueByPath(row, timelineConfig.value.contentKey) || '');
  }

  function handleRowClick(row: RowData) {
    if (!canNavigate.value) {
      return;
    }

    const valueKey = String(timelineConfig.value.link.valueKey || timelineConfig.value.idKey);
    const paramValue = resolveValueByPath(row, valueKey);
    const link = resolvePortalLink(timelineConfig.value.link, paramValue);

    openPortalLink({
      link,
      openType: timelineConfig.value.link.openType,
      routerPush: router ? (nextLink: string) => router!.push(nextLink) : null,
    });
  }

  async function loadRows() {
    requestController?.abort();
    requestController = new AbortController();

    loading.value = true;
    const result = await loadPortalDataSourceRows<RowData>(dataSource.value, {
      page: 1,
      pageSize: timelineConfig.value.maxDisplayCount,
      signal: requestController.signal,
    });

    if (requestController.signal.aborted) {
      return;
    }

    rows.value = result.rows;
    loading.value = false;
  }

  watch(
    () => [dataSource.value, timelineConfig.value.maxDisplayCount],
    () => {
      loadRows();
    },
    { deep: true, immediate: true }
  );

  onBeforeUnmount(() => {
    requestController?.abort();
  });

  defineOptions({
    name: 'base-timeline-index',
  });
</script>

<style scoped>
  .base-timeline {
    width: 100%;
  }

  .base-timeline__item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .base-timeline__time {
    margin: 0;
    line-height: 1.5;
    word-break: break-word;
  }

  .base-timeline__track {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 16px;
    min-height: 100%;
    flex-shrink: 0;
  }

  .base-timeline__point {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    margin-top: 4px;
    z-index: 1;
  }

  .base-timeline__line {
    width: 2px;
    flex: 1;
    min-height: 24px;
    margin-top: 4px;
  }

  .base-timeline__item.is-last .base-timeline__line {
    display: none;
  }

  .base-timeline__content {
    min-width: 0;
    flex: 1;
  }

  .base-timeline__title {
    margin: 0;
    line-height: 1.45;
    word-break: break-word;
    font-weight: 600;
  }

  .base-timeline__title--link {
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
    text-align: left;
  }

  .base-timeline__desc {
    margin: 4px 0 0;
    line-height: 1.55;
    word-break: break-word;
    white-space: pre-wrap;
  }

  .base-timeline__empty {
    color: #94a3b8;
    font-size: 12px;
    line-height: 1.4;
  }

  @media (max-width: 768px) {
    .base-timeline__item {
      flex-direction: column;
      gap: 6px;
    }

    .base-timeline__track {
      display: none;
    }
  }
</style>
