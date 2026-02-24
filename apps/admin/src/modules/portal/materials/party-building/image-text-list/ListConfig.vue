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

    <!-- 静态数据项配置 -->
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
          <el-form-item
            v-if="modelValue.listType === 'image-text'"
            label="封面图片"
          >
            <el-input v-model="item.coverUrl" placeholder="请输入图片地址" />
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
    <!-- 公共属性设置 -->
    <el-form-item label="列表类型">
      <el-radio-group v-model="modelValue.listType">
        <el-radio label="image-text">图文列表</el-radio>
        <el-radio label="text-only">纯文本列表</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="列数">
      <el-radio-group v-model="modelValue.columnCount">
        <el-radio :label="1">单列</el-radio>
        <el-radio :label="2">双列</el-radio>
        <el-radio :label="3">三列</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="最大显示条数">
      <el-input-number
        v-model="modelValue.maxDisplayCount"
        :min="1"
        :max="20"
        controls-position="right"
      />
    </el-form-item>

    <el-form-item
      v-if="modelValue.listType === 'text-only'"
      label="显示圆点标记"
    >
      <el-switch
        v-model="modelValue.showDot"
        :active-value="true"
        :inactive-value="false"
      />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Delete, Plus } from '@element-plus/icons-vue';
import CmsListSourceConfig from '../common/cms/CmsListSourceConfig.vue';
import { useCmsListDataSource } from '../common/cms/useCmsListDataSource';

export interface ListItem {
  id: string;
  articleTitle: string;
  coverUrl?: string;
  linkUrl: string;
  publishTime?: string;
}

export interface ListConfigModelType {
  categoryId?: string;
  listType: 'image-text' | 'text-only';
  columnCount: 1 | 2 | 3;
  showDot: boolean;
  maxDisplayCount: number;
  items: ListItem[];
}

// 使用defineModel
const modelValue = defineModel<ListConfigModelType>({
  default: () => ({
    categoryId: '',
    listType: 'image-text',
    columnCount: 1,
    showDot: false,
    maxDisplayCount: 10,
    items: []
  })
});

// 监听列表类型变化
watch(
  () => modelValue.value.listType,
  newType => {
    if (newType === 'image-text' && modelValue.value.showDot) {
      // 当切换到图文列表时，自动关闭圆点标记
      modelValue.value.showDot = false;
    }
  }
);

// 动态数据源相关
const dataSourceType = ref<string>('dynamic');
const {
  columns,
  articles,
  columnsLoading,
  articlesLoading,
  handleCategoryChange,
  handleRefresh
} = useCmsListDataSource(modelValue);

// 生成随机ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15);
};

// 添加新列表项
const addItem = () => {
  if (!modelValue.value) {
    modelValue.value = {
      categoryId: '',
      listType: 'image-text',
      columnCount: 1,
      showDot: false,
      maxDisplayCount: 10,
      items: []
    };
  }

  if (!modelValue.value.items) {
    modelValue.value.items = [];
  }

  // 获取当前日期
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const currentDate = `${year}-${month}-${day}`;

  // 添加新的列表项
  modelValue.value.items.push({
    id: generateId(),
    articleTitle: '',
    coverUrl: '',
    linkUrl: '',
    publishTime: currentDate
  });
};

// 删除列表项
const removeItem = (index: number) => {
  if (!modelValue.value || !modelValue.value.items) return;
  modelValue.value.items.splice(index, 1);
};

defineOptions({
  name: 'pb-list-config'
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

.dynamic-preview {
  position: relative; /* 确保覆盖层定位正确 */
  margin-top: 15px;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  background-color: transparent;
  cursor: not-allowed;
}

.table-title {
  display: inline-block;
  overflow: hidden;
  max-width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: var(--config-muted);
  background-color: #f5f7fa;
}
</style>
