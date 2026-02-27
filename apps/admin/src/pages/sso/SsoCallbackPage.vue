<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { finalizeAuthSession, handleSsoCallback, safeRedirect } from '@one-base-template/core';
import { appEnv } from '@/infra/env';
import {
  loginByDesktop,
  loginByExternal,
  loginByTicket,
  loginByYdbg,
  loginByZhxt
} from '@/shared/services/auth-remote-service';

defineOptions({
  name: 'SsoCallbackPage'
});

const router = useRouter();
const loading = ref(true);
const error = ref('');
const loginStatus = ref<'success' | 'fail' | ''>('');

type BizResponse<T> = {
  code?: unknown;
  data?: T;
  message?: string;
};

type TokenResult = {
  authToken?: string;
  token?: string;
  [k: string]: unknown;
};

type IdTokenResult = {
  idToken?: string;
  [k: string]: unknown;
};

const backend = appEnv.backend;
const tokenKey = appEnv.tokenKey;
const idTokenKey = appEnv.idTokenKey;

function safeMessage(e: unknown, fallback: string) {
  return e instanceof Error && e.message ? e.message : fallback;
}

async function setTokenAndBootstrap(token: string, redirect: string) {
  localStorage.setItem(tokenKey, token);
  await finalizeAuthSession({ shouldFetchMe: true });

  loginStatus.value = 'success';
  await router.replace(redirect);
}

async function handleZhxt(token: string, redirect: string) {
  const res = (await loginByZhxt(token)) as BizResponse<TokenResult>;
  const authToken = res.data?.authToken;
  if (!authToken) throw new Error(res.message || '智慧协同单点登录失败');
  await setTokenAndBootstrap(authToken, redirect);
}

async function handleYdbg(token: string, redirect: string) {
  const res = (await loginByYdbg(token)) as BizResponse<TokenResult>;
  const authToken = res.data?.authToken;
  if (!authToken) throw new Error(res.message || '移动办公单点登录失败');
  await setTokenAndBootstrap(authToken, redirect);
}

async function handleTicket(ticket: string, redirectUrlRaw: string | null, redirect: string) {
  // 老项目行为：serviceUrl = redirectUrl ? `${origin}/${redirectUrl}` : 当前完整 URL
  const serviceUrl = redirectUrlRaw ? `${window.location.origin}/${redirectUrlRaw}` : window.location.href;

  const res = (await loginByTicket({ ticket, serviceUrl })) as BizResponse<TokenResult>;

  const authToken = res.data?.authToken;
  if (!authToken) throw new Error(res.message || '票据验证失败');
  await setTokenAndBootstrap(authToken, redirect);
}

async function handleTypeToken(token: string, redirect: string) {
  await setTokenAndBootstrap(token, redirect);
}

async function handleExternalSso(params: { from: 'portal' | 'om'; token: string; redirect: string }) {
  const res = (await loginByExternal({
    from: params.from,
    token: params.token
  })) as BizResponse<TokenResult>;

  const authToken = res.data?.token ?? res.data?.authToken;
  if (!authToken) throw new Error(res.message || 'SSO 登录失败');
  localStorage.setItem(tokenKey, authToken);

  // 兼容老项目：额外换取 idToken（用于后续桌面统一认证场景）
  const ssoRes = (await loginByDesktop()) as BizResponse<IdTokenResult>;
  const idToken = ssoRes.data?.idToken;
  if (idToken) {
    localStorage.setItem(idTokenKey, idToken);
  }

  await setTokenAndBootstrap(authToken, params.redirect);
}

onMounted(async () => {
  loading.value = true;
  error.value = '';
  loginStatus.value = '';

  try {
    if (backend !== 'sczfw') {
      const { redirect } = await handleSsoCallback();
      await router.replace(redirect);
      loginStatus.value = 'success';
      return;
    }

    const url = new URL(window.location.href);
    const sp = url.searchParams;

    const token = sp.get('token');
    const type = sp.get('type');
    const userToken = sp.get('Usertoken');
    const moaToken = sp.get('moaToken');
    const ticket = sp.get('ticket');
    const sourceCode = sp.get('sourceCode');

    const redirectUrlRaw = sp.get('redirectUrl') ?? sp.get('redirect');
    const redirect = safeRedirect(redirectUrlRaw, '/home/index');

    if (sourceCode === 'zhxt' && token) {
      await handleZhxt(token, redirect);
      return;
    }

    if (sourceCode === 'YDBG' && token) {
      await handleYdbg(token, redirect);
      return;
    }

    if (ticket) {
      // ticket 流程对 serviceUrl 有特殊要求，这里保持与老项目一致，不走 core 的通用处理
      await handleTicket(ticket, sp.get('redirectUrl'), redirect);
      return;
    }

    if (type && token) {
      await handleTypeToken(token, redirect);
      return;
    }

    if (moaToken) {
      await handleExternalSso({ from: 'om', token: moaToken, redirect });
      return;
    }

    if (userToken) {
      await handleExternalSso({ from: 'portal', token: userToken, redirect });
      return;
    }

    throw new Error('登录参数无效');
  } catch (e: unknown) {
    loginStatus.value = 'fail';
    error.value = safeMessage(e, 'SSO 登录失败');
    ElMessage.error(error.value);
    localStorage.removeItem(tokenKey);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="h-screen w-screen flex items-center justify-center bg-[var(--el-bg-color-page)]">
    <el-card class="w-full max-w-md">
      <template #header>
        <div class="font-medium">SSO 登录</div>
      </template>

      <div v-if="loading" class="text-sm text-[var(--el-text-color-regular)]">
        正在处理 SSO 回调，请稍候。
      </div>

      <div v-else-if="loginStatus === 'fail'" class="text-sm">
        <p class="text-[var(--el-text-color-regular)]">{{ error || '登录失败' }}</p>
        <div class="mt-4">
          <el-button type="primary" @click="router.replace('/login')">返回登录页</el-button>
        </div>
      </div>

      <div v-else class="text-sm text-[var(--el-text-color-regular)]">
        登录成功，正在跳转...
      </div>
    </el-card>
  </div>
</template>
