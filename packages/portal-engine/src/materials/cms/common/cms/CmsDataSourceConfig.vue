<template>
  <div class="cms-data-source-config">
    <ObCard :title="title">
      <el-form-item v-if="showSourceType" :label="sourceTypeLabel">
        <el-radio-group v-model="sourceType">
          <el-radio label="dynamic">{{ dynamicLabel }}</el-radio>
          <el-radio label="static">{{ staticLabel }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <CmsListSourceConfig
        v-if="sourceType === 'dynamic'"
        v-model="categoryId"
        :columns="columns"
        :columns-loading="columnsLoading"
        :loading="loading"
        :items-count="itemsCount"
        :status-text="statusText"
        :status-type="statusType"
        :tree-props="treeProps"
        @change="handleCategoryChange"
        @refresh="handleRefresh"
      >
        <template #extra>
          <slot name="dynamic-extra" />
        </template>
      </CmsListSourceConfig>

      <template v-else>
        <slot name="static" />
      </template>
    </ObCard>
  </div>
</template>

<script setup lang="ts">
  import { ObCard } from '@one-base-template/ui';
  import CmsListSourceConfig from './CmsListSourceConfig.vue';

  type CmsDataSourceType = 'dynamic' | 'static';

  withDefaults(
    defineProps<{
      title?: string;
      showSourceType?: boolean;
      sourceTypeLabel?: string;
      dynamicLabel?: string;
      staticLabel?: string;
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
      title: '数据源配置',
      showSourceType: false,
      sourceTypeLabel: '数据来源',
      dynamicLabel: '动态数据',
      staticLabel: '静态配置',
      columns: () => [],
      columnsLoading: false,
      loading: false,
      itemsCount: 0,
      statusText: undefined,
      statusType: undefined,
      treeProps: () => ({
        label: 'categoryName',
        children: 'children',
      }),
    }
  );

  const emit = defineEmits<{
    (e: 'change', value: string): void;
    (e: 'refresh'): void;
  }>();

  const categoryId = defineModel<string | undefined>();
  const sourceType = defineModel<CmsDataSourceType>('sourceType', {
    default: 'dynamic',
  });

  const handleCategoryChange = (value: string) => {
    emit('change', value);
  };

  const handleRefresh = () => {
    emit('refresh');
  };

  defineOptions({
    name: 'CmsDataSourceConfig',
  });
</script>

<style scoped>
  .cms-data-source-config {
    width: 100%;
  }

  .cms-data-source-config :deep(.ob-card) {
    margin-bottom: 0;
  }
</style>
