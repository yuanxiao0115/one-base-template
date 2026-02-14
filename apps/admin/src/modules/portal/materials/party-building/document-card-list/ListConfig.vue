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
          <el-form-item label="文章ID">
            <el-input v-model="item.id" placeholder="请输入文章ID" />
          </el-form-item>
          <el-form-item label="标题">
            <el-input v-model="item.articleTitle" placeholder="请输入标题" />
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

    <el-divider content-position="left">显示设置</el-divider>

    <el-form-item label="最大显示条数">
      <el-input-number
        v-model="modelValue.maxDisplayCount"
        :min="1"
        :max="20"
        controls-position="right"
      />
    </el-form-item>

    <el-form-item label="卡片宽度">
      <div class="input-with-unit">
        <el-input-number
          v-model="modelValue.cardWidth"
          :min="80"
          :max="600"
          controls-position="right"
        >
          <template #suffix>
            <span class="suffix-unit">px</span>
          </template>
        </el-input-number>
      </div>
    </el-form-item>

    <el-form-item label="卡片间距">
      <div class="input-with-unit">
        <el-input-number
          v-model="modelValue.cardGap"
          :min="0"
          :max="200"
          controls-position="right"
        >
          <template #suffix>
            <span class="suffix-unit">px</span>
          </template>
        </el-input-number>
      </div>
    </el-form-item>

    <el-form-item label="标题字体大小">
      <div class="input-with-unit">
        <el-input-number
          v-model="modelValue.titleFontSize"
          :min="10"
          :max="36"
          controls-position="right"
        >
          <template #suffix>
            <span class="suffix-unit">px</span>
          </template>
        </el-input-number>
      </div>
    </el-form-item>

    <el-form-item label="标题字重">
      <div class="input-with-unit">
        <el-input-number
          v-model="modelValue.titleFontWeight"
          :min="100"
          :max="900"
          :step="100"
          controls-position="right"
        />
      </div>
    </el-form-item>

    <el-form-item label="标题颜色">
      <el-color-picker v-model="modelValue.titleColor" show-alpha />
    </el-form-item>

    <el-form-item label="标题最大字数">
      <div class="input-with-unit">
        <el-input-number
          v-model="modelValue.titleMaxChars"
          :min="1"
          :max="50"
          controls-position="right"
        />
      </div>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Delete, Plus } from '@element-plus/icons-vue';
import CmsListSourceConfig from '../common/cms/CmsListSourceConfig.vue';
import { useCmsListDataSource } from '../common/cms/useCmsListDataSource';

export interface CardListItem {
  id: string;
  articleTitle: string;
}

export interface CardListConfigModelType {
  categoryId?: string;
  maxDisplayCount: number;
  cardWidth: number;
  cardGap: number;
  titleFontSize: number;
  titleFontWeight: number;
  titleColor: string;
  titleMaxChars: number;
  items: CardListItem[];
}

const modelValue = defineModel<CardListConfigModelType>({
  default: () => ({
    categoryId: '',
    maxDisplayCount: 6,
    cardWidth: 130,
    cardGap: 56,
    titleFontSize: 14,
    titleFontWeight: 700,
    titleColor: '#B7724D',
    titleMaxChars: 10,
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
      maxDisplayCount: 6,
      cardWidth: 130,
      cardGap: 56,
      titleFontSize: 14,
      titleFontWeight: 700,
      titleColor: '#B7724D',
      titleMaxChars: 10,
      items: []
    };
  }

  if (!modelValue.value.items) {
    modelValue.value.items = [];
  }

  modelValue.value.items.push({
    id: generateId(),
    articleTitle: ''
  });
};

const removeItem = (index: number) => {
  if (!modelValue.value || !modelValue.value.items) return;
  modelValue.value.items.splice(index, 1);
};

defineOptions({
  name: 'pb-document-card-list-config'
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

.input-with-unit {
  display: flex;
  align-items: center;
}

.suffix-unit {
  margin-right: 8px;
  font-size: 14px;
  color: var(--config-muted);
}
</style>
