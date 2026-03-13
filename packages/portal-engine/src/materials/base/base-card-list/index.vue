<template>
  <UnifiedContainerDisplay :content="containerContentConfig" :style="containerStyleConfig">
    <div class="base-card-list" :style="wrapperStyleObj">
      <el-skeleton v-if="loading" :rows="4" animated />

      <template v-else>
        <div class="base-card-list__grid" :style="gridStyleObj">
          <button
            v-for="(row, rowIndex) in displayRows"
            :key="resolveRowId(row, rowIndex)"
            class="base-card-list__item"
            :style="itemStyleObj"
            type="button"
            @click="handleRowClick(row)"
          >
            <img v-if="resolveImage(row)" class="base-card-list__image" :src="resolveImage(row)" alt="card-cover" :style="imageStyleObj" />
            <div v-else class="base-card-list__image base-card-list__image--placeholder" :style="imageStyleObj">无图片</div>

            <h4 class="base-card-list__title" :style="titleStyleObj">{{ resolveTitle(row) }}</h4>
            <p class="base-card-list__description" :style="descriptionStyleObj">{{ resolveDescription(row) }}</p>
            <p class="base-card-list__date" :style="dateStyleObj">{{ resolveDate(row) }}</p>
          </button>
        </div>

        <div v-if="showPagination" class="base-card-list__pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="currentPageSize"
            layout="total, prev, pager, next"
            :total="total"
          />
        </div>
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
  import { normalizeImageSource, resolveValueByPath, toNonNegativeNumber, toPositiveNumber } from '../common/material-utils';

  type RowData = Record<string, unknown>;

  interface BaseCardListSchema {
    content?: {
      container?: Partial<UnifiedContainerContentConfigModel>;
      dataSource?: Partial<PortalDataSourceModel>;
      list?: {
        titleKey?: string;
        descriptionKey?: string;
        imageKey?: string;
        dateKey?: string;
        idKey?: string;
        pageSize?: number;
        showPagination?: boolean;
        linkPath?: string;
        linkParamKey?: string;
        linkValueKey?: string;
        openType?: PortalLinkConfig['openType'];
        link?: Partial<PortalLinkConfig>;
      };
    };
    style?: {
      container?: Partial<UnifiedContainerStyleConfigModel>;
      list?: {
        columns?: number;
        gap?: number;
        cardPadding?: number;
        cardRadius?: number;
        cardBorderColor?: string;
        cardBgColor?: string;
        imageHeight?: number;
        titleColor?: string;
        descriptionColor?: string;
        dateColor?: string;
        titleFontSize?: number;
        descriptionFontSize?: number;
        dateFontSize?: number;
      };
    };
  }

  const props = defineProps<{
    schema: BaseCardListSchema;
  }>();

  let router: ReturnType<typeof useRouter> | null = null;
  try {
    router = useRouter();
  } catch {
    router = null;
  }

  const loading = ref(false);
  const rows = ref<RowData[]>([]);
  const total = ref(0);
  const currentPage = ref(1);
  const currentPageSize = ref(6);
  let requestController: AbortController | null = null;

  const containerContentConfig = computed(() => props.schema?.content?.container);
  const containerStyleConfig = computed(() => props.schema?.style?.container);
  const dataSource = computed(() => mergePortalDataSourceModel(props.schema?.content?.dataSource));
  const listConfig = computed(() => props.schema?.content?.list || {});
  const listStyle = computed(() => props.schema?.style?.list || {});

  const showPagination = computed(() => listConfig.value.showPagination !== false);

  const normalizedListConfig = computed(() => ({
    titleKey: String(listConfig.value.titleKey || 'title'),
    descriptionKey: String(listConfig.value.descriptionKey || 'description'),
    imageKey: String(listConfig.value.imageKey || 'cover'),
    dateKey: String(listConfig.value.dateKey || 'publishTime'),
    idKey: String(listConfig.value.idKey || 'id'),
    link: mergePortalLinkConfig(
      listConfig.value.link || {
        path: listConfig.value.linkPath,
        paramKey: listConfig.value.linkParamKey,
        valueKey: listConfig.value.linkValueKey,
        openType: listConfig.value.openType,
      }
    ),
  }));

  watch(
    () => listConfig.value.pageSize,
    (value) => {
      currentPageSize.value = Math.max(1, toPositiveNumber(value, 6));
    },
    { immediate: true }
  );

  const displayRows = computed(() => {
    if (dataSource.value.mode === 'api') {
      return rows.value;
    }

    if (!showPagination.value) {
      return rows.value;
    }

    const start = (currentPage.value - 1) * currentPageSize.value;
    return rows.value.slice(start, start + currentPageSize.value);
  });

  const wrapperStyleObj = computed<CSSProperties>(() => ({
    width: '100%',
  }));

  const gridStyleObj = computed<CSSProperties>(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${Math.min(4, Math.max(1, Number(listStyle.value.columns) || 3))}, minmax(0, 1fr))`,
    gap: `${toNonNegativeNumber(listStyle.value.gap, 12)}px`,
  }));

  const itemStyleObj = computed<CSSProperties>(() => ({
    border: `1px solid ${listStyle.value.cardBorderColor || '#e2e8f0'}`,
    borderRadius: `${toNonNegativeNumber(listStyle.value.cardRadius, 10)}px`,
    background: listStyle.value.cardBgColor || '#ffffff',
    padding: `${toNonNegativeNumber(listStyle.value.cardPadding, 12)}px`,
  }));

  const imageStyleObj = computed<CSSProperties>(() => ({
    height: `${Math.max(60, toPositiveNumber(listStyle.value.imageHeight, 120))}px`,
  }));

  const titleStyleObj = computed<CSSProperties>(() => ({
    color: listStyle.value.titleColor || '#0f172a',
    fontSize: `${Math.max(12, toPositiveNumber(listStyle.value.titleFontSize, 14))}px`,
  }));

  const descriptionStyleObj = computed<CSSProperties>(() => ({
    color: listStyle.value.descriptionColor || '#64748b',
    fontSize: `${Math.max(12, toPositiveNumber(listStyle.value.descriptionFontSize, 12))}px`,
  }));

  const dateStyleObj = computed<CSSProperties>(() => ({
    color: listStyle.value.dateColor || '#94a3b8',
    fontSize: `${Math.max(12, toPositiveNumber(listStyle.value.dateFontSize, 12))}px`,
  }));

  function resolveRowId(row: RowData, rowIndex: number): string {
    const value = resolveValueByPath(row, normalizedListConfig.value.idKey);
    if (value !== undefined && value !== null && `${value}`.trim()) {
      return String(value);
    }
    const fallback = resolveValueByPath(row, '__rowIndex');
    if (fallback !== undefined && fallback !== null && `${fallback}`.trim()) {
      return `card-${fallback}`;
    }
    return `card-${rowIndex + 1}`;
  }

  function resolveTitle(row: RowData): string {
    return String(resolveValueByPath(row, normalizedListConfig.value.titleKey) || '未命名卡片');
  }

  function resolveDescription(row: RowData): string {
    return String(resolveValueByPath(row, normalizedListConfig.value.descriptionKey) || '');
  }

  function resolveDate(row: RowData): string {
    return String(resolveValueByPath(row, normalizedListConfig.value.dateKey) || '');
  }

  function resolveImage(row: RowData): string {
    return normalizeImageSource(resolveValueByPath(row, normalizedListConfig.value.imageKey));
  }

  function handleRowClick(row: RowData) {
    const valueKey = String(normalizedListConfig.value.link.valueKey || normalizedListConfig.value.idKey);
    const paramValue = resolveValueByPath(row, valueKey);
    const link = resolvePortalLink(normalizedListConfig.value.link, paramValue);
    openPortalLink({
      link,
      openType: normalizedListConfig.value.link.openType,
      routerPush: router ? (nextLink: string) => router!.push(nextLink) : null,
    });
  }

  async function loadRows() {
    requestController?.abort();
    requestController = new AbortController();

    loading.value = true;
    const result = await loadPortalDataSourceRows<RowData>(dataSource.value, {
      page: currentPage.value,
      pageSize: currentPageSize.value,
      signal: requestController.signal,
    });

    if (requestController.signal.aborted) {
      return;
    }

    rows.value = result.rows;
    total.value = result.total;
    loading.value = false;
  }

  watch(
    () => [dataSource.value, currentPage.value, currentPageSize.value, showPagination.value],
    () => {
      loadRows();
    },
    { deep: true, immediate: true }
  );

  onBeforeUnmount(() => {
    requestController?.abort();
  });

  defineOptions({
    name: 'base-card-list-index',
  });
</script>

<style scoped>
  .base-card-list {
    width: 100%;
  }

  .base-card-list__item {
    display: flex;
    width: 100%;
    border: none;
    text-align: left;
    cursor: pointer;
    flex-direction: column;
    gap: 8px;
  }

  .base-card-list__image {
    width: 100%;
    object-fit: cover;
    border-radius: 8px;
    background: #f8fafc;
  }

  .base-card-list__image--placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    font-size: 12px;
  }

  .base-card-list__title,
  .base-card-list__description,
  .base-card-list__date {
    margin: 0;
    line-height: 1.5;
    word-break: break-word;
  }

  .base-card-list__pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
  }

  @media (max-width: 768px) {
    .base-card-list__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
  }
</style>
