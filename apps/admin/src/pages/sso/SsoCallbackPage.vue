<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { handleSsoCallbackFromLocation } from '@one-base-template/core';

defineOptions({
  name: 'SsoCallbackPage'
});

const router = useRouter();
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  loading.value = true;
  error.value = '';

  try {
    const { redirect } = await handleSsoCallbackFromLocation();
    await router.replace(redirect);
  } catch (e: unknown) {
    error.value = e instanceof Error && e.message ? e.message : 'SSO 登录失败';
    ElMessage.error(error.value);
    await router.replace('/login');
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="h-screen w-screen flex items-center justify-center bg-[var(--el-bg-color-page)]">
    <el-card class="w-full max-w-md">
      <template #header>
        <div class="font-medium">SSO 登录中...</div>
      </template>

      <div v-if="loading" class="text-sm text-[var(--el-text-color-regular)]">
        正在处理 SSO 回调，请稍候。
      </div>
      <div v-else-if="error" class="text-sm text-red-600">
        {{ error }}
      </div>
    </el-card>
  </div>
</template>
