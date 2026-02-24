<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

defineOptions({
  name: 'PortalPreviewIframe',
});

const props = defineProps<{
  templateId: string;
  tabId: string;
}>();

const router = useRouter();

const iframeRef = ref<HTMLIFrameElement | null>(null);
const iframeReady = ref(false);
const iframeSrc = ref('');

function buildSrc(tabId: string) {
  const resolved = router.resolve({
    name: 'PortalPreview',
    params: { tabId },
    query: {
      templateId: props.templateId,
      isInIframe: 'true',
    },
  });
  return resolved.href;
}

function reload(tabId: string) {
  iframeReady.value = false;
  iframeSrc.value = buildSrc(tabId);
}

function refresh(nextTabId?: string) {
  const id = typeof nextTabId === 'string' ? nextTabId : props.tabId;
  if (!id) return;

  // 预览页支持 postMessage 刷新；若 iframe 尚未就绪则直接重载 src。
  const win = iframeRef.value?.contentWindow;
  if (!iframeReady.value || !win) {
    reload(id);
    return;
  }

  win.postMessage({ type: 'refresh-portal', data: { tabId: id } }, window.location.origin);
}

watch(
  () => props.tabId,
  (tabId) => {
    if (!tabId) {
      iframeSrc.value = '';
      iframeReady.value = false;
      return;
    }

    if (!iframeSrc.value) {
      reload(tabId);
      return;
    }

    refresh(tabId);
  },
  { immediate: true }
);

// templateId 变更时，为了保证 query 同步，直接重载一次 iframe
watch(
  () => props.templateId,
  () => {
    if (!props.tabId) return;
    reload(props.tabId);
  }
);

defineExpose({
  refresh,
});
</script>

<template>
  <div class="wrapper">
    <iframe
      v-if="iframeSrc"
      ref="iframeRef"
      class="frame"
      :src="iframeSrc"
      @load="iframeReady = true"
    />
    <div v-else class="empty">
      <el-empty description="请选择页面进行预览" />
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.frame {
  width: 100%;
  height: 100%;
  border: 0;
  background: var(--el-bg-color-page);
}

.empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-bg-color-page);
}
</style>

