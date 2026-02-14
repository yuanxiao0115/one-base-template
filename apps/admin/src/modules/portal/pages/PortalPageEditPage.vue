<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

defineOptions({
  name: 'PortalPageEditPage'
});

const route = useRoute();
const router = useRouter();

const tabId = computed(() => {
  const v = route.query.tabId;
  return typeof v === 'string' ? v : '';
});

const templateId = computed(() => {
  const v = route.query.templateId;
  return typeof v === 'string' ? v : '';
});

function onBack() {
  if (templateId.value) {
    router.push({ path: '/resource/portal/setting', query: { id: templateId.value } });
    return;
  }
  router.push('/portal/setting');
}
</script>

<template>
  <div class="h-full w-full flex flex-col gap-3">
    <el-alert
      type="warning"
      :closable="false"
      show-icon
      title="页面编辑器（Sprint 1 占位页）"
      description="Sprint 2 将补齐 grid-layout-plus + 物料面板 + 属性面板 + 保存/预览闭环。"
    />

    <el-card class="flex-1 min-h-0">
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <div class="font-medium truncate">
            tabId={{ tabId || '-' }} / templateId={{ templateId || '-' }}
          </div>
          <el-button @click="onBack">返回</el-button>
        </div>
      </template>

      <p class="text-sm text-[var(--el-text-color-regular)]">
        路由：/portal/page/edit?tabId=&lt;tabId&gt;&amp;templateId=&lt;templateId&gt;
      </p>
    </el-card>
  </div>
</template>

