<template>
  <div class="list-config">
    <CmsListSourceConfig
      v-if="dataSourceType === 'dynamic'"
      v-model="modelValue.categoryId"
      :columns="columns"
      :columns-loading="columnsLoading"
      :loading="articlesLoading"
      :items-count="articles.length"
      @change="handleCategoryChange"
      @refresh="handleRefresh"
    />

    <template v-if="dataSourceType === 'static'">
      <div
        v-for="(item, index) in modelValue?.items || []"
        :key="item.id || index"
        class="item-config"
      >
        <el-card class="item-card">
          <div class="item-header">
            <span>列表项 #{{ index + 1 }}</span>
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              circle
              @click="removeItem(index)"
            />
          </div>
          <el-form-item label="标题">
            <el-input v-model="item.articleTitle" placeholder="请输入标题" />
          </el-form-item>
          <el-form-item label="链接URL">
            <el-input v-model="item.linkUrl" placeholder="请输入链接地址" />
          </el-form-item>
          <el-form-item label="发布时间">
            <el-date-picker
              v-model="item.publishTime"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-card>
      </div>

      <div v-if="(modelValue?.items?.length || 0) === 0" class="empty-items">
        <el-empty description="暂无列表项" />
      </div>

      <el-button
        type="primary"
        :icon="Plus"
        class="add-item-btn"
        @click="addItem"
      >
        添加列表项
      </el-button>
    </template>

    <ListDisplayConfig v-model="modelValue" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Delete, Plus } from '@element-plus/icons-vue';
import CmsListSourceConfig from '../common/cms/CmsListSourceConfig.vue';
import { useCmsListDataSource } from '../common/cms/useCmsListDataSource';
import ListDisplayConfig from '../common/list-style/ListConfig.vue';

export interface ColumnListItem {
  id: string;
  articleTitle: string;
  linkUrl?: string;
  publishTime?: string;
}

export interface ColumnListConfigModelType {
  categoryId?: string;
  maxDisplayCount: number;
  showDot: boolean;
  items: ColumnListItem[];
}

const modelValue = defineModel<ColumnListConfigModelType>({
  default: () => ({
    categoryId: '',
    maxDisplayCount: 10,
    showDot: true,
    items: []
  })
});

const dataSourceType = ref<string>('dynamic');

const {
  columns,
  articles,
  columnsLoading,
  articlesLoading,
  handleCategoryChange,
  handleRefresh
} = useCmsListDataSource(modelValue);

const generateId = () => {
  return Math.random().toString(36).substring(2, 15);
};

const addItem = () => {
  if (!modelValue.value) {
    modelValue.value = {
      categoryId: '',
      maxDisplayCount: 10,
      showDot: true,
      items: []
    };
  }

  if (!modelValue.value.items) {
    modelValue.value.items = [];
  }

  modelValue.value.items.push({
    id: generateId(),
    articleTitle: '',
    linkUrl: '',
    publishTime: ''
  });
};

const removeItem = (index: number) => {
  if (!modelValue.value || !modelValue.value.items) return;
  modelValue.value.items.splice(index, 1);
};

defineOptions({
  name: 'pb-image-text-column-list-config'
});
</script>

<style scoped>
.list-config {
  --config-border: #e2e8f0;
  --config-surface: #f8fafc;
  --config-surface-strong: #fff;
  --config-text: #0f172a;
  --config-muted: #64748b;

  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-config :deep(.el-divider__text) {
  font-weight: 600;
  color: var(--config-text);
  letter-spacing: 0.2px;
}

.list-config :deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--config-muted);
}

.item-config {
  margin-bottom: 0;
}

.item-card {
  margin-bottom: 0;
  border: 1px solid var(--config-border);
  border-radius: 8px;
  background: var(--config-surface-strong);
  box-shadow: none;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-weight: 600;
  color: var(--config-text);
}

.empty-items {
  margin: 20px 0;
  padding: 8px 0;
}

.add-item-btn {
  border-radius: 6px;
  width: 100%;
}
</style>
