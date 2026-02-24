<template>
  <LayoutDisplay layout="no-image" :schema="props.schema" hide-title>
    <template #content>
      <div
        class="image-text-column"
        :class="{ 'image-right': imagePosition === 'right' }"
      >
        <div class="column-image" :style="imageBackgroundStyleObj">
          <div v-if="!imageUrl" class="image-placeholder">暂无图片</div>
          <button
            v-if="showMore"
            class="image-more"
            type="button"
            :style="moreStyleObj"
            @click.stop="handleMoreClick"
          >
            {{ moreText }}
          </button>
        </div>

        <ListStyleDisplay class="column-list" :styles="listStyle">
          <ListEmpty v-if="items.length === 0" />
          <ListItem
            v-for="(item, index) in items"
            :key="item.id || index"
            class="list-item"
            clickable
            @click="handleItemClick(item)"
          >
            <ListTitle
              class="item-title"
              :text="item.articleTitle"
              :show-dot="showDot"
            />
            <ListDate
              v-if="item.publishTime"
              class="item-date"
              :text="formatDate(item.publishTime)"
              inline
            />
          </ListItem>
        </ListStyleDisplay>
      </div>
    </template>
  </LayoutDisplay>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import LayoutDisplay from '../common/layout/LayoutDisplay.vue';
import ListEmpty from '../common/list/ListEmpty.vue';
import ListItem from '../common/list/ListItem.vue';
import ListDate from '../common/list/ListDate.vue';
import ListTitle from '../common/list/ListTitle.vue';
import ListStyleDisplay from '../common/list-style/ListStyleDisplay.vue';
import type { ListStyleModelType } from '../common/list-style/types';

interface ColumnItem {
  id: string;
  articleTitle: string;
  linkUrl?: string;
  publishTime?: string;
}

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

const router = useRouter();

const dataSource = computed(() => props.schema?.content?.dataSource || {});
const imageConfig = computed(() => props.schema?.content?.image || {});

const toPositiveNumber = (value: unknown, fallback: number) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : fallback;
};

const toNonNegativeNumber = (value: unknown, fallback: number) => {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? num : fallback;
};

const maxDisplayCount = computed(() =>
  toPositiveNumber(dataSource.value.maxDisplayCount, 10)
);

const items = computed<ColumnItem[]>(() => {
  const allItems = Array.isArray(dataSource.value.items)
    ? dataSource.value.items
    : [];
  return allItems.slice(0, maxDisplayCount.value);
});

const showDot = computed(() => dataSource.value.showDot ?? true);

const imagePosition = computed(() => imageConfig.value.imagePosition || 'left');
const imageWidth = computed(() =>
  toPositiveNumber(imageConfig.value.imageWidth, 160)
);
const imageHeight = computed(() =>
  toPositiveNumber(imageConfig.value.imageHeight, 220)
);
const imageBorderRadius = computed(() =>
  toNonNegativeNumber(imageConfig.value.imageBorderRadius, 0)
);
const imageRepeat = computed(
  () => imageConfig.value.imageRepeat || 'no-repeat'
);
const imageSize = computed(() => imageConfig.value.imageSize || 'cover');
const imageBgPosition = computed(
  () => imageConfig.value.imageBgPosition || 'center'
);
const showMore = computed(() => imageConfig.value.showMore ?? true);
const moreText = computed(() => imageConfig.value.moreText || '更多>');
const moreLink = computed(() => imageConfig.value.moreLink || '');
const moreTextColor = computed(
  () => imageConfig.value.moreTextColor || '#ffffff'
);
const moreFontSize = computed(() =>
  toPositiveNumber(imageConfig.value.moreFontSize, 14)
);
const moreBgColor = computed(
  () => imageConfig.value.moreBgColor || 'transparent'
);
const morePaddingX = computed(() =>
  toNonNegativeNumber(imageConfig.value.morePaddingX, 8)
);
const morePaddingY = computed(() =>
  toNonNegativeNumber(imageConfig.value.morePaddingY, 4)
);
const moreBorderRadius = computed(() =>
  toNonNegativeNumber(imageConfig.value.moreBorderRadius, 0)
);
const moreAlign = computed(() => imageConfig.value.moreAlign || 'right');
const moreOffsetX = computed(() =>
  toNonNegativeNumber(imageConfig.value.moreOffsetX, 12)
);
const moreOffsetY = computed(() =>
  toNonNegativeNumber(imageConfig.value.moreOffsetY, 12)
);

const listStyle = computed<ListStyleModelType>(
  () => props.schema?.style?.list || {}
);
const imageBackgroundStyleObj = computed(() => ({
  width: `${imageWidth.value}px`,
  height: `${imageHeight.value}px`,
  borderRadius: `${imageBorderRadius.value}px`,
  backgroundImage: imageUrl.value ? `url(${imageUrl.value})` : 'none',
  backgroundRepeat: imageRepeat.value,
  backgroundSize: imageRepeat.value === 'no-repeat' ? imageSize.value : 'auto',
  backgroundPosition: imageBgPosition.value
}));

const moreStyleObj = computed(() => ({
  color: moreTextColor.value,
  fontSize: `${moreFontSize.value}px`,
  backgroundColor: moreBgColor.value,
  padding: `${morePaddingY.value}px ${morePaddingX.value}px`,
  borderRadius: `${moreBorderRadius.value}px`,
  right: moreAlign.value === 'right' ? `${moreOffsetX.value}px` : undefined,
  left: moreAlign.value === 'left' ? `${moreOffsetX.value}px` : undefined,
  bottom: `${moreOffsetY.value}px`
}));

const getImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `/cmict/file/resource/show?id=${url}`;
};

const imageUrl = computed(() => getImageUrl(imageConfig.value.imageUrl));

const formatDate = (value: string) => {
  if (!value) return '';
  return value.split(' ')[0];
};

const handleMoreClick = () => {
  const categoryId = dataSource.value.categoryId;
  const tabId = router.currentRoute.value.params.tabId;
  if (!categoryId) {
    ElMessage.error('请先选择栏目');
    return;
  }
  if (moreLink.value) {
    router.push(`${moreLink.value}?categoryId=${categoryId}&tabId=${tabId}`);
    return;
  }
  router.push(`/frontPortal/cms/list?categoryId=${categoryId}&tabId=${tabId}`);
};

const handleItemClick = (item: ColumnItem) => {
  if (!item?.id) return;
  router.push({
    name: 'portalPreviewCmsDetail',
    query: {
      articleId: item.id,
      categoryId: dataSource.value.categoryId
    }
  });
};

defineOptions({
  name: 'pb-image-text-column-index'
});
</script>

<style scoped>
.image-text-column {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  width: 100%;
}

.image-text-column.image-right {
  flex-direction: row-reverse;
}

.column-image {
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
  background-color: #f5f7fa;
}

.image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  font-size: 14px;
  color: #909399;
}

.image-more {
  position: absolute;
  border: none;
  background: transparent;
  text-shadow: 0 2px 6px rgb(0 0 0 / 40%);
  transition: opacity 0.2s ease;
  cursor: pointer;
}

.image-more:hover {
  opacity: 0.85;
}

.column-list {
  --list-dot-size: 6px;
  --list-dot-color: #2b6de5;
  --list-title-hover-color: #2b6de5;
  --list-divider-width: 1px;
  --list-divider-style: dashed;
  --list-divider-color: #eef0f3;

  flex: 1;
  min-width: 0;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--list-row-padding-y, 8px) 0;
  gap: 16px;
  cursor: pointer;
}

.list-item :deep(.item-title) {
  flex: 1;
}

.list-item:hover :deep(.item-title) {
  color: var(--list-title-hover-color, #2b6de5);
}

.list-item :deep(.item-date) {
  margin-top: 0;
  font-size: var(--list-date-font-size, 14px);
  white-space: nowrap;
  color: var(--list-date-color, #909399);
}
</style>
