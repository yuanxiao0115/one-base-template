<template>
  <UnifiedContainerDisplay :content="containerContentConfig" :style="containerStyleConfig">
    <div class="publicity-education">
      <div v-if="tabs.length === 0" class="empty-tip">请先配置栏目标签</div>

      <template v-else>
        <div class="tabs-bar" :style="tabsWrapperStyleObj">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            class="tab-item"
            :class="{ active: tab.id === activeTabId }"
            :style="resolveTabStyle(tab.id === activeTabId)"
            @click="handleTabClick(tab.id)"
          >
            {{ tab.name }}
          </button>
        </div>

        <div v-loading="loading" class="content-wrapper">
          <div v-if="errorMessage" class="error-box">
            <el-icon><Warning /></el-icon>
            <span>{{ errorMessage }}</span>
          </div>

          <div v-else class="content-layout">
            <div class="carousel-panel" :style="carouselPanelStyleObj">
              <el-carousel
                v-if="carouselItems.length > 0"
                class="carousel"
                :height="`${carouselHeight}px`"
                :autoplay="publicityConfig.autoplay"
                :interval="publicityConfig.interval"
                :indicator-position="publicityConfig.indicator ? 'outside' : 'none'"
                :arrow="publicityConfig.arrow"
              >
                <el-carousel-item
                  v-for="item in carouselItems"
                  :key="item.id"
                  class="carousel-item"
                >
                  <el-image
                    :src="resolveCarouselImage(item)"
                    fit="cover"
                    class="carousel-image"
                    @click="handleCarouselClick(item)"
                  >
                    <template #error>
                      <div class="image-error">
                        <el-icon><Picture /></el-icon>
                        <span>暂无图片</span>
                      </div>
                    </template>
                  </el-image>
                  <div
                    class="carousel-title"
                    :style="carouselTitleStyleObj"
                    :title="item.carouselTitle"
                  >
                    {{ item.carouselTitle || '未命名轮播图' }}
                  </div>
                </el-carousel-item>
              </el-carousel>

              <div v-else class="empty-box">
                <el-empty :image-size="72" description="暂无轮播图数据" />
              </div>
            </div>

            <div class="list-panel">
              <div v-if="articleItems.length > 0" class="article-list">
                <div
                  v-for="item in articleItems"
                  :key="item.id"
                  class="article-row"
                  :class="{ 'row-divider': publicityConfig.showRowDivider }"
                  :style="rowStyleObj"
                  @click="handleArticleClick(item)"
                >
                  <span
                    v-if="publicityConfig.showRowDot"
                    class="article-dot"
                    :style="dotStyleObj"
                  />
                  <span class="article-title" :style="titleStyleObj" :title="item.articleTitle">
                    {{ item.articleTitle || '未命名文章' }}
                  </span>
                  <span class="article-time" :style="timeStyleObj">
                    {{ formatDate(item.publishTime) }}
                  </span>
                </div>
              </div>

              <div v-else class="empty-box">
                <el-empty :image-size="48" description="暂无文章数据" />
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </UnifiedContainerDisplay>
</template>

<script setup lang="ts">
import { computed, ref, watch, type CSSProperties } from 'vue';
import { useRouter } from 'vue-router';
import { Picture, Warning } from '@element-plus/icons-vue';
import { UnifiedContainerDisplay } from '../../common/unified-container';
import type {
  UnifiedContainerContentConfigModel,
  UnifiedContainerStyleConfigModel
} from '../../common/unified-container';
import { cmsApi } from '../../api';
import { navigatePortalCmsDetail } from '../../navigation';
import { message } from '../common/message';
import {
  normalizeImageSource,
  toNonNegativeNumber,
  toPositiveNumber
} from '../../base/common/material-utils';

interface PublicityTabConfig {
  id: string;
  name: string;
  categoryId: string;
}

interface PublicityContentConfig {
  tabs?: PublicityTabConfig[];
  activeTabId?: string;
  carouselMaxItems?: number;
  listMaxItems?: number;
  autoplay?: boolean;
  interval?: number;
  indicator?: boolean;
  arrow?: 'always' | 'hover' | 'never';
  showRowDot?: boolean;
  showRowDivider?: boolean;
}

interface PublicityStyleConfig {
  tabTextColor?: string;
  tabActiveTextColor?: string;
  tabBgColor?: string;
  tabActiveBgColor?: string;
  tabActiveBorderColor?: string;
  tabFontSize?: number;
  tabGap?: number;
  tabPaddingY?: number;
  tabPaddingX?: number;
  carouselHeight?: number;
  carouselBorderRadius?: number;
  carouselTitleColor?: string;
  carouselTitleBgColor?: string;
  carouselTitleFontSize?: number;
  dotColor?: string;
  listTitleColor?: string;
  listTimeColor?: string;
  listTitleFontSize?: number;
  listTimeFontSize?: number;
  listDividerColor?: string;
  listHoverBgColor?: string;
  listRowPaddingY?: number;
}

interface PublicityEducationSchema {
  content?: {
    container?: Partial<UnifiedContainerContentConfigModel>;
    publicity?: PublicityContentConfig;
  };
  style?: {
    container?: Partial<UnifiedContainerStyleConfigModel>;
    publicity?: PublicityStyleConfig;
  };
}

interface CarouselRecord {
  id: string;
  carouselTitle?: string;
  carouselUrl?: string;
  coverUrl?: string;
}

interface ArticleRecord {
  id: string;
  articleTitle: string;
  publishTime?: string;
}

const DEFAULT_TABS: PublicityTabConfig[] = [
  { id: 'tab-1', name: '政治理论', categoryId: '' },
  { id: 'tab-2', name: '法制宣传', categoryId: '' },
  { id: 'tab-3', name: '反诈与防范', categoryId: '' }
];

const props = defineProps<{
  schema: PublicityEducationSchema;
}>();

let router: ReturnType<typeof useRouter> | null = null;
try {
  router = useRouter();
} catch {
  router = null;
}

const containerContentConfig = computed(() => props.schema?.content?.container);
const containerStyleConfig = computed(() => props.schema?.style?.container);

const publicityConfig = computed(() => {
  const raw = props.schema?.content?.publicity || {};
  return {
    tabs: normalizeTabs(raw.tabs),
    activeTabId: String(raw.activeTabId || ''),
    carouselMaxItems: Math.max(1, toPositiveNumber(raw.carouselMaxItems, 5)),
    listMaxItems: Math.max(1, toPositiveNumber(raw.listMaxItems, 5)),
    autoplay: raw.autoplay !== false,
    interval: Math.min(10000, Math.max(1000, toPositiveNumber(raw.interval, 3000))),
    indicator: raw.indicator === true,
    arrow: raw.arrow === 'always' || raw.arrow === 'never' ? raw.arrow : 'hover',
    showRowDot: raw.showRowDot !== false,
    showRowDivider: raw.showRowDivider !== false
  };
});

const publicityStyle = computed(() => props.schema?.style?.publicity || {});
const tabs = computed(() => publicityConfig.value.tabs);

const activeTabId = ref('');
const loading = ref(false);
const errorMessage = ref('');

const rawCarousels = ref<CarouselRecord[]>([]);
const rawArticles = ref<ArticleRecord[]>([]);
const tabCache = ref<Record<string, { carousels: CarouselRecord[]; articles: ArticleRecord[] }>>(
  {}
);

watch(
  [tabs, () => publicityConfig.value.activeTabId],
  ([nextTabs, configActiveId]) => {
    if (!nextTabs.length) {
      activeTabId.value = '';
      return;
    }

    if (nextTabs.some((tab) => tab.id === activeTabId.value)) {
      return;
    }

    const preferredId =
      configActiveId && nextTabs.some((tab) => tab.id === configActiveId) ? configActiveId : '';

    activeTabId.value = preferredId || nextTabs[0]?.id || '';
  },
  {
    immediate: true,
    deep: true
  }
);

const activeTab = computed(() => tabs.value.find((tab) => tab.id === activeTabId.value) || null);
const activeCategoryId = computed(() => String(activeTab.value?.categoryId || ''));

const carouselItems = computed(() =>
  rawCarousels.value.slice(0, publicityConfig.value.carouselMaxItems)
);
const articleItems = computed(() => rawArticles.value.slice(0, publicityConfig.value.listMaxItems));

const tabsWrapperStyleObj = computed<CSSProperties>(() => ({
  gap: `${toNonNegativeNumber(publicityStyle.value.tabGap, 8)}px`
}));

function resolveTabStyle(isActive: boolean): CSSProperties {
  return {
    color: isActive
      ? publicityStyle.value.tabActiveTextColor || '#409eff'
      : publicityStyle.value.tabTextColor || '#606266',
    background: isActive
      ? publicityStyle.value.tabActiveBgColor || 'transparent'
      : publicityStyle.value.tabBgColor || 'transparent',
    borderBottomColor: isActive
      ? publicityStyle.value.tabActiveBorderColor || '#409eff'
      : 'transparent',
    fontSize: `${Math.max(12, toPositiveNumber(publicityStyle.value.tabFontSize, 14))}px`,
    padding: `${toNonNegativeNumber(publicityStyle.value.tabPaddingY, 10)}px ${toNonNegativeNumber(
      publicityStyle.value.tabPaddingX,
      8
    )}px`
  };
}

const carouselHeight = computed(() =>
  Math.max(120, toPositiveNumber(publicityStyle.value.carouselHeight, 220))
);

const carouselPanelStyleObj = computed<CSSProperties>(() => ({
  borderRadius: `${toNonNegativeNumber(publicityStyle.value.carouselBorderRadius, 4)}px`
}));

const carouselTitleStyleObj = computed<CSSProperties>(() => ({
  color: publicityStyle.value.carouselTitleColor || '#ffffff',
  background:
    publicityStyle.value.carouselTitleBgColor ||
    'linear-gradient(180deg, rgb(0 0 0 / 0%) 0%, rgb(0 0 0 / 72%) 100%)',
  fontSize: `${Math.max(12, toPositiveNumber(publicityStyle.value.carouselTitleFontSize, 14))}px`
}));

const dotStyleObj = computed<CSSProperties>(() => ({
  background: publicityStyle.value.dotColor || '#7a7d83'
}));

const titleStyleObj = computed<CSSProperties>(() => ({
  color: publicityStyle.value.listTitleColor || '#303133',
  fontSize: `${Math.max(12, toPositiveNumber(publicityStyle.value.listTitleFontSize, 15))}px`
}));

const timeStyleObj = computed<CSSProperties>(() => ({
  color: publicityStyle.value.listTimeColor || '#909399',
  fontSize: `${Math.max(12, toPositiveNumber(publicityStyle.value.listTimeFontSize, 14))}px`
}));

const rowStyleObj = computed<CSSProperties>(() => ({
  '--publicity-list-divider-color': publicityStyle.value.listDividerColor || '#ebeef5',
  '--publicity-list-hover-bg': publicityStyle.value.listHoverBgColor || '#f7f8fa',
  paddingTop: `${toNonNegativeNumber(publicityStyle.value.listRowPaddingY, 12)}px`,
  paddingBottom: `${toNonNegativeNumber(publicityStyle.value.listRowPaddingY, 12)}px`
}));

watch(
  activeCategoryId,
  (nextCategoryId) => {
    void loadCategoryData(nextCategoryId);
  },
  {
    immediate: true
  }
);

function handleTabClick(tabId: string) {
  activeTabId.value = tabId;
}

function normalizeTabs(value: unknown): PublicityTabConfig[] {
  if (!Array.isArray(value) || value.length === 0) {
    return DEFAULT_TABS.map((item) => ({ ...item }));
  }

  const normalized = value
    .slice(0, 8)
    .map((item, index) => {
      const source = (item || {}) as Record<string, unknown>;
      return {
        id: String(source.id || `tab-${index + 1}`),
        name: String(source.name || `标签${index + 1}`),
        categoryId: String(source.categoryId || '')
      };
    })
    .filter((item) => item.name.trim().length > 0);

  return normalized.length > 0 ? normalized : DEFAULT_TABS.map((item) => ({ ...item }));
}

async function loadCategoryData(categoryId: string) {
  if (!categoryId) {
    rawCarousels.value = [];
    rawArticles.value = [];
    errorMessage.value = '';
    return;
  }

  const cached = tabCache.value[categoryId];
  if (cached) {
    rawCarousels.value = cached.carousels;
    rawArticles.value = cached.articles;
    errorMessage.value = '';
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    const [carouselsResponse, articlesResponse] = await Promise.all([
      cmsApi.getUserCarouselsByCategory(categoryId),
      cmsApi.getUserArticlesByCategory(categoryId)
    ]);

    const carousels = normalizeCarouselRecords((carouselsResponse as any)?.data?.records);
    const articles = normalizeArticleRecords((articlesResponse as any)?.data?.records);

    tabCache.value[categoryId] = {
      carousels,
      articles
    };

    rawCarousels.value = carousels;
    rawArticles.value = articles;
  } catch (error) {
    console.error('[portal-engine] 宣传教育数据加载失败：', error);
    rawCarousels.value = [];
    rawArticles.value = [];
    errorMessage.value = '数据获取失败';
  } finally {
    loading.value = false;
  }
}

function normalizeCarouselRecords(records: unknown): CarouselRecord[] {
  if (!Array.isArray(records)) {
    return [];
  }

  return records
    .map((item, index) => {
      const row = (item || {}) as Record<string, unknown>;
      return {
        id: String(row.id || `carousel-${index + 1}`),
        carouselTitle: String(row.carouselTitle || row.articleTitle || ''),
        carouselUrl: String(row.carouselUrl || ''),
        coverUrl: String(row.coverUrl || '')
      };
    })
    .filter((item) => Boolean(item.id));
}

function normalizeArticleRecords(records: unknown): ArticleRecord[] {
  if (!Array.isArray(records)) {
    return [];
  }

  return records
    .map((item, index) => {
      const row = (item || {}) as Record<string, unknown>;
      return {
        id: String(row.id || `article-${index + 1}`),
        articleTitle: String(row.articleTitle || row.carouselTitle || '未命名文章'),
        publishTime: String(row.publishTime || '')
      };
    })
    .filter((item) => Boolean(item.id));
}

function resolveCarouselImage(item: CarouselRecord): string {
  return (
    normalizeImageSource(item.coverUrl || item.carouselUrl) ||
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjMyMCIgdmlld0JveD0iMCAwIDYwMCAzMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSIzMjAiIGZpbGw9IiNlNWU3ZWIiLz48dGV4dCB4PSIzMDAiIHk9IjE2MCIgZmlsbD0iIzY0NzQ4YiIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5pqC5peg5Zu+54mHPC90ZXh0Pjwvc3ZnPg=='
  );
}

async function handleCarouselClick(item: CarouselRecord) {
  if (!item.id) {
    return;
  }
  await handleCmsDetailOpen(item.id);
}

async function handleArticleClick(item: ArticleRecord) {
  if (!item.id) {
    return;
  }
  await handleCmsDetailOpen(item.id);
}

async function handleCmsDetailOpen(articleId: string) {
  if (!router) {
    return;
  }

  const rawTabId = router.currentRoute.value.params.tabId;
  const result = await navigatePortalCmsDetail({
    router,
    articleId,
    categoryId: activeCategoryId.value,
    tabId: typeof rawTabId === 'string' ? rawTabId : undefined
  });

  if (!result.handled) {
    message.error(result.message || '当前应用未配置 CMS 详情跳转');
  }
}

function formatDate(value?: string): string {
  if (!value) {
    return '';
  }
  return String(value).split(' ')[0]?.replace(/-/g, '/') || String(value);
}

defineOptions({
  name: 'cms-publicity-education-index'
});
</script>

<style scoped lang="scss">
.publicity-education {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  flex-direction: column;
}

.tabs-bar {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 4px;
  min-height: 42px;
  flex-shrink: 0;
}

.tab-item {
  border: none;
  border-bottom: 2px solid transparent;
  min-width: 0;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  line-height: 1.3;

  &.active {
    font-weight: 600;
  }
}

.content-wrapper {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
}

.content-layout {
  display: grid;
  width: 100%;
  height: 100%;
  min-height: 0;
  grid-template-columns: minmax(260px, 38%) minmax(0, 1fr);
  gap: 20px;
  padding-top: 16px;
}

.carousel-panel,
.list-panel {
  min-height: 0;
}

.carousel-panel {
  overflow: hidden;
}

.carousel,
.carousel-item,
.carousel-image {
  width: 100%;
  height: 100%;
}

.carousel-item {
  position: relative;
}

.carousel-title {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
  padding: 10px 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-error,
.error-box,
.empty-box,
.empty-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #909399;
  flex-direction: column;
  gap: 8px;
}

.error-box {
  color: #f56c6c;
}

.list-panel {
  overflow: hidden;
}

.article-list {
  overflow: auto;
  height: 100%;
}

.article-row {
  display: grid;
  align-items: center;
  width: 100%;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  cursor: pointer;
}

.row-divider {
  border-bottom: 1px solid var(--publicity-list-divider-color, #ebeef5);
}

.article-row:hover {
  background: var(--publicity-list-hover-bg, #f7f8fa);
}

.article-dot {
  border-radius: 50%;
  width: 6px;
  height: 6px;
}

.article-title {
  overflow: hidden;
  min-width: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 24px;
}

.article-time {
  flex-shrink: 0;
  white-space: nowrap;
  line-height: 24px;
}

@media (max-width: 1200px) {
  .content-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .carousel-panel {
    min-height: 220px;
  }
}
</style>
