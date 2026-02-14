<template>
  <div class="pb-base-title" :style="containerStyleObj">
    <!-- 简单样式：通长下划线，标题下方加粗 -->
    <div
      v-if="titleStyle === 'simple'"
      class="title-wrapper title-simple-wrapper"
      :style="titleWrapperStyleObj"
    >
      <div class="title-container">
        <div class="title" :style="titleStyleObj">{{ title }}</div>
        <div class="title-underline" :style="underlineStyleObj">
          <div class="title-underline-bold" :style="underlineBoldStyleObj" />
        </div>
      </div>
      <div v-if="showMore" class="more-link simple-more">
        <span :style="moreLinkStyleObj" @click="handleMoreClick">更多>></span>
      </div>
    </div>

    <!-- 蓝色简约样式：左对齐标题 + 条纹线 -->
    <div
      v-else-if="titleStyle === 'blue-simple'"
      class="title-wrapper title-blue-wrapper"
    >
      <div class="blue-title-row">
        <div class="title blue-title" :style="blueTitleStyleObj">
          {{ title }}
        </div>
        <div v-if="showMore" class="more-link blue-more">
          <span :style="blueMoreLinkStyleObj" @click="handleMoreClick">更多</span>
        </div>
      </div>
      <TitleStripeDisplay
        class="blue-underline"
        :height="stripeHeight"
        :width="stripeWidth"
        :accent-count="stripeAccentCount"
        :accent-color="stripeAccentColor"
        :base-color="stripeBaseColor"
      />
    </div>

    <!-- 装饰样式：两侧渐变线条和菱形 -->
    <div
      v-else
      class="title-wrapper title-decorated-wrapper"
      :style="titleWrapperStyleObj"
    >
      <div class="line-container left">
        <div class="line-gradient left" :style="leftLineGradientStyle" />
        <div class="diamond-container left">
          <div
            class="diamond diamond-small left"
            :style="diamondStyleSmallLeft"
          />
          <div
            class="diamond diamond-large left"
            :style="diamondStyleLargeLeft"
          />
        </div>
      </div>
      <div class="title" :style="titleStyleObj">{{ title }}</div>
      <div class="line-container right">
        <div class="diamond-container right">
          <div
            class="diamond diamond-large right"
            :style="diamondStyleLargeRight"
          />
          <div
            class="diamond diamond-small right"
            :style="diamondStyleSmallRight"
          />
        </div>
        <div class="line-gradient right" :style="rightLineGradientStyle" />
      </div>
      <div v-if="showMore" class="more-link">
        <a :href="moreLink" :style="moreLinkStyleObj">更多</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import TitleStripeDisplay from './TitleStripeDisplay.vue';
const router = useRouter();
// 定义props - 直接接收schema对象
const props = defineProps<{
  schema: Record<string, any>; // 接收完整的schema对象
}>();

// 兼容新旧schema结构
const titleData = computed(() => {
  // 如果有content，使用老结构
  if (props.schema?.content?.title) {
    return props.schema.content.title;
  }
  // 否则使用新结构
  return props.schema?.title || {};
});

const styleData = computed(() => {
  // 如果有style.title，使用老结构
  if (props.schema?.style?.title) {
    return props.schema.style.title;
  }
  // 否则使用空对象
  return {};
});

// 内容属性 - 更加严格的空值检查
const title = computed(() => titleData.value?.title || '');
const showMore = computed(() => titleData.value?.showMore || false);
const moreLink = computed(() => titleData.value?.moreLink || '#');
const titleStyle = computed(() => titleData.value?.titleStyle || 'simple');

// 样式 - 移除大部分默认值，仅保留必要的默认值
const titleColor = computed(() => styleData.value?.titleColor);
const titleFontSize = computed(() => {
  const size = styleData.value?.titleFontSize;
  return size ? `${size}px` : undefined;
});
const titleFontWeight = computed(() => styleData.value?.titleFontWeight);
const borderColor = computed(() => styleData.value?.borderColor);
const linkColor = computed(() => styleData.value?.linkColor);
const linkFontSize = computed(() => {
  const size = styleData.value?.linkFontSize;
  return size ? `${size}px` : undefined;
});
const stripeAccentColor = computed(
  () =>
    styleData.value?.stripeAccentColor ||
    styleData.value?.borderColor ||
    styleData.value?.titleColor ||
    '#2B6DE5'
);
const stripeBaseColor = computed(
  () => styleData.value?.stripeBaseColor || '#E2E7F0'
);
const blueTitleColor = computed(
  () => styleData.value?.titleColor || stripeAccentColor.value
);
const lineColor = computed(() => '#BE0009');
// 获取小菱形颜色
const diamondSmallColor = computed(() => borderColor.value || '#eaeaea');

// 容器样式
const containerStyleObj = computed(() => ({
  display: 'block',
  width: '100%'
}));

// 标题包装器样式
const titleWrapperStyleObj = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: titleStyle.value === 'decorated' ? 'center' : 'space-between',
  marginBottom: '24px',
  position: 'relative' as const,
  width: '100%',
  overflow: 'visible',
  borderBottom:
    titleStyle.value === 'simple'
      ? `1px solid ${borderColor.value || '#eaeaea'}`
      : undefined
}));

// 标题样式
const titleStyleObj = computed(() => ({
  fontSize: titleFontSize.value || '18px',
  lineHeight: titleStyle.value === 'simple' ? '24px' : '38px',
  fontWeight: titleFontWeight.value || 'normal',
  color: titleColor.value || '#333',
  margin: titleStyle.value === 'decorated' ? '0 40px' : '0',
  position: 'relative' as const,
  display: titleStyle.value === 'simple' ? 'inline-block' : 'block'
}));

// 下划线样式
const underlineStyleObj = computed(() => ({
  position: 'absolute' as const,
  bottom: 0,
  left: 0,
  width: '100%',
  height: '4px',
  backgroundColor: `${titleColor.value || '#eaeaea'}50` // 使用带透明度的颜色
}));

// 加粗下划线样式
const underlineBoldStyleObj = computed(() => ({
  position: 'absolute' as const,
  bottom: 0,
  left: 0,
  width: '100%',
  height: '3px',
  backgroundColor: titleColor.value || '#eaeaea'
}));

// 渐变线条样式
const getLineGradientStyle = (direction: 'left' | 'right') => ({
  height: '5px',
  background:
    direction === 'left'
      ? `linear-gradient(to right, transparent, ${lineColor.value})`
      : `linear-gradient(to right, ${lineColor.value}, transparent)`,
  width: '100%'
});

// 左右渐变线条样式
const leftLineGradientStyle = computed(() => getLineGradientStyle('left'));
const rightLineGradientStyle = computed(() => getLineGradientStyle('right'));

// 菱形样式基础对象
const getDiamondBaseStyle = (size: string, color: string) => ({
  width: size,
  height: size,
  backgroundColor: color,
  transform: 'rotate(45deg)',
  position: 'absolute' as const
});

// 菱形样式
const diamondStyleSmallLeft = computed(() => ({
  ...getDiamondBaseStyle('6px', diamondSmallColor.value),
  right: '6px',
  top: '6.5px'
}));

const diamondStyleLargeLeft = computed(() => ({
  ...getDiamondBaseStyle('10px', lineColor.value),
  right: '-7px',
  top: '4.5px'
}));

const diamondStyleSmallRight = computed(() => ({
  ...getDiamondBaseStyle('6px', diamondSmallColor.value),
  left: '6px',
  top: '6.5px'
}));

const diamondStyleLargeRight = computed(() => ({
  ...getDiamondBaseStyle('10px', lineColor.value),
  left: '-7px',
  top: '4.5px'
}));

// 更多链接样式
const moreLinkStyleObj = computed(() => ({
  fontSize: linkFontSize.value || '14px',
  color: linkColor.value || '#666',
  textDecoration: 'none',
  whiteSpace: 'nowrap' as const
}));

const blueTitleStyleObj = computed(() => ({
  fontSize: titleFontSize.value || '18px',
  lineHeight: '24px',
  fontWeight: titleFontWeight.value || '600',
  color: blueTitleColor.value,
  margin: '0',
  position: 'relative' as const,
  display: 'inline-block'
}));

const blueMoreLinkStyleObj = computed(() => ({
  fontSize: linkFontSize.value || '14px',
  color: linkColor.value || blueTitleColor.value,
  textDecoration: 'none',
  whiteSpace: 'nowrap' as const,
  cursor: 'pointer'
}));

const toPositiveNumber = (value: unknown, fallback: number) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : fallback;
};

const stripeAccentCount = computed(() => {
  const count = Number(styleData.value?.stripeAccentCount);
  return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
});
const stripeHeight = computed(() =>
  toPositiveNumber(styleData.value?.stripeHeight, 8)
);
const stripeWidth = computed(() =>
  toPositiveNumber(styleData.value?.stripeWidth, 3)
);
const handleMoreClick = () => {
  const categoryId = props.schema?.content?.dataSource?.categoryId;
  const tabId = router.currentRoute.value.params.tabId;
  if (!categoryId) {
    ElMessage.error('请先选择栏目');
    return;
  } else if (moreLink.value) {
    router.push(`${moreLink.value}?categoryId=${categoryId}&tabId=${tabId}`);
    return;
  } else {
    router.push(
      `/frontPortal/cms/list?categoryId=${categoryId}&tabId=${tabId}`
    );
  }
};
defineOptions({ name: 'pb-title-display' });
</script>

<style scoped>
.pb-base-title {
  width: 100%;
  box-sizing: border-box;
}

.title-wrapper {
  position: relative;
  margin-bottom: 24px;
  width: 100%;
  height: 38px;
}

.title-simple-wrapper {
  position: relative;
  align-items: center;
  flex-flow: row nowrap;
}

.title-decorated-wrapper {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.title-blue-wrapper {
  display: flex;
  margin-bottom: 24px;
  height: auto;
  flex-direction: column;
  gap: 8px;
}

.blue-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.blue-underline {
  width: 100%;
}

.more-link.blue-more {
  position: static;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: auto;
  height: auto;
  line-height: 1;
}

.title-container {
  position: relative;
  display: inline-block;
  padding-bottom: 12px;
}

.title {
  white-space: nowrap;
  flex-shrink: 0;
}

.title-underline {
  position: relative;
  width: 100%;
}

.line-container {
  position: relative;
  display: flex;
  align-items: center;
  overflow: visible;
  margin: 0;
  flex: 1;
}

.line-container.left {
  justify-content: flex-end;
}

.line-container.right {
  justify-content: flex-start;
}

.line-gradient {
  overflow: hidden;
}

.line-gradient.left {
  max-width: calc(100% - 40px);
}

.line-gradient.right {
  max-width: calc(100% - 40px);
}

.diamond-container {
  position: relative;
  z-index: 1;
  width: 30px;
  height: 20px;
}

.diamond-container.left {
  margin-left: -15px;
}

.diamond-container.right {
  margin-right: -15px;
}

.more-link {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  width: 80px;
  height: 100%;
  text-align: right;
  line-height: 20px;
}

.simple-more {
  position: static;
  transform: none;
  flex-shrink: 0;
}
</style>
