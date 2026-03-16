<template>
  <div class="cms-list-source-config">
    <el-form-item label="选择栏目">
      <el-tree-select
        v-model="categoryId"
        placeholder="请选择栏目"
        class="cms-list-source-select"
        :loading="columnsLoading"
        :data="columns"
        node-key="id"
        :props="treeProps"
        check-strictly
        @change="handleCategoryChange"
      />
    </el-form-item>

    <el-form-item label="数据获取状态">
      <div class="data-status">
        <el-tag :type="statusType"> {{ statusText }} </el-tag>
        <el-button type="primary" link :disabled="!categoryId || loading" @click="handleRefresh">
          刷新数据
        </el-button>
      </div>
    </el-form-item>

    <slot name="extra" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    columns?: any[];
    columnsLoading?: boolean;
    loading?: boolean;
    itemsCount?: number;
    statusText?: string;
    statusType?: 'danger' | 'info' | 'success' | 'warning';
    treeProps?: {
      label?: string;
      children?: string;
    };
  }>(),
  {
    columns: () => [],
    columnsLoading: false,
    loading: false,
    itemsCount: 0,
    statusText: undefined,
    statusType: undefined,
    treeProps: () => ({
      label: 'categoryName',
      children: 'children'
    })
  }
);

const emit = defineEmits<{
  (e: 'change', value: string): void;
  (e: 'refresh'): void;
}>();

const categoryId = defineModel<string | undefined>();

const statusType = computed(() => {
  if (props.statusType) {
    return props.statusType;
  }
  if (props.loading) {
    return 'warning';
  }
  if (props.itemsCount > 0) {
    return 'success';
  }
  return 'info';
});

const statusText = computed(() => {
  if (props.statusText) {
    return props.statusText;
  }
  if (props.loading) {
    return '获取中...';
  }
  if (props.itemsCount > 0) {
    return `已获取${props.itemsCount}条数据`;
  }
  return '未获取数据';
});

const handleCategoryChange = (value: string) => {
  emit('change', value);
};

const handleRefresh = () => {
  emit('refresh');
};

defineOptions({
  name: 'CmsListSourceConfig'
});
</script>

<style scoped>
.cms-list-source-config {
  --config-border: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cms-list-source-select {
  width: 100%;
}

.data-status {
  display: flex;
  align-items: center;
  border: 1px dashed var(--config-border);
  border-radius: 6px;
  padding: 6px 10px;
  background: #fff;
  gap: 10px;
}

.data-status :deep(.el-tag) {
  border-radius: 999px;
  padding: 0 10px;
  font-weight: 500;
}
</style>
