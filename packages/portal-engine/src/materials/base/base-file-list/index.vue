<template>
  <UnifiedContainerDisplay :content="containerContentConfig" :style="containerStyleConfig">
    <div class="base-file-list" :style="wrapperStyleObj">
      <el-skeleton v-if="loading" :rows="4" animated />

      <template v-else>
        <div v-if="displayRows.length" class="base-file-list__rows" :style="rowsStyleObj">
          <div
            v-for="(row, rowIndex) in displayRows"
            :key="resolveRowId(row, rowIndex)"
            class="base-file-list__row"
            :class="{ 'is-last': rowIndex === displayRows.length - 1 }"
            :style="rowStyleObj"
          >
            <div class="base-file-list__main">
              <MenuIcon v-if="fileConfig.showIcon" icon="ri:file-3-line" class="base-file-list__icon" :style="iconStyleObj" />

              <div class="base-file-list__text">
                <button
                  v-if="canNavigate(row)"
                  class="base-file-list__name base-file-list__name--link"
                  :style="nameStyleObj"
                  type="button"
                  @click="handleNameClick(row)"
                >
                  {{ resolveName(row) }}
                </button>
                <span v-else class="base-file-list__name" :style="nameStyleObj">{{ resolveName(row) }}</span>

                <p class="base-file-list__meta" :style="metaStyleObj">{{ resolveMeta(row) }}</p>
              </div>
            </div>

            <el-button v-if="resolveUrl(row)" text type="primary" :style="downloadStyleObj" @click="handleDownload(row)">下载</el-button>
          </div>
        </div>

        <div v-else class="base-file-list__empty">暂无文件</div>

        <div v-if="showPagination" class="base-file-list__pagination" :style="paginationStyleObj">
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
  import { MenuIcon } from '@one-base-template/ui';
  import { UnifiedContainerDisplay } from '../../common/unified-container';
  import type {
    UnifiedContainerContentConfigModel,
    UnifiedContainerStyleConfigModel,
  } from '../../common/unified-container';
  import { loadPortalDataSourceRows, mergePortalDataSourceModel, type PortalDataSourceModel } from '../common/portal-data-source';
  import { mergePortalLinkConfig, openPortalLink, resolvePortalLink, type PortalLinkConfig } from '../common/portal-link';
  import { normalizeImageSource, resolveValueByPath, toNonNegativeNumber, toPositiveNumber } from '../common/material-utils';

  type PaginationAlignType = 'left' | 'center' | 'right';
  type RowData = Record<string, unknown>;

  interface BaseFileListSchema {
    content?: {
      container?: Partial<UnifiedContainerContentConfigModel>;
      dataSource?: Partial<PortalDataSourceModel>;
      file?: {
        nameKey?: string;
        sizeKey?: string;
        timeKey?: string;
        urlKey?: string;
        idKey?: string;
        showIcon?: boolean;
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
      file?: {
        rowGap?: number;
        rowPaddingY?: number;
        dividerColor?: string;
        nameColor?: string;
        metaColor?: string;
        linkColor?: string;
        iconColor?: string;
        nameFontSize?: number;
        metaFontSize?: number;
        paginationAlign?: PaginationAlignType;
        paginationTopGap?: number;
      };
    };
  }

  const props = defineProps<{
    schema: BaseFileListSchema;
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
  const currentPageSize = ref(8);
  let requestController: AbortController | null = null;

  const containerContentConfig = computed(() => props.schema?.content?.container);
  const containerStyleConfig = computed(() => props.schema?.style?.container);
  const dataSource = computed(() => mergePortalDataSourceModel(props.schema?.content?.dataSource));
  const styleConfig = computed(() => props.schema?.style?.file || {});

  const fileConfig = computed(() => {
    const raw = props.schema?.content?.file || {};
    return {
      nameKey: String(raw.nameKey || 'name'),
      sizeKey: String(raw.sizeKey || 'size'),
      timeKey: String(raw.timeKey || 'publishTime'),
      urlKey: String(raw.urlKey || 'url'),
      idKey: String(raw.idKey || 'id'),
      showIcon: raw.showIcon !== false,
      pageSize: Math.max(1, toPositiveNumber(raw.pageSize, 8)),
      showPagination: raw.showPagination !== false,
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

  const showPagination = computed(() => fileConfig.value.showPagination);

  watch(
    () => fileConfig.value.pageSize,
    (value) => {
      currentPageSize.value = Math.max(1, toPositiveNumber(value, 8));
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

  const rowsStyleObj = computed<CSSProperties>(() => ({
    display: 'flex',
    flexDirection: 'column',
    gap: `${toNonNegativeNumber(styleConfig.value.rowGap, 8)}px`,
  }));

  const rowStyleObj = computed<CSSProperties>(() => ({
    paddingTop: `${toNonNegativeNumber(styleConfig.value.rowPaddingY, 10)}px`,
    paddingBottom: `${toNonNegativeNumber(styleConfig.value.rowPaddingY, 10)}px`,
    borderBottom: `1px solid ${styleConfig.value.dividerColor || '#e2e8f0'}`,
  }));

  const iconStyleObj = computed<CSSProperties>(() => ({
    color: styleConfig.value.iconColor || '#0ea5e9',
    fontSize: '18px',
  }));

  const nameStyleObj = computed<CSSProperties>(() => ({
    color: styleConfig.value.nameColor || '#0f172a',
    fontSize: `${Math.max(12, toPositiveNumber(styleConfig.value.nameFontSize, 14))}px`,
  }));

  const metaStyleObj = computed<CSSProperties>(() => ({
    color: styleConfig.value.metaColor || '#64748b',
    fontSize: `${Math.max(12, toPositiveNumber(styleConfig.value.metaFontSize, 12))}px`,
  }));

  const downloadStyleObj = computed<CSSProperties>(() => ({
    color: styleConfig.value.linkColor || '#2563eb',
  }));

  const paginationStyleObj = computed<CSSProperties>(() => ({
    justifyContent: resolveJustifyContent(styleConfig.value.paginationAlign),
    marginTop: `${toNonNegativeNumber(styleConfig.value.paginationTopGap, 10)}px`,
  }));

  function resolveJustifyContent(align: unknown): CSSProperties['justifyContent'] {
    if (align === 'left') {
      return 'flex-start';
    }
    if (align === 'center') {
      return 'center';
    }
    return 'flex-end';
  }

  function resolveRowId(row: RowData, rowIndex: number): string {
    const value = resolveValueByPath(row, fileConfig.value.idKey);
    if (value !== undefined && value !== null && `${value}`.trim()) {
      return String(value);
    }
    const fallback = resolveValueByPath(row, '__rowIndex');
    if (fallback !== undefined && fallback !== null && `${fallback}`.trim()) {
      return `file-${fallback}`;
    }
    return `file-${rowIndex + 1}`;
  }

  function resolveName(row: RowData): string {
    return String(resolveValueByPath(row, fileConfig.value.nameKey) || '未命名文件');
  }

  function resolveSize(row: RowData): string {
    return String(resolveValueByPath(row, fileConfig.value.sizeKey) || '');
  }

  function resolveTime(row: RowData): string {
    return String(resolveValueByPath(row, fileConfig.value.timeKey) || '');
  }

  function resolveUrl(row: RowData): string {
    return normalizeImageSource(resolveValueByPath(row, fileConfig.value.urlKey));
  }

  function resolveMeta(row: RowData): string {
    const size = resolveSize(row);
    const time = resolveTime(row);
    if (size && time) {
      return `${size} · ${time}`;
    }
    return size || time || '';
  }

  function resolveDetailLink(row: RowData): string {
    const path = fileConfig.value.link.path.trim();
    if (!path) {
      return '';
    }

    const valueKey = String(fileConfig.value.link.valueKey || fileConfig.value.idKey);
    const paramValue = resolveValueByPath(row, valueKey);
    return resolvePortalLink(fileConfig.value.link, paramValue);
  }

  function canNavigate(row: RowData): boolean {
    return Boolean(resolveDetailLink(row) || resolveUrl(row));
  }

  function handleNameClick(row: RowData) {
    const detailLink = resolveDetailLink(row);
    if (detailLink) {
      openPortalLink({
        link: detailLink,
        openType: fileConfig.value.link.openType,
        routerPush: router ? (nextLink: string) => router!.push(nextLink) : null,
      });
      return;
    }

    const fileUrl = resolveUrl(row);
    if (!fileUrl) {
      return;
    }

    openPortalLink({
      link: fileUrl,
      openType: 'newTab',
      routerPush: router ? (nextLink: string) => router!.push(nextLink) : null,
    });
  }

  function handleDownload(row: RowData) {
    const fileUrl = resolveUrl(row);
    if (!fileUrl) {
      return;
    }

    openPortalLink({
      link: fileUrl,
      openType: 'newTab',
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
    name: 'base-file-list-index',
  });
</script>

<style scoped>
  .base-file-list {
    width: 100%;
  }

  .base-file-list__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .base-file-list__row.is-last {
    border-bottom-color: transparent;
  }

  .base-file-list__main {
    display: flex;
    align-items: flex-start;
    min-width: 0;
    gap: 10px;
    flex: 1;
  }

  .base-file-list__icon {
    margin-top: 2px;
    flex-shrink: 0;
  }

  .base-file-list__text {
    min-width: 0;
    flex: 1;
  }

  .base-file-list__name {
    margin: 0;
    display: inline-block;
    line-height: 1.4;
    word-break: break-word;
  }

  .base-file-list__name--link {
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
    text-align: left;
  }

  .base-file-list__meta {
    margin: 4px 0 0;
    line-height: 1.4;
    word-break: break-word;
  }

  .base-file-list__empty {
    color: #94a3b8;
    font-size: 12px;
    line-height: 1.4;
  }

  .base-file-list__pagination {
    display: flex;
  }
</style>
