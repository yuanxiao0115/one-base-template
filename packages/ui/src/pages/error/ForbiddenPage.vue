<script setup lang="ts">
  import { useRoute, useRouter } from 'vue-router';

  defineOptions({
    name: 'OneForbiddenPage',
  });

  const router = useRouter();
  const route = useRoute();

  function resolveFromPath() {
    const from = route.query.from;
    if (typeof from === 'string' && from.startsWith('/')) {
      return from;
    }
    return null;
  }

  async function onBack() {
    if (window.history.length > 1) {
      await router.back();
      return;
    }

    const fromPath = resolveFromPath();
    if (fromPath) {
      await router.push(fromPath);
      return;
    }

    await router.push('/');
  }

  async function onGoHome() {
    await router.push('/');
  }

  async function onGoLogin() {
    await router.push('/login');
  }
</script>

<template>
  <el-result icon="warning" title="403" sub-title="无权限访问该页面">
    <template #extra>
      <el-space wrap>
        <el-button type="primary" @click="onBack">返回上一页</el-button>
        <el-button @click="onGoHome">回首页</el-button>
        <el-button text @click="onGoLogin">去登录</el-button>
      </el-space>
    </template>
  </el-result>
</template>
