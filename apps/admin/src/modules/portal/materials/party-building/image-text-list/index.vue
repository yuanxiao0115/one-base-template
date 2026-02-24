<template>
  <LayoutDisplay :layout="layout" :schema="props.schema" use-default-title>
    <!-- 内容区域 -->
    <template #content>
      <ListStyleDisplay :styles="styles">
        <ListContainer :column-count="columnCount" :list-type="listType">
          <ListEmpty v-if="items.length === 0" />
          <ListItem
            v-for="(item, index) in items"
            :key="item.id || index"
            clickable
            @click="handleItemClick(item)"
          >
            <ListItemImage
              v-if="listType === 'image-text'"
              :src="getImageUrl(item.coverUrl)"
              :alt="item.articleTitle || '列表图片'"
              :width="imageWidth"
              :height="imageHeight"
              :border-radius="imageBorderRadius"
            />
            <ListItemContent>
              <div
                :class="{
                  'title-with-date': listType !== 'image-text'
                }"
              >
                <ListTitle
                  class="item-title"
                  tag="a"
                  :href="item.linkUrl"
                  target="_blank"
                  :text="item.articleTitle"
                  :show-dot="showDot && listType === 'text-only'"
                />
                <ListDate
                  v-if="
                    item.publishTime &&
                      (listType !== 'image-text' || !item.coverUrl)
                  "
                  class="item-date"
                  :text="formatDate(item.publishTime)"
                  inline
                />
              </div>
              <ListDate
                v-if="
                  item.publishTime && listType === 'image-text' && item.coverUrl
                "
                class="item-date"
                :text="formatDate(item.publishTime)"
              />
            </ListItemContent>
          </ListItem>
        </ListContainer>
      </ListStyleDisplay>
    </template>
  </LayoutDisplay>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LayoutDisplay from '../common/layout/LayoutDisplay.vue';
import { useRouter } from 'vue-router';
import ListContainer from '../common/list/ListContainer.vue';
import ListEmpty from '../common/list/ListEmpty.vue';
import ListItem from '../common/list/ListItem.vue';
import ListItemContent from '../common/list/ListItemContent.vue';
import ListItemImage from '../common/list/ListItemImage.vue';
import ListDate from '../common/list/ListDate.vue';
import ListTitle from '../common/list/ListTitle.vue';
import ListStyleDisplay from '../common/list-style/ListStyleDisplay.vue';
import type { ListStyleModelType } from '../common/list-style/types';
interface StylesObject {
  [key: string]: any;
}

interface ListItemData {
  id: string;
  articleTitle: string;
  coverUrl?: string;
  linkUrl: string;
  publishTime?: string;
}

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});
const router = useRouter();
// 默认图片URL - 可以替换为实际的默认图片路径
const defaultImageUrl = computed(
  () =>
    props.schema?.content?.dataSource?.defaultImageUrl ||
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNTUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YwZjJmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjYWFhYWFhIj7mmoLml6Dlm77niYc8L3RleHQ+PC9zdmc+'
);

// 处理图片URL函数
const getImageUrl = (url?: string) => {
  if (!url) return defaultImageUrl.value;

  // 如果已经是完整URL（以http开头），则直接返回
  if (url.startsWith('http')) {
    return url;
  }
  // 否则，假设是ID，需要拼接成完整路径
  return `/cmict/file/resource/show?id=${url}`;
};
const dataSource = computed(() => props.schema.content?.dataSource || {});
const layout = computed(() => props.schema.content.layout.layout);
// 添加maxDisplayCount的computed属性
const maxDisplayCount = computed(() => {
  return props.schema?.content?.dataSource?.maxDisplayCount;
});

// 修改items的computed属性，增加最大显示条数限制
const items = computed<ListItemData[]>(() => {
  const allItems = props.schema?.content?.dataSource?.items || [];
  return allItems.slice(0, maxDisplayCount.value);
});

const listType = computed(() => {
  return props.schema?.content?.dataSource?.listType;
});

const columnCount = computed(() => {
  return props.schema?.content?.dataSource?.columnCount;
});

const showDot = computed(() => {
  return props.schema?.content?.dataSource?.showDot;
});

const toPositiveNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : undefined;
};

const toNonNegativeNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? num : undefined;
};

// 从schema中获取样式数据，只关注列表样式
const styles = computed<ListStyleModelType & StylesObject>(() => {
  return props.schema?.style?.list || {};
});

const imageWidth = computed(() => toPositiveNumber(styles.value.imageWidth));
const imageHeight = computed(() => toPositiveNumber(styles.value.imageHeight));
const imageBorderRadius = computed(() =>
  toNonNegativeNumber(styles.value.imageBorderRadius)
);

const handleItemClick = (item: any) => {
  router.push({
    name: 'portalPreviewCmsDetail',
    query: {
      articleId: item.id,
      categoryId: dataSource.value.categoryId
    }
  });
};

const formatDate = (value?: string) => {
  if (!value) return '';
  return value.split(' ')[0];
};
// 组件名称定义
defineOptions({
  name: 'pb-image-text-list-index'
});
</script>

<style scoped>
:deep(.pb-list-container.image-text-mode .pb-list-item) {
  margin: 12px 0;
  height: auto;
}

:deep(.pb-list-container.image-text-mode .pb-list-item:first-child) {
  margin-top: 0;
}

.title-with-date {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

/* 通用标题样式 */

/* 纯文本模式下的标题行高 */
:deep(.pb-list-container.text-only-mode .item-title) {
  line-height: 24px;
  padding-left: 2px;
}

/* 图文模式下的标题行高 */
:deep(.pb-list-container.image-text-mode .item-title) {
  line-height: 24px;
  font-weight: normal;
}

.title-with-date :deep(.item-title) {
  flex: 1;
  margin-right: 10px;
}

:deep(.pb-list-item:hover .item-title) {
  color: var(--list-title-hover-color, var(--list-title-color, #d33a31));
}

/* 纯文本模式下的日期样式 */
:deep(.pb-list-container.text-only-mode .item-date) {
  min-width: 45px;
  font-size: var(--list-date-font-size, 14px);
  font-weight: 350;
  text-align: right;
}

/* 图文模式下的日期样式 */
:deep(.pb-list-container.image-text-mode .item-date) {
  font-size: 14px;
  line-height: 20px;
}
</style>
