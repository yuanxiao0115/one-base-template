<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

defineOptions({
  name: 'PortalTemplateSettingPage'
});

const route = useRoute();
const router = useRouter();

const templateId = computed(() => {
  const v = route.query.id;
  return typeof v === 'string' ? v : '';
});

function onBack() {
  router.push('/portal/setting');
}
</script>

<template>
  <div class="h-full w-full flex flex-col gap-3">
    <el-alert
      type="info"
      :closable="false"
      show-icon
      title="门户配置 IDE（Sprint 1 占位页）"
      description="Sprint 4 将补齐 tab 树 + iframe 预览 + postMessage 刷新 + 进入页面编辑。"
    />

    <el-card class="flex-1 min-h-0">
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <div class="font-medium truncate">模板 ID：{{ templateId || '-' }}</div>
          <el-button @click="onBack">返回列表</el-button>
        </div>
      </template>

      <p class="text-sm text-[var(--el-text-color-regular)]">
        路由：/resource/portal/setting?id=&lt;templateId&gt;
      </p>
    </el-card>
  </div>
</template>

