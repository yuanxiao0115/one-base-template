<template>
  <UnifiedContainerDisplay :content="containerContentConfig" :style="containerStyleConfig">
    <div class="base-stat" :style="wrapperStyleObj">
      <el-skeleton v-if="loading" :rows="3" animated />

      <template v-else>
        <div v-if="displayRows.length" class="base-stat__grid" :style="gridStyleObj">
          <button
            v-for="(row, rowIndex) in displayRows"
            :key="resolveRowId(row, rowIndex)"
            class="base-stat__card"
            :class="{ 'is-clickable': canRowNavigate }"
            :style="cardStyleObj"
            type="button"
            @click="handleRowClick(row)"
          >
            <p class="base-stat__title" :style="titleStyleObj">{{ resolveTitle(row) }}</p>
            <p class="base-stat__value-line">
              <span class="base-stat__value" :style="valueStyleObj">{{ resolveValue(row) }}</span>
              <span v-if="resolveUnit(row)" class="base-stat__unit" :style="unitStyleObj">{{ resolveUnit(row) }}</span>
            </p>
            <p v-if="resolveTrend(row)" class="base-stat__trend" :style="trendStyleObj">{{ resolveTrend(row) }}</p>
          </button>
        </div>

        <div v-else class="base-stat__empty">暂无数据</div>
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

  interface BaseStatSchema {
    content?: {
      container?: Partial<UnifiedContainerContentConfigModel>;
      dataSource?: Partial<PortalDataSourceModel>;
      stat?: {
        titleKey?: string;
        valueKey?: string;
        unitKey?: string;
        trendKey?: string;
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
      stat?: {
        columns?: number;
        gap?: number;
        cardPadding?: number;
        cardRadius?: number;
        cardBgColor?: string;
        cardBorderColor?: string;
        titleColor?: string;
        valueColor?: string;
        unitColor?: string;
        trendColor?: string;
        titleFontSize?: number;
        valueFontSize?: number;
        unitFontSize?: number;
        trendFontSize?: number;
      };
    };
  }

  const props = defineProps<{
    schema: BaseStatSchema;
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
  const styleConfig = computed(() => props.schema?.style?.stat || {});

  const statConfig = computed(() => {
    const raw = props.schema?.content?.stat || {};
    return {
      titleKey: String(raw.titleKey || 'title'),
      valueKey: String(raw.valueKey || 'value'),
      unitKey: String(raw.unitKey || 'unit'),
      trendKey: String(raw.trendKey || 'trend'),
      idKey: String(raw.idKey || 'id'),
      maxDisplayCount: Math.max(1, toPositiveNumber(raw.maxDisplayCount, 8)),
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

  const canRowNavigate = computed(() => Boolean(statConfig.value.link.path.trim()));

  const displayRows = computed(() => {
    return rows.value.slice(0, statConfig.value.maxDisplayCount);
  });

  const wrapperStyleObj = computed<CSSProperties>(() => ({
    width: '100%',
  }));

  const gridStyleObj = computed<CSSProperties>(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${Math.min(6, Math.max(1, Number(styleConfig.value.columns) || 4))}, minmax(0, 1fr))`,
    gap: `${toNonNegativeNumber(styleConfig.value.gap, 12)}px`,
  }));

  const cardStyleObj = computed<CSSProperties>(() => ({
    border: `1px solid ${styleConfig.value.cardBorderColor || '#e2e8f0'}`,
    borderRadius: `${toNonNegativeNumber(styleConfig.value.cardRadius, 10)}px`,
    background: styleConfig.value.cardBgColor || '#f8fafc',
    padding: `${toNonNegativeNumber(styleConfig.value.cardPadding, 12)}px`,
  }));

  const titleStyleObj = computed<CSSProperties>(() => ({
    color: styleConfig.value.titleColor || '#64748b',
    fontSize: `${Math.max(12, toPositiveNumber(styleConfig.value.titleFontSize, 12))}px`,
  }));

  const valueStyleObj = computed<CSSProperties>(() => ({
    color: styleConfig.value.valueColor || '#0f172a',
    fontSize: `${Math.max(14, toPositiveNumber(styleConfig.value.valueFontSize, 24))}px`,
  }));

  const unitStyleObj = computed<CSSProperties>(() => ({
    color: styleConfig.value.unitColor || '#334155',
    fontSize: `${Math.max(12, toPositiveNumber(styleConfig.value.unitFontSize, 12))}px`,
  }));

  const trendStyleObj = computed<CSSProperties>(() => ({
    color: styleConfig.value.trendColor || '#16a34a',
    fontSize: `${Math.max(12, toPositiveNumber(styleConfig.value.trendFontSize, 12))}px`,
  }));

  function resolveRowId(row: RowData, rowIndex: number): string {
    const value = resolveValueByPath(row, statConfig.value.idKey);
    if (value !== undefined && value !== null && `${value}`.trim()) {
      return String(value);
    }
    const fallback = resolveValueByPath(row, '__rowIndex');
    if (fallback !== undefined && fallback !== null && `${fallback}`.trim()) {
      return `stat-${fallback}`;
    }
    return `stat-${rowIndex + 1}`;
  }

  function resolveTitle(row: RowData): string {
    return String(resolveValueByPath(row, statConfig.value.titleKey) || '未命名指标');
  }

  function resolveValue(row: RowData): string {
    const value = resolveValueByPath(row, statConfig.value.valueKey);
    if (value === null || value === undefined || `${value}`.trim() === '') {
      return '--';
    }
    return String(value);
  }

  function resolveUnit(row: RowData): string {
    return String(resolveValueByPath(row, statConfig.value.unitKey) || '');
  }

  function resolveTrend(row: RowData): string {
    return String(resolveValueByPath(row, statConfig.value.trendKey) || '');
  }

  function handleRowClick(row: RowData) {
    if (!canRowNavigate.value) {
      return;
    }

    const valueKey = String(statConfig.value.link.valueKey || statConfig.value.idKey);
    const paramValue = resolveValueByPath(row, valueKey);
    const link = resolvePortalLink(statConfig.value.link, paramValue);

    openPortalLink({
      link,
      openType: statConfig.value.link.openType,
      routerPush: router ? (nextLink: string) => router!.push(nextLink) : null,
    });
  }

  async function loadRows() {
    requestController?.abort();
    requestController = new AbortController();

    loading.value = true;
    const result = await loadPortalDataSourceRows<RowData>(dataSource.value, {
      page: 1,
      pageSize: statConfig.value.maxDisplayCount,
      signal: requestController.signal,
    });

    if (requestController.signal.aborted) {
      return;
    }

    rows.value = result.rows;
    loading.value = false;
  }

  watch(
    () => [dataSource.value, statConfig.value.maxDisplayCount],
    () => {
      loadRows();
    },
    { deep: true, immediate: true }
  );

  onBeforeUnmount(() => {
    requestController?.abort();
  });

  defineOptions({
    name: 'base-stat-index',
  });
</script>

<style scoped>
  .base-stat {
    width: 100%;
  }

  .base-stat__card {
    display: flex;
    width: 100%;
    min-height: 110px;
    text-align: left;
    border: none;
    cursor: default;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
  }

  .base-stat__card.is-clickable {
    cursor: pointer;
  }

  .base-stat__title,
  .base-stat__value-line,
  .base-stat__trend {
    margin: 0;
    line-height: 1.4;
    word-break: break-word;
  }

  .base-stat__value-line {
    display: flex;
    align-items: flex-end;
    gap: 6px;
  }

  .base-stat__value {
    line-height: 1;
    font-weight: 600;
  }

  .base-stat__unit {
    line-height: 1.25;
  }

  .base-stat__empty {
    color: #94a3b8;
    font-size: 12px;
    line-height: 1.4;
  }

  @media (max-width: 768px) {
    .base-stat__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
  }
</style>
