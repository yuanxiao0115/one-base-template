<template>
  <LayoutDisplay layout="carousel-left" :schema="props.schema" use-default-title>
    <!-- 轮播图区域 -->
    <template #carousel>
      <!-- 加载状态 -->
      <div v-if="dataLoading" class="loading-container">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
      <!-- 错误状态 -->
      <div v-else-if="dataError" class="error-container">
        <el-icon><Warning /></el-icon>
        <span>{{ dataError }}</span>
      </div>
      <!-- 轮播图内容 -->
      <el-carousel
        v-else-if="carouselItems.length > 0"
        height="100%"
        v-bind="carouselConfig"
        :indicator-position="carouselConfig.indicator ? 'outside' : 'none'"
        class="carousel-container"
        @change="handleCarouselChange"
      >
        <el-carousel-item v-for="item in carouselItems" :key="item.id">
          <div class="carousel-item">
            <el-image
              :src="`/cmict/file/resource/show?id=${item.carouselUrl}`"
              :fit="carouselStyle.imageFit"
              class="carousel-image"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                  <span>暂无图片</span>
                </div>
              </template>
            </el-image>
            <div
              v-if="carouselStyle.showTitle && item.carouselTitle"
              class="carousel-title"
              :style="getTitleStyle"
            >
              <span class="title-text">{{ item.carouselTitle }}</span>
              <span
                class="page-indicator"
                :style="{ color: carouselStyle.pageIndicatorColor }"
              >
                {{ activeIndex + 1 }}
              </span>
              <span> / {{ carouselItems.length }} </span>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
      <div v-else class="empty-carousel">
        <el-empty :image-size="80" description="暂无轮播图数据" />
      </div>
    </template>

    <!-- 列表区域 -->
    <template #content>
      <template v-if="listItems.length > 0">
        <div
          v-for="item in listItems"
          :key="item.id"
          class="list-item"
          :style="{ marginBottom: `${listStyle.itemSpacing}px` }"
        >
          <div class="item-content" @click="handleItemClick(item)">
            <div class="item-dot" />
            <div
              class="item-title"
              :style="getTitleTextStyle"
              :title="item.articleTitle"
            >
              {{ item.articleTitle }}
            </div>
            <div class="item-date" :style="getDateStyle">
              {{ item.publishTime.split(" ")[0] }}
            </div>
          </div>
        </div>
      </template>
      <el-empty v-else :image-size="40" description="暂无列表数据" />
    </template>
  </LayoutDisplay>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Picture, Loading, Warning } from '@element-plus/icons-vue';
import LayoutDisplay from '../common/layout/LayoutDisplay.vue';
import { useRouter } from 'vue-router';
import { cmsApi } from '../../../api';

// 数据类型定义
interface CarouselItem {
  id: string;
  carouselTitle: string;
  carouselUrl: string;
  linkUrl?: string;
  publishTime?: string;
}

interface ListItem {
  id: string;
  articleTitle: string;
  linkUrl: string;
  publishTime: string;
}

const props = defineProps({
  schema: {
    type: Object,
    required: true,
    default: () => ({})
  }
});
const router = useRouter();

// 动态数据状态
const dynamicCarouselItems = ref<CarouselItem[]>([]);
const dynamicListItems = ref<ListItem[]>([]);
const dataLoading = ref(false);
const dataError = ref<string | null>(null);
// 请求去重：记录当前正在请求的 categoryId
const loadingCategoryId = ref<string | null>(null);
// 当前活动的轮播图索引
const activeIndex = ref(0);

// 轮播图切换事件处理
const handleCarouselChange = (index: number) => {
  activeIndex.value = index;
};

// 根据categoryId获取数据
const loadDataByCategory = async (categoryId: string) => {
  if (!categoryId) {
    dynamicCarouselItems.value = [];
    dynamicListItems.value = [];
    loadingCategoryId.value = null;
    return;
  }

  // 请求去重：如果正在请求相同的 categoryId，则跳过
  if (dataLoading.value && loadingCategoryId.value === categoryId) {
    return;
  }

  dataLoading.value = true;
  dataError.value = null;
  loadingCategoryId.value = categoryId;

  try {
    // 并行获取轮播图和列表数据
    const [carouselsRes, articlesRes] = await Promise.all([
      cmsApi.getUserCarouselsByCategory(categoryId),
      cmsApi.getUserArticlesByCategory(categoryId)
    ]);

    // 处理轮播图数据
    if (
      (carouselsRes as any).code === 200 &&
      (carouselsRes as any).data?.records
    ) {
      const maxItems = dataSource.value.maxItems || 5;
      dynamicCarouselItems.value = (carouselsRes as any).data.records.slice(
        0,
        maxItems
      );
    } else {
      dynamicCarouselItems.value = [];
    }

    // 处理列表数据
    if (
      (articlesRes as any).code === 200 &&
      (articlesRes as any).data?.records
    ) {
      const maxItems = dataSource.value.listMaxItems || 10;
      dynamicListItems.value = (articlesRes as any).data.records.slice(
        0,
        maxItems
      );
    } else {
      dynamicListItems.value = [];
    }
  } catch (error) {
    console.error('获取数据失败', error);
    dataError.value = '数据获取失败';
    dynamicCarouselItems.value = [];
    dynamicListItems.value = [];
  } finally {
    dataLoading.value = false;
    loadingCategoryId.value = null;
  }
};

// 数据源和样式
const dataSource = computed(() => props.schema.content?.dataSource || {});
const styleSchema = computed(() => props.schema.style || {});

// 轮播图配置
const carouselConfig = computed(() => ({
  effect: dataSource.value.effect,
  autoplay: dataSource.value.autoplay,
  interval: dataSource.value.interval,
  indicator: dataSource.value.indicator,
  arrow: dataSource.value.arrow
}));

// 轮播图样式
const carouselStyle = computed(() => styleSchema.value?.carousel || {});

// 轮播图标题样式
const getTitleStyle = computed(() => ({
  backgroundColor: carouselStyle.value.titleBackground,
  color: carouselStyle.value.titleColor,
  fontSize: `${carouselStyle.value.titleFontSize}px`
}));

// 轮播图数据 - 使用动态获取的数据
const carouselItems = computed(() => {
  return dynamicCarouselItems.value;
});

// 列表数据 - 使用动态获取的数据
const listItems = computed(() => {
  return dynamicListItems.value;
});

// 列表样式
const listStyle = computed(() => styleSchema.value?.list || {});

const getTitleTextStyle = computed(() => ({
  color: listStyle.value.textColor,
  fontSize: `${listStyle.value.fontSize}px`,
  fontWeight: listStyle.value.fontWeight
}));

const getDateStyle = computed(() => ({
  color: listStyle.value.timeColor,
  fontSize: `${listStyle.value.timeFontSize}px`
}));
const handleItemClick = (item: any) => {
  router.push({
    name: 'portalPreviewCmsDetail',
    query: {
      articleId: item.id,
      categoryId: dataSource.value.categoryId
    }
  });
};

// 监听categoryId变化，自动获取数据
watch(
  () => dataSource.value.categoryId,
  (newCategoryId, oldCategoryId) => {
    // 只有当 categoryId 真正发生变化且有效时才请求数据
    if (newCategoryId && newCategoryId !== oldCategoryId) {
      loadDataByCategory(newCategoryId);
    } else if (!newCategoryId) {
      // 如果 categoryId 被清空，清空数据
      dynamicCarouselItems.value = [];
      dynamicListItems.value = [];
      loadingCategoryId.value = null;
    }
  },
  { immediate: true }
);

defineOptions({
  name: 'pb-carousel-text-list-index'
});
</script>

<style scoped>
.carousel-container {
  height: 100%;
}

.carousel-item {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-image {
  display: block;
  width: 100%;
  height: 100%;
}

.carousel-title {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  padding: 16px;
  height: 56px;
  line-height: 24px;
}

.title-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-indicator {
  margin-right: 4px;
  margin-left: 8px;
  font-weight: bold;
  white-space: nowrap;
}

.image-error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #909399;
  background-color: #f5f7fa;
  flex-direction: column;
  gap: 10px;
}

.list-area {
  overflow-y: auto;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.list-item {
  cursor: pointer;
  padding: 10px 0;
}

.list-item:first-child {
  padding-top: 0;
}

.list-item:last-child {
  padding-bottom: 0;
}

.item-content {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-gap: 8px;
  align-items: center;
  width: 100%;
}

.item-dot {
  border-radius: 50%;
  width: 6px;
  height: 6px;
  background-color: #cdd3d9;
}

/* 加载状态样式 */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  gap: 10px;
  color: #909399;
  background-color: #f5f7fa;
}

.loading-container .el-icon {
  font-size: 24px;
}

.error-container {
  color: #f56c6c;
}

.error-container .el-icon {
  font-size: 24px;
}

.item-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 24px;
}

.item-date {
  text-align: right;
  white-space: nowrap;
}

.empty-carousel {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
}
</style>
