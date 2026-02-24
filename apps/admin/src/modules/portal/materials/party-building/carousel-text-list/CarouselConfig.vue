<template>
  <div class="carousel-config">
    <CmsListSourceConfig
      v-model="modelValue.categoryId"
      :columns="categoryOptions"
      :columns-loading="columnsLoading"
      :loading="isLoading"
      :items-count="itemsCount"
      :status-text="statusText"
      :status-type="statusType"
      @change="handleCategoryChange"
      @refresh="handleRefresh"
    />

    <!-- 轮播图配置部分 -->
    <el-divider content-position="left">轮播图配置</el-divider>
    <el-form-item label="轮播图效果">
      <el-radio-group v-model="modelValue.effect">
        <el-radio label="fade">淡入淡出</el-radio>
        <el-radio label="card">卡片式</el-radio>
        <el-radio label="slide">滑动</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="自动播放">
      <el-switch
        v-model="modelValue.autoplay"
        :active-value="true"
        :inactive-value="false"
      />
    </el-form-item>

    <el-form-item v-if="modelValue.autoplay" label="播放间隔(毫秒)">
      <el-input-number
        v-model="modelValue.interval"
        :min="1000"
        :max="10000"
        :step="500"
        controls-position="right"
      />
    </el-form-item>

    <el-form-item label="指示器">
      <el-switch
        v-model="modelValue.indicator"
        :active-value="true"
        :inactive-value="false"
      />
    </el-form-item>

    <el-form-item label="控制箭头">
      <el-select v-model="modelValue.arrow">
        <el-option label="总是显示" value="always" />
        <el-option label="悬停显示" value="hover" />
        <el-option label="不显示" value="never" />
      </el-select>
    </el-form-item>

    <el-form-item label="最多显示项数">
      <el-input-number
        v-model="modelValue.maxItems"
        :min="1"
        :max="20"
        controls-position="right"
      />
    </el-form-item>

    <!-- 列表配置部分 -->
    <el-divider content-position="left">列表配置</el-divider>
    <el-form-item label="最多显示条数">
      <el-input-number
        v-model="modelValue.listMaxItems"
        :min="1"
        :max="20"
        controls-position="right"
      />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { cmsApi } from '../../../api';
import CmsListSourceConfig from '../common/cms/CmsListSourceConfig.vue';

// 轮播图数据项类型
export interface CarouselItem {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  publishTime?: string;
}

// 列表数据项类型
export interface ListItem {
  id: string;
  articleTitle: string;
  linkUrl: string;
  publishTime?: string;
}

export interface CarouselConfigModelValue {
  categoryId?: string;
  // 轮播图设置
  effect?: 'fade' | 'card' | 'slide';
  autoplay?: boolean;
  interval?: number;
  indicator?: boolean;
  arrow?: 'always' | 'hover' | 'never';
  maxItems?: number;
  // 列表设置
  listMaxItems?: number;
}

// 使用 defineModel 直接绑定（提供默认值，避免 modelValue 为空导致模板类型报错）
const modelValue = defineModel<CarouselConfigModelValue>({
  default: () => ({
    categoryId: '',
    effect: 'fade',
    autoplay: true,
    interval: 3000,
    indicator: true,
    arrow: 'hover',
    maxItems: 5,
    listMaxItems: 10
  })
});

// 栏目选项
const categoryOptions = ref<any[]>([]);

// 数据加载状态
const columnsLoading = ref<boolean>(false);
const articlesLoading = ref<boolean>(false);
const carouselsLoading = ref<boolean>(false);

// 预览数据（不保存到配置中）
const previewListItems = ref<ListItem[]>([]);
const previewCarouselItems = ref<CarouselItem[]>([]);

const isLoading = computed(
  () => articlesLoading.value || carouselsLoading.value
);

const itemsCount = computed(
  () => previewListItems.value.length + previewCarouselItems.value.length
);

const statusType = computed(() => {
  if (isLoading.value) return 'warning';
  return itemsCount.value > 0 ? 'success' : 'info';
});

const statusText = computed(() => {
  if (isLoading.value) return '获取中...';
  if (itemsCount.value > 0) {
    return `已获取 ${previewListItems.value.length || 0} 条列表数据, ${previewCarouselItems.value.length || 0} 条轮播数据`;
  }
  return '未获取数据';
});

// 加载栏目数据
const loadColumns = async () => {
  columnsLoading.value = true;
  try {
    const res: any = await cmsApi.getCategoryTree();
    if (res.code === 200 && res.data) {
      categoryOptions.value = res.data;
    } else {
      ElMessage.warning('栏目列表获取失败');
    }
  } catch (error) {
    console.error('获取栏目列表失败', error);
    ElMessage.error('获取栏目列表失败');
  } finally {
    columnsLoading.value = false;
  }
};

// 处理栏目变更
const handleCategoryChange = async (categoryId: string) => {
  if (!categoryId) return;

  await loadDataByCategory(categoryId);
};

// 加载文章与轮播图数据（仅用于预览，不保存到配置中）
const loadDataByCategory = async (categoryId: string) => {
  if (!categoryId) return;

  // 分别设置两种数据的加载状态
  articlesLoading.value = true;
  carouselsLoading.value = true;

  // 获取文章列表数据（仅用于预览）
  try {
    const articlesRes: any = await cmsApi.getUserArticlesByCategory(categoryId);
    if (articlesRes.code === 200 && articlesRes.data?.records) {
      // 将数据保存到本地变量用于预览，不保存到modelValue
      previewListItems.value = articlesRes.data.records;
    } else {
      ElMessage.warning('列表数据获取失败');
      previewListItems.value = [];
    }
  } catch (error) {
    console.error('获取列表数据失败', error);
    ElMessage.error('获取列表数据失败');
    previewListItems.value = [];
  } finally {
    articlesLoading.value = false;
  }

  // 获取轮播图数据（仅用于预览）
  try {
    const carouselsRes: any =
      await cmsApi.getUserCarouselsByCategory(categoryId);
    if (carouselsRes.code === 200 && carouselsRes.data?.records) {
      // 将数据保存到本地变量用于预览，不保存到modelValue
      const maxItems = modelValue.value.maxItems || 5;
      previewCarouselItems.value = carouselsRes.data.records.slice(0, maxItems);
    } else {
      ElMessage.warning('轮播图数据获取失败');
      previewCarouselItems.value = [];
    }
  } catch (error) {
    console.error('获取轮播图数据失败', error);
    ElMessage.error('获取轮播图数据失败');
    previewCarouselItems.value = [];
  } finally {
    carouselsLoading.value = false;
  }
};

// 手动刷新数据
const handleRefresh = () => {
  if (modelValue.value?.categoryId) {
    loadDataByCategory(modelValue.value.categoryId);
  } else {
    ElMessage.warning('请先选择栏目');
  }
};

onMounted(async () => {
  await loadColumns();

  // 如果已有选中的栏目，则加载对应的数据
  if (modelValue.value?.categoryId) {
    loadDataByCategory(modelValue.value.categoryId);
  }
});
</script>

<style scoped>
.carousel-config {
  --config-border: #e2e8f0;
  --config-surface: #f8fafc;
  --config-surface-strong: #fff;
  --config-text: #0f172a;
  --config-muted: #64748b;

  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.carousel-config :deep(.el-divider__text) {
  font-weight: 600;
  color: var(--config-text);
  letter-spacing: 0.2px;
}

.carousel-config :deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--config-muted);
}

.form-item-with-tip {
  display: flex;
  flex-direction: column;
}

.form-tip {
  margin-top: 5px;
  font-size: 12px;
  color: var(--config-muted);
  line-height: 1.4;
}

/* 隐藏实际的radio组件 */
.hidden-radio-group {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.layout-options-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 10px;
}

.layout-option {
  border: 2px solid transparent;
  border-radius: 4px;
  padding: 8px;
  width: 90px;
  transition: all 0.3s;
  cursor: pointer;
}

.layout-option.active {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.layout-preview {
  position: relative;
  display: flex;
  overflow: hidden;
  margin-bottom: 5px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 5px;
  height: 80px;
  background-color: #f5f7fa;
}

/* 图片在左布局 */
.layout-preview.image-left {
  flex-direction: row;
}

.layout-preview.image-left .layout-preview-carousel {
  margin-right: 5px;
  width: 40%;
  background-color: #be0108;
}

.layout-preview.image-left .layout-preview-list {
  width: 60%;
}

/* 图片在右布局 */
.layout-preview.image-right {
  flex-direction: row-reverse;
}

.layout-preview.image-right .layout-preview-carousel {
  margin-left: 5px;
  width: 40%;
  background-color: #be0108;
}

.layout-preview.image-right .layout-preview-list {
  width: 60%;
}

/* 图片在上布局 */
.layout-preview.image-top {
  flex-direction: column;
}

.layout-preview.image-top .layout-preview-carousel {
  margin-bottom: 5px;
  height: 40%;
  background-color: #be0108;
}

.layout-preview.image-top .layout-preview-list {
  height: 60%;
}

.layout-preview-carousel {
  border-radius: 2px;
}

.layout-preview-list {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.list-line {
  border-radius: 2px;
  height: 4px;
  background-color: #dcdfe6;
}

.layout-name {
  font-size: 12px;
  text-align: center;
  color: #606266;
}
</style>
