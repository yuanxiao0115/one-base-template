<template>
  <LayoutDisplay layout="no-image" :schema="props.schema" use-default-title>
    <!-- 内容区域 -->
    <template #content>
      <div class="links-container">
        <div v-if="links.length === 0" class="empty-links-placeholder">
          暂无相关链接
        </div>
        <div
          v-for="(link, index) in links"
          :key="link.id || index"
          class="link-item"
        >
          <a :href="link.url" target="_blank" :style="linkStyleObj">{{
            link.title
          }}</a>
        </div>
      </div>
    </template>
  </LayoutDisplay>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';
import LayoutDisplay from '../common/layout/LayoutDisplay.vue';
import type { LinkStyleModelType } from './LinkStyleConfig.vue';

// 链接项接口
interface LinkItem {
  title: string;
  url: string;
  id?: string;
}

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
});

// 从schema中获取内容数据
const links = computed<LinkItem[]>(() => {
  const schemaLinks = props.schema?.content?.links?.links;
  return schemaLinks || [];
});

// 从schema中获取样式数据
const styles = computed<LinkStyleModelType & { [key: string]: any }>(() => {
  return props.schema?.style?.links || {};
});

const linkStyleObj = computed<CSSProperties>(() => {
  return {
    color: styles.value.linkColor,
    fontSize: styles.value.linkFontSize + 'px',
    fontWeight: styles.value.linkFontWeight,
    textDecoration: 'none',
    paddingRight: '15px',
    marginRight: '10px',
    borderRight: '1px solid #ddd'
  };
});

// 组件名称定义，保持与原来一致
defineOptions({
  name: 'pb-related-links-index'
});
</script>

<style scoped>
.links-container {
  display: flex;
  width: 100%;
  min-height: 40px;
  flex-wrap: wrap;
}

.link-item {
  margin-right: 10px;
  margin-bottom: 10px;
  padding-right: 10px;
}

.link-item:first-child {
  padding-left: 0 !important;
}

.link-item:last-child a {
  border-right: none !important;
}

.link-item a:hover {
  color: v-bind('styles.hoverColor || "#d33a31"');
}

.empty-links-placeholder {
  padding: 20px 0;
  width: 100%;
  font-size: 14px;
  text-align: center;
  color: #909399;
}
</style>
