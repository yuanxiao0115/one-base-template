<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

defineOptions({
  name: 'SystemSfssLegacyPage'
});

const route = useRoute();

const title = computed(() => {
  const routeTitle = route.meta?.title;
  return typeof routeTitle === 'string' && routeTitle.length > 0 ? routeTitle : '涉法涉诉模块页面';
});

const sourcePath = computed(() => {
  const path = route.path;
  return `/Users/haoqiuzhi/code/monorepo-web/apps/zfw-system-sfss/src/views/System-sfss${path}`;
});
</script>

<template>
  <el-card class="system-sfss-legacy-page">
    <template #header>
      <div class="system-sfss-legacy-page__title">{{ title }}</div>
    </template>
    <el-alert
      type="info"
      :closable="false"
      title="该页面已接入路由与菜单链路，当前为迁移占位页。"
      show-icon
    />
    <div class="system-sfss-legacy-page__content">
      <p>已完成：</p>
      <ul>
        <li>沿用老项目 URL，后端菜单路径可直接命中。</li>
        <li>登录后可访问并持续开发，不阻塞新项目联调。</li>
      </ul>
      <p class="system-sfss-legacy-page__source">
        老项目对应目录：<code>{{ sourcePath }}</code>
      </p>
    </div>
  </el-card>
</template>

<style scoped>
.system-sfss-legacy-page {
  width: 100%;
}

.system-sfss-legacy-page__title {
  font-size: 16px;
  font-weight: 600;
}

.system-sfss-legacy-page__content {
  margin-top: 12px;
  color: var(--el-text-color-regular);
  line-height: 1.7;
}

.system-sfss-legacy-page__source {
  margin-top: 10px;
  color: var(--el-text-color-secondary);
  word-break: break-all;
}
</style>
