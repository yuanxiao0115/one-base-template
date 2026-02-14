<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

defineOptions({
  name: 'PortalPreviewRenderPage'
});

const route = useRoute();

const tabId = computed(() => {
  const raw = route.params.tabId;
  return typeof raw === 'string' ? raw : '';
});

const templateId = computed(() => {
  const raw = route.query.templateId;
  return typeof raw === 'string' ? raw : '';
});
</script>

<template>
  <div class="min-h-screen bg-[var(--el-bg-color-page)] p-6">
    <el-card>
      <template #header>
        <div class="font-medium">门户预览渲染页（匿名访问，占位）</div>
      </template>
      <p class="text-sm text-[var(--el-text-color-regular)]">
        Sprint 5 将补齐：匿名接口加载 template/tab + 渲染 pageLayout + postMessage 刷新。
      </p>
      <div class="mt-3 text-xs text-[var(--el-text-color-secondary)]">
        tabId={{ tabId || '-' }} / templateId={{ templateId || '-' }}
      </div>
      <div class="mt-1 text-xs text-[var(--el-text-color-secondary)]">
        路由：/portal/index/:tabId?templateId=&lt;templateId&gt;
      </div>
    </el-card>
  </div>
</template>

