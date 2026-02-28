<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Filter, Search } from '@element-plus/icons-vue';
import type { TableColumnList } from './types';

defineOptions({
  name: 'OneTableBar'
});

interface OneTableBarProps {
  title?: string;
  tableRef?: Record<string, unknown> | null;
  columns?: TableColumnList;
  placeholder?: string;
  selectedNum?: number;
  showQuickSearch?: boolean;
  showSearchBar?: boolean;
  keyword?: string;
  maxlength?: number;
}

const props = withDefaults(defineProps<OneTableBarProps>(), {
  title: '列表',
  tableRef: null,
  columns: () => [],
  placeholder: '请输入关键字搜索',
  selectedNum: 0,
  showQuickSearch: true,
  showSearchBar: true,
  keyword: '',
  maxlength: 30
});

const emit = defineEmits<{
  (e: 'resetForm'): void;
  (e: 'search', keyword: string): void;
  (e: 'selectionCancel'): void;
  (e: 'update:keyword', keyword: string): void;
}>();

const size = ref<'default' | 'small' | 'large'>('default');
const drawerFlag = ref(false);
const queryKey = ref('');

function cloneColumns(columns: TableColumnList): TableColumnList {
  return columns.map((col) => ({
    ...col,
    children: Array.isArray(col.children) ? cloneColumns(col.children) : undefined
  }));
}

const dynamicColumns = computed<TableColumnList>(() => cloneColumns(props.columns));

watch(
  () => props.keyword,
  (val) => {
    queryKey.value = (val ?? '').trim();
  },
  { immediate: true }
);

function inputChange(value: string) {
  queryKey.value = (value ?? '').trim();
  emit('update:keyword', queryKey.value);
}

function onOpenDrop() {
  drawerFlag.value = true;
}

function closeDrawer() {
  drawerFlag.value = false;
}

function onResetForm() {
  emit('resetForm');
  closeDrawer();
}

function onSubmit(event: Event) {
  event.preventDefault();
  emit('search', queryKey.value);
}

function onSelectionCancel() {
  emit('selectionCancel');
}

function onSearch() {
  emit('search', queryKey.value);
  closeDrawer();
}

function onClear() {
  inputChange('');
  emit('search', '');
}
</script>

<template>
  <div class="one-table-bar">
    <div class="one-table-bar__head">
      <slot name="title">
        <p class="one-table-bar__title">{{ title }}</p>
      </slot>
    </div>

    <div v-if="$slots.title || title" class="one-table-bar-title" />

    <div v-if="showSearchBar" class="one-table-bar__toolbar">
      <div class="one-table-bar__search">
        <el-form v-if="showQuickSearch" class="one-table-bar__quick-form" inline @submit.prevent="onSubmit">
          <el-form-item>
            <el-input
              :model-value="queryKey"
              class="one-table-bar__keyword"
              :maxlength="maxlength"
              :placeholder="placeholder"
              clearable
              :suffix-icon="Search"
              @update:model-value="inputChange"
              @clear="onClear"
            />
          </el-form-item>
          <el-form-item v-if="$slots.drawer">
            <el-button
              class="one-table-bar__advanced-trigger"
              :icon="Filter"
              title="高级筛选"
              aria-label="高级筛选"
              @click="onOpenDrop"
            />
          </el-form-item>
        </el-form>

        <div v-if="$slots.searchForm" class="one-table-bar__search-form">
          <slot name="searchForm" />
        </div>
      </div>

      <div v-if="$slots.buttons" class="one-table-bar__buttons">
        <slot name="buttons" />
      </div>
    </div>

    <div v-if="selectedNum > 0" class="one-table-bar__selection">
      <span class="one-table-bar__selection-text">已选 {{ selectedNum }} 项</span>
      <el-button type="primary" link @click="onSelectionCancel">取消选择</el-button>
    </div>

    <div class="one-table-bar__content">
      <slot :size="size" :dynamic-columns="dynamicColumns" />
    </div>
  </div>

  <el-drawer
    v-model="drawerFlag"
    title="高级筛选"
    :size="400"
    append-to-body
    class="one-drawer"
  >
    <div class="one-table-bar__drawer">
      <slot name="drawer" />
    </div>
    <template #footer>
      <div class="one-table-bar__drawer-footer">
        <el-button plain @click="onResetForm">重置</el-button>
        <el-button type="primary" @click="onSearch">确定</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<style scoped>
.one-table-bar {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 16px;
  background: #fff;
  /* border: 1px solid var(--el-border-color-lighter); */
  border-radius: 0;
}

.one-table-bar__head {
  flex-shrink: 0;
  padding-bottom: 15px;
}

.one-table-bar__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--one-text-color-5, var(--el-text-color-primary));
  line-height: 1;
}

.one-table-bar-title {
  flex-shrink: 0;
  margin: 0 -16px;
  /* border-bottom: 1px solid var(--el-border-color-light); */
}

.one-table-bar__toolbar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-height: 48px;
  padding-top: 8px;
}

.one-table-bar__search {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.one-table-bar__quick-form {
  display: flex;
  align-items: center;
  max-width: 500px;
}

.one-table-bar__keyword {
  width: 360px;
  margin-right: 8px;
}

.one-table-bar__keyword :deep(.el-input__wrapper) {
  height: 32px;
  padding: 0 11px;
  border: 1px solid var(--el-border-color);
  border-radius: 0;
  box-shadow: none;
  background: var(--el-bg-color-overlay);
}

.one-table-bar__keyword :deep(.el-input__wrapper:hover) {
  border-color: var(--el-border-color-hover);
  box-shadow: none;
}

.one-table-bar__keyword :deep(.el-input__wrapper.is-focus) {
  border-color: var(--el-color-primary);
  box-shadow: none;
}

.one-table-bar__keyword :deep(.el-input__inner) {
  height: 30px;
  line-height: 30px;
}

.one-table-bar__advanced-trigger {
  width: 32px;
  min-width: 32px;
  height: 32px;
  padding: 0;
  color: var(--one-text-color-regular, var(--el-text-color-regular));
  border-color: var(--el-border-color);
  border-radius: 0;
  box-shadow: none;
}

.one-table-bar__advanced-trigger :deep(.el-icon) {
  font-size: 16px;
}

.one-table-bar__search-form {
  width: 360px;
}

.one-table-bar__buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.one-table-bar__selection {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  width: 100%;
  min-height: 46px;
  margin-top: 8px;
  padding: 0 16px;
  background: var(--el-fill-color-light);
}

.one-table-bar__selection-text {
  margin-right: 8px;
  color: rgba(42, 46, 54, 0.6);
  font-size: var(--el-font-size-base);
}

.one-table-bar__content {
  display: flex;
  flex: 1;
  margin-top: 12px;
  min-height: 0;
}

.one-table-bar__content :deep(.ob-vxe-table) {
  flex: 1;
  min-height: 0;
}

.one-table-bar__drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.one-table-bar__drawer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.one-table-bar :deep(.el-form-item) {
  margin-right: 0;
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .one-table-bar__toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .one-table-bar__keyword,
  .one-table-bar__search-form {
    width: 100%;
  }

  .one-table-bar__buttons {
    margin-left: 0;
  }
}
</style>
