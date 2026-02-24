<template>
  <LayoutDisplay layout="no-image" :schema="props.schema" use-default-title>
    <template #content>
      <div class="card-list" :style="listStyleObj">
        <ListEmpty v-if="items.length === 0" />
        <div
          v-for="(item, index) in items"
          :key="item.id || index"
          class="card-item"
          :style="cardStyleObj"
          @click="handleItemClick(item)"
        >
          <div class="card-title" :style="titleStyleObj">
            {{ formatTitle(item.articleTitle) }}
          </div>
        </div>
      </div>
    </template>
  </LayoutDisplay>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';
import { useRouter } from 'vue-router';
import LayoutDisplay from '../common/layout/LayoutDisplay.vue';
import ListEmpty from '../common/list/ListEmpty.vue';
import cardBg from './card-bg.svg';

interface CardItem {
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

const BASE_WIDTH = 130;
const BASE_HEIGHT = 172.60546875;
const BASE_RATIO = BASE_HEIGHT / BASE_WIDTH;

const dataSource = computed(() => props.schema?.content?.dataSource || {});

const toPositiveNumber = (value: unknown, fallback: number) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : fallback;
};

const toNonNegativeNumber = (value: unknown, fallback: number) => {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? num : fallback;
};

const maxDisplayCount = computed(() =>
  toPositiveNumber(dataSource.value.maxDisplayCount, 6)
);

const cardWidth = computed(() =>
  toPositiveNumber(dataSource.value.cardWidth, BASE_WIDTH)
);

const cardGap = computed(() =>
  toNonNegativeNumber(dataSource.value.cardGap, 56)
);

const titleFontSize = computed(() =>
  toPositiveNumber(dataSource.value.titleFontSize, 14)
);

const titleFontWeight = computed(() =>
  toPositiveNumber(dataSource.value.titleFontWeight, 700)
);

const titleColor = computed(() => dataSource.value.titleColor || '#B7724D');

const titleMaxChars = computed(() =>
  toPositiveNumber(dataSource.value.titleMaxChars, 10)
);

const cardHeight = computed(() => cardWidth.value * BASE_RATIO);

const items = computed<CardItem[]>(() => {
  const allItems = Array.isArray(dataSource.value.items)
    ? dataSource.value.items
    : [];
  return allItems.slice(0, maxDisplayCount.value);
});

const listStyleObj = computed<CSSProperties>(() => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  gap: `${cardGap.value}px`,
  alignItems: 'flex-start',
  width: '100%',
  overflowX: 'auto',
  overflowY: 'hidden'
}));

const cardStyleObj = computed<CSSProperties>(() => ({
  width: `${cardWidth.value}px`,
  height: `${cardHeight.value}px`,
  backgroundImage: `url(${cardBg})`,
  backgroundSize: '100% 100%',
  backgroundRepeat: 'no-repeat',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer'
}));

const titleStyleObj = computed<CSSProperties>(() => ({
  color: titleColor.value,
  fontSize: `${titleFontSize.value}px`,
  fontWeight: String(titleFontWeight.value),
  textAlign: 'center',
  lineHeight: '1.4',
  padding: '0 12px',
  wordBreak: 'break-all'
}));

const formatTitle = (title?: string) => {
  const value = title || '';
  const maxChars = titleMaxChars.value;
  if (!maxChars) return value;
  const chars = Array.from(value);
  if (chars.length <= maxChars) return value;
  return `${chars.slice(0, maxChars).join('')}…`;
};

const handleItemClick = (item: CardItem) => {
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
  name: 'pb-document-card-list-index'
});
</script>

<style scoped>
.card-list {
  padding-bottom: 4px;
  min-height: 40px;
}
</style>
