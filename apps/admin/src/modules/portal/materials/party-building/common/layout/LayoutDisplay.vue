<template>
  <TitleDisplay v-if="!hideTitle && !isSimpleTitle" :schema="schema" />
  <div class="pb-layout-container" :style="containerStyleObj">
    <!-- 无图模式: 标题在上，内容在下 -->

    <template v-if="layout === 'no-image'">
      <!-- 标题区域 -->
      <div v-if="isSimpleTitle && !hideTitle" class="layout-title-area">
        <TitleDisplay :schema="schema" />
      </div>

      <!-- 内容区域 -->
      <div class="layout-content-area" :style="contentContainerStyleObj">
        <slot name="content">
          <div class="placeholder-text">内容区域</div>
        </slot>
      </div>
    </template>

    <!-- 图片在标题上方布局 -->
    <template v-else-if="layout === 'image-top'">
      <!-- 图片区域 -->
      <div class="layout-image-area" :style="imageContainerStyleObj">
        <!-- 优先显示contentImage -->
        <img
          :src="imageUrl || defaultImageUrl"
          class="content-image"
          alt="内容图片"
          style="width: 100%; height: 100%; object-fit: cover"
        >
      </div>

      <!-- 标题区域 -->
      <div v-if="isSimpleTitle && !hideTitle" class="layout-title-area">
        <TitleDisplay :schema="schema" />
      </div>
      <div v-else-if="!hideTitle" class="layout-title-area">
        <slot name="title" />
      </div>

      <!-- 内容区域 -->
      <div class="layout-content-area" :style="contentContainerStyleObj">
        <slot name="content">
          <div class="placeholder-text">内容区域</div>
        </slot>
      </div>
    </template>

    <!-- 图片在标题下方布局 -->
    <template v-else-if="layout === 'image-bottom'">
      <!-- 标题区域 -->
      <div v-if="isSimpleTitle && !hideTitle" class="layout-title-area">
        <TitleDisplay :schema="schema" />
      </div>
      <div v-else-if="!hideTitle" class="layout-title-area">
        <slot name="title" />
      </div>

      <!-- 图片区域 -->
      <div class="layout-image-area" :style="imageContainerStyleObj">
        <!-- 优先显示contentImage -->
        <img
          :src="imageUrl || defaultImageUrl"
          class="content-image"
          alt="内容图片"
          style="width: 100%; height: 100%; object-fit: cover"
        >
        <!-- <slot v-else name="image"></slot> -->
      </div>

      <!-- 内容区域 -->
      <div class="layout-content-area" :style="contentContainerStyleObj">
        <slot name="content">
          <div class="placeholder-text">内容区域</div>
        </slot>
      </div>
    </template>

    <!-- 轮播图在左侧布局 -->
    <template v-else-if="layout === 'carousel-left'">
      <div class="layout-horizontal-container">
        <!-- 轮播图区域 -->
        <div class="layout-carousel-area" :style="carouselStyle">
          <slot name="carousel" />
        </div>

        <div class="layout-vertical-content">
          <!-- 标题区域 -->
          <div v-if="isSimpleTitle && !hideTitle" class="layout-title-area">
            <TitleDisplay :schema="schema" />
          </div>

          <!-- 内容区域 -->
          <div class="layout-content-area" :style="contentContainerStyleObj">
            <slot name="content">
              <div class="placeholder-text">内容区域</div>
            </slot>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import TitleDisplay from '../title/TitleDisplay.vue';

// 定义props
const props = defineProps<{
  schema: Record<string, any>; // 样式和配置数据
  layout: string;
  hideTitle?: boolean;
}>();

// 默认图片URL - 占位图
const defaultImageUrl =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmMGYyZjUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iI2FhYWFhYSI+5pqC5peg5Zu+54mHPC90ZXh0Pjwvc3ZnPg==';

// 从schema中获取布局方式

// 从schema中获取标题样式
const titleStyle = computed(
  () => props.schema?.content?.title?.titleStyle || 'simple'
);
const isSimpleTitle = computed(
  () => titleStyle.value === 'simple' || titleStyle.value === 'blue-simple'
);

// 简化图片URL获取，不再使用复杂的异步转换
const imageUrl = computed(() => {
  const contentImage = props.schema?.content?.layout?.contentImage;
  if (!contentImage) return '';

  // 如果已经是完整URL则直接返回
  if (contentImage.startsWith('http')) {
    return contentImage;
  }

  // 使用简单的URL拼接方式
  return `/cmict/file/resource/show?id=${contentImage}`;
});

// 辅助函数：将数字类型的值转换为带px单位的字符串
const addPxUnit = (value: any): string | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') return `${value}px`;
  return String(value);
};

// 辅助函数：处理颜色透明度，支持多种颜色格式
const applyColorOpacity = (color: string, opacity: number): string => {
  if (!color) return '';

  // 已经是rgba格式，替换透明度
  if (color.startsWith('rgba')) {
    return color.replace(/rgba\((.+?),\s*[\d.]+\)/, `rgba($1, ${opacity})`);
  }

  // 提取rgb格式的颜色值
  if (color.startsWith('rgb(')) {
    const rgb = color.match(/rgb\((.+?)\)/)?.[1] || '0, 0, 0';
    return `rgba(${rgb}, ${opacity})`;
  }

  // 处理十六进制颜色
  if (color.startsWith('#') || /^[0-9A-Fa-f]{3,6}$/.test(color)) {
    return `rgba(${hexToRgb(color)}, ${opacity})`;
  }

  // 其他颜色格式或关键字颜色（red, blue等），最好的处理方式是返回原色并通知用户
  console.warn('不支持的颜色格式:', color);
  return color;
};

// 辅助函数：转换十六进制颜色为RGB格式
const hexToRgb = (hex: string): string => {
  // 移除可能的#前缀
  hex = hex.replace(/^#/, '');

  // 标准6位十六进制颜色
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }

  // 简写3位十六进制颜色
  if (hex.length === 3) {
    const r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
    const g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
    const b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
    return `${r}, ${g}, ${b}`;
  }

  // 默认返回黑色
  return '0, 0, 0';
};

// 容器样式对象
const containerStyleObj = computed(() => {
  const style = props.schema?.style?.container || {};
  const showTitle = !props.hideTitle;
  // 直接在返回对象中访问style的属性，以保持响应性
  return {
    borderRadius: addPxUnit(style.containerBorderRadius),
    boxShadow: style.containerBoxShadow,
    backgroundColor:
      style.containerBgColor && style.containerBgOpacity !== undefined
        ? applyColorOpacity(style.containerBgColor, style.containerBgOpacity)
        : style.containerBgColor,
    border:
      style.containerBorderWidth && style.containerBorderStyle
        ? `${style.containerBorderWidth}px ${style.containerBorderStyle} ${style.containerBorderColor}`
        : undefined,
    // 处理容器内边距
    padding:
      style.containerPaddingTop !== undefined
        ? `${style.containerPaddingTop}px ${style.containerPaddingRight}px ${style.containerPaddingBottom}px ${style.containerPaddingLeft}px`
        : undefined,
    height: showTitle
      ? isSimpleTitle.value
        ? '100%'
        : 'calc(100% - 62px)'
      : '100%'
  };
});

// 图片容器样式对象
const imageContainerStyleObj = computed(() => {
  const content = props.schema?.content.layout || {};
  const verticalLayout = ['image-top', 'image-bottom', 'no-image'].includes(
    props.layout
  );

  return {
    overflow: 'hidden',
    width: verticalLayout ? '100%' : undefined,
    marginBottom: props.layout === 'image-top' ? '16px' : '24px',
    height:
      props.layout !== 'no-image' ? addPxUnit(content.imageHeight) : undefined
  };
});

// 轮播容器的样式
const carouselStyle = computed(() => {
  const style = props.schema?.style || {};
  const carousel = style.carousel || {};

  return {
    width: carousel.width ? `${carousel.width}px` : '400px',
    height: '100%',
    borderRadius: carousel.borderRadius ? `${carousel.borderRadius}px` : '4px',
    overflow: 'hidden',
    marginRight: '16px'
  };
});

// 内容容器样式对象
const contentContainerStyleObj = computed(() => {
  const style = props.schema?.style?.container || {};
  return {
    backgroundColor: style.contentBgColor,
    opacity: style.contentBgOpacity,
    borderRadius: addPxUnit(style.contentBorderRadius),
    width: '100%',
    overflow: 'auto',
    paddingRight: '12px'
  };
});

defineOptions({
  name: 'pb-layout-display'
});
</script>

<style scoped>
.pb-layout-container {
  display: flex;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  flex-direction: column;
}

.layout-title-area,
.layout-content-area,
.layout-image-area {
  width: 100%;
}

.layout-image-area {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.layout-horizontal-container {
  display: flex;
  align-items: flex-start;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.layout-vertical-content {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  flex: 1;
}

.layout-content-area {
  flex: 1;
  overflow-y: auto;
  min-height: 50px;
  scrollbar-width: thin;
  scrollbar-color: rgb(144 147 153 / 30%) transparent;
}

.layout-image-left,
.layout-image-right {
  flex-shrink: 0;
}

/* Webkit浏览器自定义滚动条 */
.layout-content-area::-webkit-scrollbar {
  width: 6px;
}

.layout-content-area::-webkit-scrollbar-track {
  border-radius: 6px;
  background: transparent;
}

.layout-content-area::-webkit-scrollbar-thumb {
  border-radius: 6px;
  background-color: rgb(144 147 153 / 30%);
}

.layout-content-area::-webkit-scrollbar-thumb:hover {
  background-color: rgb(144 147 153 / 50%);
}

/* 内容文本样式 - 从ContentDisplay合并 */
.layout-content-display {
  width: 100%;
  box-sizing: border-box;
}

.placeholder-text {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px dashed #dcdfe6;
  padding: 20px;
  min-height: 100px;
  font-size: 14px;
  color: #909399;
  background-color: #f9f9f9;
}

.layout-carousel-area {
  height: 100%;
  flex-shrink: 0;
}
</style>
