<script setup lang="ts">
import { computed, useAttrs, useSlots, type StyleValue } from 'vue';
import type { TablePagination } from './types';
import { resolvePagerLayout } from './internal/table-helpers';

defineOptions({
  name: 'CardTable',
  inheritAttrs: false
});

type RowRecord = Record<string, unknown>;

interface CardTableProps {
  data?: RowRecord[];
  loading?: boolean;
  pagination?: TablePagination | null | false;
  paginationSmall?: boolean;
  pageSizes?: number[];
  emptyDescription?: string;
  minCardWidth?: string;
  gap?: string;
}

const props = withDefaults(defineProps<CardTableProps>(), {
  data: () => [],
  loading: false,
  pagination: null,
  paginationSmall: undefined,
  pageSizes: undefined,
  emptyDescription: '暂无数据',
  minCardWidth: '210px',
  gap: '14px'
});

const emit = defineEmits<{
  (e: 'page-current-change' | 'page-size-change', page: number): void;
}>();

const attrs = useAttrs();
const slots = useSlots();

const wrapperClass = computed(() => ['ob-card-table', attrs.class]);

const wrapperStyle = computed<StyleValue>(() => [
  attrs.style as StyleValue,
  {
    '--ob-card-table-min-card-width': props.minCardWidth,
    '--ob-card-table-gap': props.gap
  }
]);

const passthroughAttrs = computed(() =>
  Object.fromEntries(
    Object.entries(attrs).filter(([key]) => !['class', 'style', 'size'].includes(key))
  )
);

const normalizedData = computed<RowRecord[]>(() => (Array.isArray(props.data) ? props.data : []));

const hasToolbar = computed(() => Boolean(slots.toolbar));

const normalizedPagination = computed<TablePagination | null>(() => {
  if (!props.pagination) {
    return null;
  }
  return props.pagination;
});

const pagerProps = computed<Record<string, unknown> | null>(() => {
  if (!normalizedPagination.value) {
    return null;
  }

  const pagerSmall =
    props.paginationSmall ?? normalizedPagination.value.small ?? attrs.size === 'small';

  return {
    total: Number(normalizedPagination.value.total ?? 0),
    currentPage: Number(normalizedPagination.value.currentPage ?? 1),
    pageSize: Number(normalizedPagination.value.pageSize ?? 10),
    pageSizes:
      Array.isArray(props.pageSizes) && props.pageSizes.length > 0
        ? props.pageSizes
        : Array.isArray(normalizedPagination.value.pageSizes) &&
            normalizedPagination.value.pageSizes.length > 0
          ? normalizedPagination.value.pageSizes
          : [10, 20, 50, 100],
    background: normalizedPagination.value.background ?? true,
    layout: resolvePagerLayout(normalizedPagination.value.layout),
    small: pagerSmall,
    hideOnSinglePage: normalizedPagination.value.hideOnSinglePage ?? false,
    disabled: normalizedPagination.value.disabled ?? false
  };
});

function handlePageSizeChange(size: number) {
  emit('page-size-change', Number(size || 10));
}

function handlePageCurrentChange(page: number) {
  emit('page-current-change', Number(page || 1));
}

function resolveRowKey(row: RowRecord, index: number) {
  const candidate = row.id ?? row.key;
  return typeof candidate === 'string' || typeof candidate === 'number' ? candidate : index;
}
</script>

<template>
  <div :class="wrapperClass" :style="wrapperStyle" v-bind="passthroughAttrs">
    <div v-if="hasToolbar" class="ob-card-table__toolbar">
      <slot name="toolbar" />
    </div>

    <!-- 主体滚动区与分页器分离，避免分页随卡片内容滚动。 -->
    <div v-loading="loading" class="ob-card-table__main">
      <div v-if="normalizedData.length === 0" class="ob-card-table__empty">
        <el-empty :description="emptyDescription" />
      </div>

      <div v-else class="ob-card-table__grid">
        <div
          v-for="(row, index) in normalizedData"
          :key="resolveRowKey(row, index)"
          class="ob-card-table__item"
        >
          <slot :row="row" :index="index" />
        </div>
      </div>
    </div>

    <div v-if="pagerProps" class="ob-card-table__pager">
      <el-pagination
        v-bind="pagerProps"
        @size-change="handlePageSizeChange"
        @current-change="handlePageCurrentChange"
      />
    </div>
  </div>
</template>

<style scoped>
.ob-card-table {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: #fff;
}

.ob-card-table__toolbar {
  flex-shrink: 0;
  padding-bottom: 12px;
}

.ob-card-table__main {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: #fff;
}

.ob-card-table__empty {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  padding: 12px 0;
}

.ob-card-table__grid {
  display: grid;
  flex: 1;
  width: 100%;
  min-height: min-content;
  padding: 4px 0;
  gap: var(--ob-card-table-gap);
  align-content: start;
  grid-template-columns: repeat(
    auto-fill,
    minmax(min(100%, var(--ob-card-table-min-card-width)), 1fr)
  );
}

.ob-card-table__item {
  min-width: 0;
}

.ob-card-table__pager {
  flex-shrink: 0;
  padding-top: 8px;
  background: var(--ob-table-pager-bg);
  border-top: 1px solid var(--ob-table-pager-border-color);
}

.ob-card-table__pager :deep(.el-pagination) {
  position: relative;
  justify-content: flex-end;
  min-height: 32px;
  padding-left: 120px;
}

.ob-card-table__pager :deep(.el-pagination__total) {
  position: absolute;
  left: 4px;
  top: 50%;
  margin: 0;
  transform: translateY(-50%);
  color: var(--el-text-color-regular);
}
</style>
