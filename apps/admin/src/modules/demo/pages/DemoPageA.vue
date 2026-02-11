<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { getObHttpClient } from '@/infra/http';

defineOptions({
  name: 'DemoPageA'
});

const router = useRouter();

async function onDownloadOk() {
  try {
    // 触发 $isDownload：core 会自动 responseType=blob 并自动下载
    await getObHttpClient().get('/api/demo/download', {
      $isDownload: true,
      $downloadFileName: 'ob-demo.txt'
    });
    ElMessage.success('已触发下载');
  } catch (e: unknown) {
    const message = e instanceof Error && e.message ? e.message : '下载失败';
    ElMessage.error(message);
  }
}

async function onDownloadError() {
  try {
    // 用于演示：下载接口返回 JSON 错误时，core 会探测并按业务码处理（不会触发下载）
    await getObHttpClient().get('/api/demo/download-error', { $isDownload: true });
  } catch (e: unknown) {
    const message = e instanceof Error && e.message ? e.message : '请求失败';
    ElMessage.error(message);
  }
}

function onGotoSystemB() {
  router.push('/b/demo/page-1');
}
</script>

<template>
  <el-card>
    <template #header>
      <div class="font-medium">页面 A</div>
    </template>
    <p class="text-sm text-[var(--el-text-color-regular)]">
      用于演示 tabs + keep-alive。切换到页面 B 再回来，观察组件是否被缓存。
    </p>
    <div class="mt-4 flex flex-wrap gap-2">
      <el-button type="primary" @click="onDownloadOk">下载示例文件</el-button>
      <el-button @click="onDownloadError">下载错误(JSON)示例</el-button>
      <el-button type="success" plain @click="onGotoSystemB">跳转到系统 B / 页面 1</el-button>
    </div>
    <div class="mt-4">
      <el-input placeholder="输入点东西以验证缓存" />
    </div>
  </el-card>
</template>
