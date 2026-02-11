<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore, useMenuStore } from '@one-base-template/core';

defineOptions({
  name: 'LoginPage'
});

const router = useRouter();
const route = useRoute();

const authStore = useAuthStore();
const menuStore = useMenuStore();

const loading = ref(false);

const form = reactive({
  username: 'demo',
  password: 'demo'
});

function normalizeRedirect(raw: unknown): string {
  if (typeof raw !== 'string') return '/';
  if (!raw.startsWith('/')) return '/';
  if (raw.startsWith('//')) return '/';
  return raw;
}

async function onSubmit() {
  loading.value = true;
  try {
    await authStore.login({ username: form.username, password: form.password });
    await menuStore.loadMenus();

    const redirect = normalizeRedirect(route.query.redirect);
    await router.replace(redirect);
  } catch (e: unknown) {
    const message = e instanceof Error && e.message ? e.message : '登录失败';
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="h-screen w-screen flex items-center justify-center bg-[var(--el-bg-color-page)] p-4">
    <el-card class="w-full max-w-md">
      <template #header>
        <div class="font-medium">登录</div>
      </template>

      <el-form label-position="top">
        <el-form-item label="账号">
          <el-input v-model="form.username" autocomplete="username" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" autocomplete="current-password" show-password />
        </el-form-item>
        <el-button class="w-full" type="primary" :loading="loading" @click="onSubmit">
          登录
        </el-button>
      </el-form>

      <div class="mt-3 text-xs text-[var(--el-text-color-regular)]">
        开发模式下使用 Vite middleware mock，无需后端。也支持 /sso?token=xxx 等回调。
      </div>
    </el-card>
  </div>
</template>
