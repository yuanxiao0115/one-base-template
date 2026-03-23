<script setup lang="ts">
import {
  finalizeAuthSession,
  loginByPassword,
  resolveAppRedirectTarget
} from '@one-base-template/core';
import { LoginBoxV2 as ObLoginBoxV2 } from '@one-base-template/ui/lite-auth';
import { ElMessage } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getAppEnv } from '@/config/env';
import { fetchCaptchaCheck, loadCaptcha } from '@/services/auth/auth-captcha-service';
import { getLoginPageConfig, type LoginPageConfig } from '@/services/auth/auth-remote-service';
import { resolveLoginScenario } from '@/services/auth/auth-scenario-provider';

defineOptions({
  name: 'LoginPage'
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
const appEnv = getAppEnv();

const { backend } = appEnv;
const { baseUrl } = appEnv;
const { tokenKey } = appEnv;
const loginScenario = resolveLoginScenario({
  backend,
  routeQuery: route.query
});
const { useVerifyLogin } = loginScenario;

const loading = ref(false);
const form = reactive({
  username: '',
  password: ''
});

const loginInfoConfig = ref<LoginPageConfig | null>(null);
const backgroundImage = ref('');

function getRedirectTarget() {
  const raw = route.query.redirect ?? route.query.redirectUrl;
  return resolveAppRedirectTarget(raw, { fallback: loginScenario.fallback, baseUrl });
}

async function loadLoginPageConfig() {
  const res = await getLoginPageConfig();
  if (res.code !== 200) {
    return;
  }

  loginInfoConfig.value = res.data ?? null;

  const firstImgId = res.data?.loginPageFodders?.[0];
  if (firstImgId) {
    backgroundImage.value = `/cmict/file/resource/show?id=${firstImgId}`;
  }
}

async function handleDirectTokenLogin(token: string) {
  localStorage.setItem(tokenKey, token);
  try {
    await finalizeAuthSession({ shouldFetchMe: true });
    await router.replace(getRedirectTarget());
  } catch (e: unknown) {
    const message = e instanceof Error && e.message ? e.message : '登录失败';
    ElMessage.error(message);
    localStorage.removeItem(tokenKey);
  }
}

async function doLogin(payload: VerifyLoginPayload) {
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
    await router.replace(getRedirectTarget());
  } catch (e: unknown) {
    const message = e instanceof Error && e.message ? e.message : '登录失败';
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  if (loginScenario.shouldLoadLoginPageConfig) {
    await loadLoginPageConfig();
  }

  if (loginScenario.directLoginToken) {
    await handleDirectTokenLogin(loginScenario.directLoginToken);
  }
});
</script>

<template>
  <div
    class="login-desktop"
    :style="{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined }"
  >
    <div class="login-header">
      <span v-if="loginInfoConfig?.webLogoText">{{ loginInfoConfig.webLogoText }}</span>
      <el-divider v-if="loginInfoConfig?.webLogoText" direction="vertical" />
      <span>后台管理</span>
    </div>

    <div class="login-container">
      <div class="login-box">
        <div class="login-form">
          <ObLoginBoxV2
            v-model:username="form.username"
            v-model:password="form.password"
            title="用户登录"
            :loading="loading"
            :encrypt="useVerifyLogin"
            :load-captcha="loadCaptcha"
            :check-captcha="fetchCaptchaCheck"
            :validate-password="useVerifyLogin"
            username-label=""
            password-label=""
            username-placeholder="账号"
            password-placeholder="密码"
            @submit="doLogin"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-desktop {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  min-width: 1200px;
  height: 100vh;
  overflow: hidden;
  background-color: #0f79e9;
  background-repeat: no-repeat;
  background-position: 100%;
  background-size: 100% 100%;
}

.login-header {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 24px;
}

.login-header span {
  margin: 0 24px;
  font-size: 40px;
  font-weight: 500;
  color: #fff;
}

.login-container {
  padding: 24px 48px 48px;
  margin-top: -5%;
  background-color: #fff;
  border-radius: 8px;
}

.login-container .login-form {
  width: 360px;
}

.login-box {
  display: flex;
  align-items: center;
  overflow: hidden;
  text-align: center;
}
</style>
