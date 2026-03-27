<script setup lang="ts">
import {
  buildLoginScenario,
  loginByPassword,
  resolveAppRedirectTarget
} from '@one-base-template/core';
import { message } from '@one-base-template/ui';
import {
  LoginBox as ObLoginBox,
  LoginBoxV2 as ObLoginBoxV2
} from '@one-base-template/ui/lite-auth';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getAppEnv } from '@/config/env';
import { DEFAULT_FALLBACK_HOME } from '@/config/systems';
import { fetchCaptchaCheck, loadCaptcha } from '@/services/auth/auth-captcha-service';
import { getLoginPageConfig, type LoginPageConfig } from '@/services/auth/auth-remote-service';
import { sm4EncryptBase64 } from '@/services/security/crypto';

defineOptions({
  name: 'TemplateLoginPage'
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
const loginScenario = buildLoginScenario({
  backend,
  routeQuery: route.query,
  verifyLoginFallback: DEFAULT_FALLBACK_HOME,
  defaultFallback: '/'
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
  return resolveAppRedirectTarget(raw, {
    fallback: loginScenario.fallback,
    baseUrl
  });
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

async function loadLoginMeta() {
  if (!useVerifyLogin) {
    return;
  }

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
    await router.replace(getRedirectTarget());
  } catch (error) {
    if (!shouldSkipLocalErrorToast(error)) {
      const errorMessage = error instanceof Error && error.message ? error.message : '登录失败';
      void message.error(errorMessage);
    }
  } finally {
    loading.value = false;
  }
}

async function doDefaultLogin(payload: { username: string; password: string }) {
  loading.value = true;
  try {
    await loginByPassword({
      backend,
      username: payload.username,
      password: payload.password,
      encryptor: backend === 'basic' ? sm4EncryptBase64 : undefined
    });
    await router.replace(getRedirectTarget());
  } catch (error) {
    if (!shouldSkipLocalErrorToast(error)) {
      const errorMessage = error instanceof Error && error.message ? error.message : '登录失败';
      void message.error(errorMessage);
    }
  } finally {
    loading.value = false;
  }
}

const pageTitle = computed(() => loginInfoConfig.value?.webLogoText || 'Template 管理后台');

onMounted(async () => {
  await loadLoginMeta();
});
</script>

<template>
  <div
    class="template-login"
    :style="{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined }"
  >
    <div class="template-login__header">{{ pageTitle }}</div>

    <div class="template-login__inner">
      <el-card class="template-login__card">
        <ObLoginBoxV2
          v-if="useVerifyLogin"
          v-model:username="form.username"
          v-model:password="form.password"
          title="用户登录"
          :loading="loading"
          :encrypt="true"
          :load-captcha="loadCaptcha"
          :check-captcha="fetchCaptchaCheck"
          :validate-password="false"
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
.template-login {
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #0f79e9;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

.template-login__header {
  margin-bottom: 24px;
  color: #fff;
  font-size: 30px;
  font-weight: 500;
}

.template-login__inner {
  width: 100%;
  display: flex;
  justify-content: center;
}

.template-login__card {
  width: 100%;
  max-width: 420px;
}
</style>
