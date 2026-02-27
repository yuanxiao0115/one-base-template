<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { demoDownloadService } from '../services/download-service';

defineOptions({
  name: 'DemoPageA'
});

const router = useRouter();

async function onDownloadOk() {
  try {
    await demoDownloadService.download('ob-demo.txt');
    ElMessage.success('已触发下载');
  } catch (e: unknown) {
    const message = e instanceof Error && e.message ? e.message : '下载失败';
    ElMessage.error(message);
  }
}

async function onDownloadError() {
  try {
    await demoDownloadService.downloadError();
  } catch (e: unknown) {
    const message = e instanceof Error && e.message ? e.message : '请求失败';
    ElMessage.error(message);
  }
}

function onGotoSystemB() {
  router.push('/b/demo/page-1');
}

function onGotoContainerDemo() {
  router.push('/demo/page-container');
}

function onGotoLoginLogMigration() {
  router.push('/demo/login-log-vxe');
}

function onGotoButtonStyleDemo() {
  router.push('/demo/button-style');
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
      <el-button type="warning" plain @click="onGotoContainerDemo">页面容器 Demo</el-button>
      <el-button type="info" plain @click="onGotoLoginLogMigration">登录日志迁移 Demo</el-button>
      <el-button type="primary" plain @click="onGotoButtonStyleDemo">按钮样式 Demo</el-button>
      <el-button type="success" plain @click="onGotoSystemB">跳转到系统 B / 页面 1</el-button>
    </div>
    <div class="mt-4">
      <el-input placeholder="输入点东西以验证缓存" />
    </div>
  </el-card>
</template>
