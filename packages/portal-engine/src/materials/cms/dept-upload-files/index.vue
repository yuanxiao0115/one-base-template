<template>
  <UnifiedContainerDisplay :content="containerContentConfig" :style="containerStyleConfig">
    <div v-loading="loading" class="dept-upload-files">
      <div
        v-for="(row, index) in displayRows"
        :key="resolveRowId(row, index)"
        class="file-row"
        :class="{
          'row-with-divider': fileConfig.showRowDivider,
          'row-clickable': canNavigate(row)
        }"
        :style="rowStyleObj"
        @click="handleRowClick(row)"
      >
        <div class="row-left">
          <span v-if="fileConfig.showRowDot" class="row-dot" :style="dotStyleObj" />
          <span class="file-name" :style="nameStyleObj" :title="resolveFileName(row)">
            {{ resolveFileName(row) }}
          </span>
        </div>
        <span class="row-date" :style="dateStyleObj">{{ resolveDate(row) }}</span>
      </div>

      <div v-if="!loading && displayRows.length === 0" class="empty-text">暂无单位上传文件</div>
    </div>
  </UnifiedContainerDisplay>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, type CSSProperties } from 'vue';
import { useRouter } from 'vue-router';
import { UnifiedContainerDisplay } from '../../common/unified-container';
import type {
  UnifiedContainerContentConfigModel,
  UnifiedContainerStyleConfigModel
} from '../../common/unified-container';
import {
  loadPortalDataSourceRows,
  mergePortalDataSourceModel,
  type PortalDataSourceModel
} from '../../base/common/portal-data-source';
import {
  mergePortalLinkConfig,
  openPortalLink,
  resolvePortalLink,
  type PortalLinkConfig
} from '../../base/common/portal-link';
import {
  normalizeImageSource,
  resolveValueByPath,
  toNonNegativeNumber,
  toPositiveNumber
} from '../../base/common/material-utils';

type FileRow = Record<string, unknown>;

interface DeptUploadFilesSchema {
  content?: {
    container?: Partial<UnifiedContainerContentConfigModel>;
    dataSource?: Partial<PortalDataSourceModel>;
    file?: {
      maxDisplayCount?: number;
      showRowDot?: boolean;
      showRowDivider?: boolean;
      idKey?: string;
      nameKey?: string;
      dateKey?: string;
      downloadUrlKey?: string;
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
      dotColor?: string;
      rowHoverBgColor?: string;
      dividerColor?: string;
      nameColor?: string;
      dateColor?: string;
      nameFontSize?: number;
      dateFontSize?: number;
      rowPaddingY?: number;
    };
  };
}

const props = defineProps<{
  schema: DeptUploadFilesSchema;
}>();

let router: ReturnType<typeof useRouter> | null = null;
try {
  router = useRouter();
} catch {
  router = null;
}

const loading = ref(false);
const rows = ref<FileRow[]>([]);
let requestController: AbortController | null = null;

const containerContentConfig = computed(() => props.schema?.content?.container);
const containerStyleConfig = computed(() => props.schema?.style?.container);
const dataSource = computed(() => mergePortalDataSourceModel(props.schema?.content?.dataSource));
const fileStyle = computed(() => props.schema?.style?.file || {});

const fileConfig = computed(() => {
  const raw = props.schema?.content?.file || {};
  return {
    maxDisplayCount: Math.max(1, toPositiveNumber(raw.maxDisplayCount, 5)),
    showRowDot: raw.showRowDot !== false,
    showRowDivider: raw.showRowDivider === true,
    idKey: String(raw.idKey || 'id'),
    nameKey: String(raw.nameKey || 'fileName'),
    dateKey: String(raw.dateKey || 'updateDate'),
    downloadUrlKey: String(raw.downloadUrlKey || 'downloadUrl'),
    link: mergePortalLinkConfig(
      raw.link || {
        path: raw.linkPath,
        paramKey: raw.linkParamKey,
        valueKey: raw.linkValueKey,
        openType: raw.openType
      }
    )
  };
});

const displayRows = computed(() => rows.value.slice(0, fileConfig.value.maxDisplayCount));

const rowStyleObj = computed<CSSProperties>(() => ({
  '--dept-upload-files-hover-bg': fileStyle.value.rowHoverBgColor || 'var(--el-fill-color-light)',
  '--dept-upload-files-divider': fileStyle.value.dividerColor || 'var(--el-border-color-lighter)',
  paddingTop: `${toNonNegativeNumber(fileStyle.value.rowPaddingY, 12)}px`,
  paddingBottom: `${toNonNegativeNumber(fileStyle.value.rowPaddingY, 12)}px`
}));

const dotStyleObj = computed<CSSProperties>(() => ({
  backgroundColor: fileStyle.value.dotColor || '#ff7d00'
}));

const nameStyleObj = computed<CSSProperties>(() => ({
  color: fileStyle.value.nameColor || 'var(--el-text-color-regular)',
  fontSize: `${Math.max(12, toPositiveNumber(fileStyle.value.nameFontSize, 14))}px`
}));

const dateStyleObj = computed<CSSProperties>(() => ({
  color: fileStyle.value.dateColor || 'var(--el-text-color-regular)',
  fontSize: `${Math.max(12, toPositiveNumber(fileStyle.value.dateFontSize, 14))}px`
}));

function resolveRowId(row: FileRow, index: number): string {
  const value = resolveValueByPath(row, fileConfig.value.idKey);
  if (value !== undefined && value !== null && `${value}`.trim()) {
    return String(value);
  }
  return `dept-file-${index + 1}`;
}

function resolveFileName(row: FileRow): string {
  return String(resolveValueByPath(row, fileConfig.value.nameKey) || '未命名文件');
}

function resolveDate(row: FileRow): string {
  return String(resolveValueByPath(row, fileConfig.value.dateKey) || '');
}

function resolveDownloadUrl(row: FileRow): string {
  return normalizeImageSource(resolveValueByPath(row, fileConfig.value.downloadUrlKey));
}

function resolveDetailLink(row: FileRow): string {
  const value = resolveValueByPath(row, fileConfig.value.link.valueKey);
  return resolvePortalLink(fileConfig.value.link, value);
}

function canNavigate(row: FileRow): boolean {
  return Boolean(resolveDownloadUrl(row) || resolveDetailLink(row));
}

function handleRowClick(row: FileRow) {
  const downloadUrl = resolveDownloadUrl(row);
  if (downloadUrl) {
    openPortalLink({
      link: downloadUrl,
      openType: 'newTab',
      routerPush: router ? (nextLink: string) => router!.push(nextLink) : null
    });
    return;
  }

  const detailLink = resolveDetailLink(row);
  if (!detailLink) {
    return;
  }

  openPortalLink({
    link: detailLink,
    openType: fileConfig.value.link.openType,
    routerPush: router ? (nextLink: string) => router!.push(nextLink) : null
  });
}

function cancelRequest() {
  if (requestController) {
    requestController.abort();
    requestController = null;
  }
}

async function loadRows() {
  cancelRequest();
  requestController = new AbortController();

  loading.value = true;
  const result = await loadPortalDataSourceRows(dataSource.value, {
    page: 1,
    pageSize: fileConfig.value.maxDisplayCount,
    signal: requestController.signal
  });

  if (!result.success && result.errorMessage !== '请求已取消') {
    console.warn('[portal-engine] cms-dept-upload-files 数据加载失败：', result.errorMessage);
  }

  rows.value = result.rows;
  loading.value = false;
}

watch(
  () => [dataSource.value, fileConfig.value.maxDisplayCount],
  () => {
    loadRows();
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
  name: 'cms-dept-upload-files-index'
});
</script>

<style scoped lang="scss">
.dept-upload-files {
  min-height: 24px;
}

.file-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 16px;
  min-height: 46px;

  &.row-clickable {
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--dept-upload-files-hover-bg, var(--el-fill-color-light));
    }
  }
}

.row-with-divider {
  border-bottom: 1px solid var(--dept-upload-files-divider, var(--el-border-color-lighter));
}

.row-left {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
  gap: 12px;
}

.row-dot {
  border-radius: 50%;
  width: 8px;
  height: 8px;
  flex-shrink: 0;
}

.file-name {
  display: block;
  overflow: hidden;
  min-width: 0;
  flex: 1;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-date {
  flex-shrink: 0;
  line-height: 22px;
}

.empty-text {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 120px;
  font-size: 14px;
  color: #909399;
}
</style>
