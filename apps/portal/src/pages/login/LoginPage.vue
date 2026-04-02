<script setup lang="ts">
import {
  buildLoginScenario,
  loginByPassword,
  resolvePortalLoginTarget
} from '@one-base-template/core';
import { message } from '@one-base-template/ui';
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { appEnv } from '@/config/env';
import {
  fetchCaptchaCheck as checkCaptcha,
  loadCaptcha
} from '@/services/auth/auth-captcha-service';
import {
  getLoginPageConfig,
  getPortalFrontConfig,
  type PortalLoginPageConfig
} from '@/services/auth/auth-remote-service';

defineOptions({
  name: 'PortalLoginPage'
});

interface VerifyLoginPayload {
  username: string;
  password: string;
  captcha: string;
  captchaKey: string;
  encrypt?: 1;
}

const router = useRouter();
const route = useRoute();
const { backend } = appEnv;
const loginScenario = buildLoginScenario({
  backend,
  routeQuery: route.query,
  verifyLoginFallback: '/portal/index',
  defaultFallback: '/portal/index'
});
const { useVerifyLogin } = loginScenario;

const loading = ref(false);
const form = reactive({
  username: '',
  password: ''
});

const loginInfoConfig = ref<PortalLoginPageConfig | null>(null);
const backgroundImage = ref('');

function isBizSuccess(code: unknown) {
  return code === 0 || code === 200 || String(code) === '0' || String(code) === '200';
}

async function loadLoginPageMeta() {
  const res = await getLoginPageConfig();

  if (!(res && isBizSuccess(res.code))) {
    return;
  }

  loginInfoConfig.value = res.data ?? null;

  const firstImgId = res.data?.loginPageFodders?.[0];
  if (firstImgId) {
    backgroundImage.value = `/cmict/file/resource/show?id=${firstImgId}`;
  }
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

function getDefaultTargetPath() {
  return resolvePortalLoginTarget({
    redirect: route.query.redirect,
    fallback: loginScenario.fallback
  });
}

async function getVerifyLoginTargetPath() {
  const res = await getPortalFrontConfig();
  const frontConfig = isBizSuccess(res?.code) ? res.data : undefined;

  return resolvePortalLoginTarget({
    redirect: route.query.redirect,
    fallback: loginScenario.fallback,
    frontConfig
  });
}

async function doDefaultLogin(payload: { username: string; password: string }) {
  loading.value = true;
  try {
    await loginByPassword({
      backend,
      username: payload.username,
      password: payload.password
    });
    await router.replace(getDefaultTargetPath());
  } catch (error: unknown) {
    if (!shouldSkipLocalErrorToast(error)) {
      const errorMessage = error instanceof Error && error.message ? error.message : '登录失败';
      void message.error(errorMessage);
    }
  } finally {
    loading.value = false;
  }
}

async function doVerifyLogin(payload: VerifyLoginPayload) {
  loading.value = true;
  try {
    await loginByPassword({
      backend,
      username: payload.username,
      password: payload.password,
      captcha: payload.captcha,
      captchaKey: payload.captchaKey,
      alreadyEncrypted: payload.encrypt === 1
    });
    await router.replace(await getVerifyLoginTargetPath());
  } catch (error: unknown) {
    if (!shouldSkipLocalErrorToast(error)) {
      const errorMessage = error instanceof Error && error.message ? error.message : '登录失败';
      void message.error(errorMessage);
    }
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  if (loginScenario.shouldLoadLoginPageConfig) {
    await loadLoginPageMeta();
  }
});
</script>

<template>
  <div
    class="portal-login"
    :style="{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined }"
  >
    <div class="portal-login__header">
      <span v-if="loginInfoConfig?.webLogoText">{{ loginInfoConfig.webLogoText }}</span>
      <el-divider v-if="loginInfoConfig?.webLogoText" direction="vertical" />
      <span>门户登录</span>
    </div>

    <div class="portal-login__inner">
      <el-card class="portal-login__card" :class="{ 'portal-login__card--basic': useVerifyLogin }">
        <ObLoginBoxV2
          v-if="useVerifyLogin"
          v-model:username="form.username"
          v-model:password="form.password"
          title="用户登录"
          :loading="loading"
          :encrypt="true"
          :load-captcha="loadCaptcha"
          :check-captcha="checkCaptcha"
          username-label=""
          password-label=""
          username-placeholder="账号"
          password-placeholder="密码"
          @submit="doVerifyLogin"
        />
        <ObLoginBox
          v-else
          v-model:username="form.username"
          v-model:password="form.password"
          title="用户登录"
          :loading="loading"
          :validate-password="false"
          username-label=""
          password-label=""
          username-placeholder="账号"
          password-placeholder="密码"
          @submit="doDefaultLogin"
        />
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.portal-login {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: #0f79e9;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

.portal-login__header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
}

.portal-login__header span {
  margin: 0 16px;
  font-size: 32px;
  font-weight: 500;
  color: #fff;
}

.portal-login__inner {
  width: 100%;
  display: flex;
  justify-content: center;
}

.portal-login__card {
  width: 100%;
  max-width: 420px;
}

.portal-login__card--basic {
  padding: 8px 4px;
}
</style>
