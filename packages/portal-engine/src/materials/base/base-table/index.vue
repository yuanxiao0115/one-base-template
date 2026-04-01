<template>
  <UnifiedContainerDisplay :content="containerContentConfig" :style="containerStyleConfig">
    <div class="base-table" :style="tableCssVars">
      <div v-if="isApiMode" class="base-table__toolbar">
        <span v-if="requestError" class="base-table__error">{{ requestError }}</span>
        <el-button text type="primary" :loading="loading" @click="manualReload">刷新数据</el-button>
      </div>

      <el-table
        v-loading="loading"
        class="base-table__table"
        :class="{ 'without-row-divider': !showRowDivider }"
        :data="displayRows"
        :show-header="showHeader"
        :empty-text="emptyText"
        :header-cell-style="headerCellStyle"
        :cell-style="bodyCellStyle"
        v-bind="resolvedTableProps"
      >
        <el-table-column
          v-for="column in normalizedColumns"
          :key="column.id"
          :label="column.label"
          :prop="column.fieldKey"
          :align="column.align"
          :width="column.width > 0 ? column.width : undefined"
          :show-overflow-tooltip="column.ellipsis"
        >
          <template #default="scope">
            <div class="base-table__cell" :class="{ 'is-link': isColumnLinkEnabled(column) }">
              <span v-if="shouldShowDot(scope.row, column)" class="base-table__dot" />

              <button
                v-if="isColumnLinkEnabled(column) && !column.showTag"
                class="base-table__link"
                type="button"
                @click="handleCellLinkClick(scope.row, column)"
              >
                {{ formatCellValue(scope.row, column.fieldKey) }}
              </button>

              <span
                v-else-if="column.showTag"
                class="base-table__tag"
                :style="resolveTagStyle(scope.row, column)"
              >
                {{ formatCellValue(scope.row, column.fieldKey) }}
              </span>

              <span v-else>{{ formatCellValue(scope.row, column.fieldKey) }}</span>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="showPagination" class="base-table__pagination" :style="paginationStyleObj">
        <el-config-provider :locale="zhCnLocale">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="currentPageSize"
            layout="total, sizes, prev, pager, next"
            prev-text="上一页"
            next-text="下一页"
            :page-sizes="pageSizes"
            :total="total"
          />
        </el-config-provider>
      </div>
    </div>
  </UnifiedContainerDisplay>
</template>

<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import { computed, onBeforeUnmount, ref, watch, type CSSProperties } from 'vue';
import { useRouter } from 'vue-router';
import { UnifiedContainerDisplay } from '../../common/unified-container';
import type {
  UnifiedContainerContentConfigModel,
  UnifiedContainerStyleConfigModel
} from '../../common/unified-container';
import {
  appendQueryToUrl,
  parseJsonArray,
  parseJsonObject,
  resolveValueByPath,
  toNonNegativeNumber,
  toPositiveNumber
} from '../common/material-utils';

type DataModeType = 'static' | 'api';
type HttpMethodType = 'GET' | 'POST' | 'PUT' | 'PATCH';
type ColumnAlignType = 'left' | 'center' | 'right';
type LinkOpenType = 'router' | 'newTab' | 'current';
type PaginationAlignType = 'left' | 'center' | 'right';

interface TableColumnModel {
  id: string;
  label: string;
  fieldKey: string;
  width: number;
  align: ColumnAlignType;
  ellipsis: boolean;
  isLink: boolean;
  linkPath: string;
  linkParamKey: string;
  linkValueKey: string;
  openType: LinkOpenType;
  showTag: boolean;
  tagBgColor: string;
  tagTextColor: string;
  tagBgColorFieldKey: string;
  tagTextColorFieldKey: string;
  showDot: boolean;
  dotFieldKey: string;
  dotTruthyValue: string;
}

interface BaseTableSchema {
  content?: {
    container?: Partial<UnifiedContainerContentConfigModel>;
    dataSource?: {
      mode?: DataModeType;
      staticRowsJson?: string;
      method?: HttpMethodType;
      apiUrl?: string;
      headersJson?: string;
      queryJson?: string;
      bodyJson?: string;
      listPath?: string;
      totalPath?: string;
      successPath?: string;
      successValue?: string;
      pageParamKey?: string;
      pageSizeParamKey?: string;
    };
    table?: {
      showHeader?: boolean;
      showPagination?: boolean;
      showRowDivider?: boolean;
      showDot?: boolean;
      dotFieldKey?: string;
      dotTruthyValue?: string;
      pageSize?: number;
      pageSizes?: number[];
      emptyText?: string;
      tablePropsJson?: string;
      columns?: TableColumnModel[];
    };
  };
  style?: {
    container?: Partial<UnifiedContainerStyleConfigModel>;
    table?: {
      headerBgColor?: string;
      headerTextColor?: string;
      headerFontSize?: number;
      headerHeight?: number;
      headerRadius?: number;
      rowTextColor?: string;
      rowFontSize?: number;
      rowHeight?: number;
      rowHoverBgColor?: string;
      dividerColor?: string;
      linkColor?: string;
      dotColor?: string;
      dotSize?: number;
      paginationAlign?: PaginationAlignType;
      paginationTopGap?: number;
    };
  };
}

type TableRow = Record<string, unknown>;

let router: ReturnType<typeof useRouter> | null = null;
try {
  router = useRouter();
} catch {
  router = null;
}

const props = defineProps<{
  schema: BaseTableSchema;
}>();

const loading = ref(false);
const requestError = ref('');
const apiRows = ref<TableRow[]>([]);
const apiTotal = ref(0);
const currentPage = ref(1);
const currentPageSize = ref(10);
const zhCnLocale = zhCn;

let reloadTimer: ReturnType<typeof setTimeout> | undefined;

const containerContentConfig = computed(() => props.schema?.content?.container);
const containerStyleConfig = computed(() => props.schema?.style?.container);

const dataSourceConfig = computed(() => props.schema?.content?.dataSource || {});
const tableConfig = computed(() => props.schema?.content?.table || {});
const tableStyleConfig = computed(() => props.schema?.style?.table || {});

const normalizedColumns = computed<TableColumnModel[]>(() => {
  const columns = Array.isArray(tableConfig.value.columns) ? tableConfig.value.columns : [];
  return columns.map((item, index) => ({
    id: String(item.id || `column-${index + 1}`),
    label: String(item.label || `列${index + 1}`),
    fieldKey: String(item.fieldKey || ''),
    width: Number.isFinite(Number(item.width)) ? Number(item.width) : 0,
    align: item.align === 'center' || item.align === 'right' ? item.align : 'left',
    ellipsis: item.ellipsis !== false,
    isLink: item.isLink === true,
    linkPath: String(item.linkPath || ''),
    linkParamKey: String(item.linkParamKey || 'id'),
    linkValueKey: String(item.linkValueKey || item.fieldKey || 'id'),
    openType: item.openType === 'newTab' || item.openType === 'current' ? item.openType : 'router',
    showTag: item.showTag === true,
    tagBgColor: String(item.tagBgColor || '#dbeafe'),
    tagTextColor: String(item.tagTextColor || '#1d4ed8'),
    tagBgColorFieldKey: String(item.tagBgColorFieldKey || ''),
    tagTextColorFieldKey: String(item.tagTextColorFieldKey || ''),
    showDot: item.showDot === true,
    dotFieldKey: String(item.dotFieldKey || ''),
    dotTruthyValue: String(item.dotTruthyValue || '')
  }));
});

const isApiMode = computed(() => dataSourceConfig.value.mode === 'api');
const showHeader = computed(() => tableConfig.value.showHeader !== false);
const showPagination = computed(() => tableConfig.value.showPagination !== false);
const showRowDivider = computed(() => tableConfig.value.showRowDivider !== false);

const emptyText = computed(() => {
  const value = String(tableConfig.value.emptyText || '').trim();
  return value || '暂无数据';
});

const pageSizes = computed(() => {
  const values = Array.isArray(tableConfig.value.pageSizes)
    ? tableConfig.value.pageSizes
        .map((item) => Math.floor(Number(item)))
        .filter((item) => Number.isFinite(item) && item > 0)
    : [];
  return values.length ? values : [10, 20, 50];
});

const staticRows = computed<TableRow[]>(() => {
  const rows = parseJsonArray<unknown>(dataSourceConfig.value.staticRowsJson);
  return rows
    .map((item, index) => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        return item as TableRow;
      }
      return {
        value: item,
        __rowIndex: index
      } satisfies TableRow;
    })
    .filter(Boolean);
});

const total = computed(() => {
  if (isApiMode.value) {
    return Math.max(0, Number(apiTotal.value) || 0);
  }
  return staticRows.value.length;
});

const displayRows = computed<TableRow[]>(() => {
  if (isApiMode.value) {
    return apiRows.value;
  }

  if (!showPagination.value) {
    return staticRows.value;
  }

  const start = (currentPage.value - 1) * currentPageSize.value;
  return staticRows.value.slice(start, start + currentPageSize.value);
});

const resolvedTableProps = computed<Record<string, unknown>>(() =>
  parseJsonObject(tableConfig.value.tablePropsJson)
);

const tableCssVars = computed<CSSProperties>(
  () =>
    ({
      '--base-table-header-bg': tableStyleConfig.value.headerBgColor || '#f8fafc',
      '--base-table-header-color': tableStyleConfig.value.headerTextColor || '#334155',
      '--base-table-header-font-size': `${Math.max(12, toPositiveNumber(tableStyleConfig.value.headerFontSize, 14))}px`,
      '--base-table-header-height': `${Math.max(24, toPositiveNumber(tableStyleConfig.value.headerHeight, 56))}px`,
      '--base-table-header-radius': `${toNonNegativeNumber(tableStyleConfig.value.headerRadius, 8)}px`,
      '--base-table-row-color': tableStyleConfig.value.rowTextColor || '#334155',
      '--base-table-row-font-size': `${Math.max(12, toPositiveNumber(tableStyleConfig.value.rowFontSize, 14))}px`,
      '--base-table-row-height': `${Math.max(24, toPositiveNumber(tableStyleConfig.value.rowHeight, 56))}px`,
      '--base-table-row-hover-bg': tableStyleConfig.value.rowHoverBgColor || '#f8fafc',
      '--base-table-divider-color': tableStyleConfig.value.dividerColor || '#e2e8f0',
      '--base-table-link-color': tableStyleConfig.value.linkColor || '#2563eb',
      '--base-table-dot-color': tableStyleConfig.value.dotColor || '#2563eb',
      '--base-table-dot-size': `${Math.max(4, toPositiveNumber(tableStyleConfig.value.dotSize, 6))}px`
    }) as CSSProperties
);

const paginationStyleObj = computed<CSSProperties>(() => ({
  justifyContent: tableStyleConfig.value.paginationAlign || 'right',
  marginTop: `${toNonNegativeNumber(tableStyleConfig.value.paginationTopGap, 12)}px`
}));

function headerCellStyle() {
  return {
    background: 'var(--base-table-header-bg)',
    color: 'var(--base-table-header-color)',
    fontSize: 'var(--base-table-header-font-size)',
    height: 'var(--base-table-header-height)',
    lineHeight: 'var(--base-table-header-height)',
    fontWeight: 600
  };
}

function bodyCellStyle() {
  return {
    color: 'var(--base-table-row-color)',
    fontSize: 'var(--base-table-row-font-size)',
    height: 'var(--base-table-row-height)',
    lineHeight: 'var(--base-table-row-height)',
    borderColor: showRowDivider.value ? 'var(--base-table-divider-color)' : 'transparent'
  };
}

function resolveTagStyle(row: TableRow, column: TableColumnModel): CSSProperties {
  const defaultTagBgColor = '#dbeafe';
  const defaultTagTextColor = '#1d4ed8';
  const bgColorFieldKey = String(column.tagBgColorFieldKey || '').trim();
  const textColorFieldKey = String(column.tagTextColorFieldKey || '').trim();
  const bgColorByField = bgColorFieldKey ? resolveValueByPath(row, bgColorFieldKey) : '';
  const textColorByField = textColorFieldKey ? resolveValueByPath(row, textColorFieldKey) : '';
  return {
    backgroundColor:
      typeof bgColorByField === 'string' && bgColorByField.trim()
        ? bgColorByField
        : column.tagBgColor || defaultTagBgColor,
    color:
      typeof textColorByField === 'string' && textColorByField.trim()
        ? textColorByField
        : column.tagTextColor || defaultTagTextColor
  };
}

function resolveCellValue(row: TableRow, fieldKey: string) {
  if (!fieldKey) {
    return '';
  }
  return resolveValueByPath(row, fieldKey);
}

function formatCellValue(row: TableRow, fieldKey: string) {
  const value = resolveCellValue(row, fieldKey);
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

function isColumnLinkEnabled(column: TableColumnModel): boolean {
  return column.isLink === true && String(column.linkPath || '').trim().length > 0;
}

function resolveCellLink(row: TableRow, column: TableColumnModel): string {
  if (!isColumnLinkEnabled(column)) {
    return '';
  }

  const paramKey = String(column.linkParamKey || '').trim() || 'id';
  const valueKey = String(column.linkValueKey || '').trim() || column.fieldKey;
  const paramValue = resolveCellValue(row, valueKey);
  const path = String(column.linkPath || '').trim();

  return appendQueryToUrl(path, {
    [paramKey]: paramValue
  });
}

function handleCellLinkClick(row: TableRow, column: TableColumnModel) {
  const link = resolveCellLink(row, column);
  if (!link) {
    return;
  }

  if (/^https?:\/\//.test(link)) {
    if (column.openType === 'current') {
      window.location.href = link;
      return;
    }
    window.open(link, '_blank', 'noopener,noreferrer');
    return;
  }

  if (column.openType === 'newTab') {
    window.open(link, '_blank', 'noopener,noreferrer');
    return;
  }

  if (column.openType === 'current') {
    window.location.href = link;
    return;
  }

  if (router) {
    router.push(link).catch(() => {
      window.location.href = link;
    });
    return;
  }

  window.location.href = link;
}

function shouldShowDot(row: TableRow, column: TableColumnModel): boolean {
  const globalEnabled = tableConfig.value.showDot === true;
  const columnEnabled = column.showDot === true;
  if (!globalEnabled && !columnEnabled) {
    return false;
  }

  const fieldKey = (column.dotFieldKey || tableConfig.value.dotFieldKey || '').trim();
  const expected = String(column.dotTruthyValue || tableConfig.value.dotTruthyValue || '').trim();

  if (!fieldKey) {
    return true;
  }

  const fieldValue = resolveValueByPath(row, fieldKey);
  if (!expected) {
    return Boolean(fieldValue);
  }
  return String(fieldValue) === expected;
}

function getRequestMethod(): HttpMethodType {
  const method = String(dataSourceConfig.value.method || 'GET').toUpperCase();
  return method === 'POST' || method === 'PUT' || method === 'PATCH' ? method : 'GET';
}

function buildHeaders(baseHeaders: Record<string, unknown>, hasJsonBody: boolean) {
  const headers: Record<string, string> = {};
  Object.entries(baseHeaders).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }
    headers[key] = String(value);
  });

  if (hasJsonBody && !Object.keys(headers).some((key) => key.toLowerCase() === 'content-type')) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}

async function loadApiRows() {
  const apiUrl = String(dataSourceConfig.value.apiUrl || '').trim();
  if (!apiUrl) {
    apiRows.value = [];
    apiTotal.value = 0;
    requestError.value = '未配置接口地址';
    return;
  }

  loading.value = true;
  requestError.value = '';

  try {
    const method = getRequestMethod();
    const queryObject = parseJsonObject(dataSourceConfig.value.queryJson);
    const bodyObject = parseJsonObject(dataSourceConfig.value.bodyJson);
    const headersObject = parseJsonObject(dataSourceConfig.value.headersJson);
    const pageParamKey = String(dataSourceConfig.value.pageParamKey || '').trim() || 'currentPage';
    const pageSizeParamKey =
      String(dataSourceConfig.value.pageSizeParamKey || '').trim() || 'pageSize';

    const queryPayload: Record<string, unknown> = {
      ...queryObject
    };
    const bodyPayload: Record<string, unknown> = {
      ...bodyObject
    };

    if (showPagination.value) {
      if (method === 'GET') {
        queryPayload[pageParamKey] = currentPage.value;
        queryPayload[pageSizeParamKey] = currentPageSize.value;
      } else {
        bodyPayload[pageParamKey] = currentPage.value;
        bodyPayload[pageSizeParamKey] = currentPageSize.value;
      }
    }

    const requestUrl = appendQueryToUrl(apiUrl, queryPayload);
    const hasJsonBody = method !== 'GET';
    const response = await fetch(requestUrl, {
      method,
      headers: buildHeaders(headersObject, hasJsonBody),
      body: hasJsonBody ? JSON.stringify(bodyPayload) : undefined,
      credentials: 'include'
    });

    const responseText = await response.text();
    let responsePayload: unknown = responseText;
    try {
      responsePayload = responseText ? (JSON.parse(responseText) as unknown) : {};
    } catch {
      responsePayload = responseText;
    }

    if (!response.ok) {
      throw new Error(`接口请求失败（HTTP ${response.status}）`);
    }

    const successPath = String(dataSourceConfig.value.successPath || '').trim();
    const successValue = String(dataSourceConfig.value.successValue || '').trim();
    if (successPath && successValue) {
      const actualSuccess = resolveValueByPath(responsePayload, successPath);
      if (String(actualSuccess) !== successValue) {
        throw new Error(`接口返回未通过成功校验：${successPath}=${String(actualSuccess)}`);
      }
    }

    const listPath = String(dataSourceConfig.value.listPath || '').trim();
    const listValue = listPath ? resolveValueByPath(responsePayload, listPath) : responsePayload;
    const listRows = Array.isArray(listValue) ? listValue : [];

    apiRows.value = listRows
      .map((item, index) => {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          return item as TableRow;
        }
        return {
          value: item,
          __rowIndex: index
        } satisfies TableRow;
      })
      .filter(Boolean);

    const totalPath = String(dataSourceConfig.value.totalPath || '').trim();
    const totalValue = totalPath
      ? resolveValueByPath(responsePayload, totalPath)
      : apiRows.value.length;
    const parsedTotal = Number(totalValue);
    apiTotal.value = Number.isFinite(parsedTotal) ? parsedTotal : apiRows.value.length;
  } catch (error) {
    apiRows.value = [];
    apiTotal.value = 0;
    requestError.value = error instanceof Error ? error.message : '接口数据加载失败';
  } finally {
    loading.value = false;
  }
}

function scheduleApiReload() {
  if (!isApiMode.value) {
    return;
  }
  if (reloadTimer) {
    clearTimeout(reloadTimer);
  }
  reloadTimer = setTimeout(() => {
    loadApiRows();
  }, 250);
}

function manualReload() {
  loadApiRows();
}

const reloadDependency = computed(() => {
  const ds = dataSourceConfig.value;
  return JSON.stringify({
    mode: ds.mode,
    method: ds.method,
    apiUrl: ds.apiUrl,
    headersJson: ds.headersJson,
    queryJson: ds.queryJson,
    bodyJson: ds.bodyJson,
    listPath: ds.listPath,
    totalPath: ds.totalPath,
    successPath: ds.successPath,
    successValue: ds.successValue,
    pageParamKey: ds.pageParamKey,
    pageSizeParamKey: ds.pageSizeParamKey,
    showPagination: showPagination.value,
    currentPage: currentPage.value,
    currentPageSize: currentPageSize.value
  });
});

watch(
  () => tableConfig.value.pageSize,
  (value) => {
    currentPageSize.value = Math.max(1, toPositiveNumber(value, 10));
  },
  { immediate: true }
);

watch(
  () => pageSizes.value,
  (sizes) => {
    if (!sizes.includes(currentPageSize.value)) {
      currentPageSize.value = sizes[0] || 10;
    }
  },
  { immediate: true }
);

watch(
  () => showPagination.value,
  (enabled) => {
    if (!enabled) {
      currentPage.value = 1;
    }
    scheduleApiReload();
  },
  { immediate: true }
);

watch(
  () => reloadDependency.value,
  () => {
    if (!isApiMode.value) {
      requestError.value = '';
      apiRows.value = [];
      apiTotal.value = 0;
      return;
    }
    scheduleApiReload();
  },
  { immediate: true }
);

watch([currentPage, currentPageSize], () => {
  if (isApiMode.value) {
    scheduleApiReload();
  }
});

watch(
  () => isApiMode.value,
  (enabled) => {
    currentPage.value = 1;
    if (enabled) {
      scheduleApiReload();
    } else {
      requestError.value = '';
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (reloadTimer) {
    clearTimeout(reloadTimer);
  }
});

defineOptions({
  name: 'base-table-index'
});
</script>

<style scoped>
.base-table {
  width: 100%;
}

.base-table__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.base-table__error {
  font-size: 12px;
  color: #dc2626;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.base-table__table {
  width: 100%;
}

.base-table__table :deep(.el-table__header-wrapper thead th) {
  background: var(--base-table-header-bg);
  color: var(--base-table-header-color);
}

.base-table__table :deep(.el-table__header-wrapper thead th:first-child) {
  border-top-left-radius: var(--base-table-header-radius);
  border-bottom-left-radius: var(--base-table-header-radius);
}

.base-table__table :deep(.el-table__header-wrapper thead th:last-child) {
  border-top-right-radius: var(--base-table-header-radius);
  border-bottom-right-radius: var(--base-table-header-radius);
}

.base-table__table :deep(.el-table__body tr:hover > td) {
  background: var(--base-table-row-hover-bg);
}

.base-table__table.without-row-divider :deep(.el-table__body td) {
  border-bottom-color: transparent;
}

.base-table__table.without-row-divider :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.base-table__cell {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.base-table__dot {
  flex: 0 0 auto;
  width: var(--base-table-dot-size);
  height: var(--base-table-dot-size);
  border-radius: 999px;
  background: var(--base-table-dot-color);
}

.base-table__link {
  border: none;
  padding: 0;
  color: var(--base-table-link-color);
  background: transparent;
  text-decoration: underline;
  cursor: pointer;
  font: inherit;
}

.base-table__tag {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 13px;
  line-height: 1.3;
  white-space: nowrap;
}

.base-table__pagination {
  display: flex;
}
</style>
