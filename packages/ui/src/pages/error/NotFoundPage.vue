<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';

defineOptions({
  name: 'OneNotFoundPage'
});

const router = useRouter();
const route = useRoute();

async function onBack() {
  // 优先返回上一页；若是直达 404（无历史记录），兜底跳回首页。
  if (window.history.length > 1) {
    await router.back();
    return;
  }

  const from = route.query.from;
  if (typeof from === 'string' && from.startsWith('/')) {
    await router.push(from);
    return;
  }

  await router.push('/');
}
</script>

<template>
  <el-result icon="error" title="404" sub-title="页面不存在">
    <template #extra>
      <el-button type="primary" @click="onBack">返回上一页</el-button>
    </template>
  </el-result>
</template>
