<script setup lang="ts">
import { handleSsoCallback } from '@one-base-template/core';
import { message } from '@one-base-template/ui';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { appEnv } from '@/config/env';
import { APP_LOGIN_ROUTE_PATH } from '@/router/constants';

defineOptions({
  name: 'PortalSsoCallbackPage'
});

const router = useRouter();
const loading = ref(true);
const errorMessage = ref('');
const loginStatus = ref<'' | 'fail' | 'success'>('');

const { tokenKey, idTokenKey } = appEnv;

function safeMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function shouldSkipLocalErrorToast(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  if (error.name === 'ObBizError') {
    return true;
  }
  return 'response' in error || 'code' in error;
}

onMounted(async () => {
  loading.value = true;
  errorMessage.value = '';
  loginStatus.value = '';

  try {
    const { redirect } = await handleSsoCallback();
    await router.replace(redirect);
    loginStatus.value = 'success';
  } catch (error: unknown) {
    loginStatus.value = 'fail';
    errorMessage.value = safeMessage(error, 'SSO 登录失败');
    if (!shouldSkipLocalErrorToast(error)) {
      void message.error(errorMessage.value);
    }
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(idTokenKey);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div
    class="portal-sso bg-(--el-bg-color-page) flex h-screen items-center justify-center w-screen"
  >
    <el-card class="max-w-md w-full">
      <template #header>
        <div class="font-medium">SSO 登录</div>
      </template>

      <div v-if="loading" class="text-[var(--el-text-color-regular)] text-sm">
        正在处理 SSO 回调，请稍候。
      </div>

      <div v-else-if="loginStatus === 'fail'" class="text-sm">
        <p class="text-[var(--el-text-color-regular)]">{{ errorMessage || '登录失败' }}</p>
        <div class="mt-4">
          <el-button type="primary" @click="router.replace(APP_LOGIN_ROUTE_PATH)">
            返回登录页
          </el-button>
        </div>
      </div>

      <div v-else class="text-[var(--el-text-color-regular)] text-sm">登录成功，正在跳转...</div>
    </el-card>
  </div>
</template>
