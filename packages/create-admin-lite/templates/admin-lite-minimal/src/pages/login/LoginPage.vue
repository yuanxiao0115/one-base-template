<script setup lang="ts">
import {
  buildLoginScenario,
  finalizeAuthSession,
  loginByPassword,
  resolveAuthRedirectTargetFromQuery
} from '@one-base-template/core';
import { message } from '@one-base-template/ui';
import { LoginBoxV2 as ObLoginBoxV2 } from '@one-base-template/ui/lite-auth';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getRuntime } from '@/bootstrap/runtime';
import { fetchCaptchaCheck, loadCaptcha } from '@/services/auth/auth-captcha-service';
import { getLoginPageConfig, type LoginPageConfig } from '@/services/auth/auth-remote-service';
import { homeFallback, ui } from '@/config';

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

type LoginStage =
  | 'idle'
  | 'captcha-opening'
  | 'captcha-loading'
  | 'captcha-checking'
  | 'captcha-passed'
  | 'logging-in'
  | 'loading-menus';

const router = useRouter();
const route = useRoute();
const appEnv = getRuntime();

const { backend } = appEnv;
const { baseUrl } = appEnv;
const { tokenKey } = appEnv;
const loginScenario = buildLoginScenario({
  backend,
  routeQuery: route.query,
  verifyLoginFallback: homeFallback,
  defaultFallback: '/'
});
const { useVerifyLogin } = loginScenario;

const loading = ref(false);
const form = reactive({
  username: '',
  password: ''
});
const loginStage = ref<LoginStage>('idle');
let loginStageTimer: ReturnType<typeof setTimeout> | null = null;

const loginInfoConfig = ref<LoginPageConfig | null>(null);
const backgroundImage = ref('');
const stageTextMap: Record<Exclude<LoginStage, 'idle'>, string> = {
  'captcha-opening': '正在打开验证码...',
  'captcha-loading': '正在加载验证码...',
  'captcha-checking': '正在校验验证码...',
  'captcha-passed': '验证通过，准备登录...',
  'logging-in': '正在登录系统...',
  'loading-menus': '正在加载菜单与权限...'
};
const stageText = computed(() => {
  if (loginStage.value === 'idle') {
    return '';
  }
  return stageTextMap[loginStage.value];
});
const showStageTip = computed(() => loginStage.value !== 'idle');

function getRedirectTarget() {
  return resolveAuthRedirectTargetFromQuery(route.query, {
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

function clearLoginStageTimer() {
  if (loginStageTimer === null) {
    return;
  }
  clearTimeout(loginStageTimer);
  loginStageTimer = null;
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
    if (!shouldSkipLocalErrorToast(e)) {
      const errorMessage = e instanceof Error && e.message ? e.message : '登录失败';
      void message.error(errorMessage);
    }
    localStorage.removeItem(tokenKey);
  }
}

function handleLoginStageChange(stage: LoginStage) {
  if (loading.value) {
    return;
  }
  loginStage.value = stage;
}

async function doLogin(payload: VerifyLoginPayload) {
  loading.value = true;
  loginStage.value = 'logging-in';
  clearLoginStageTimer();
  loginStageTimer = setTimeout(() => {
    if (loading.value) {
      loginStage.value = 'loading-menus';
    }
  }, 400);
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
    if (!shouldSkipLocalErrorToast(e)) {
      const errorMessage = e instanceof Error && e.message ? e.message : '登录失败';
      void message.error(errorMessage);
    }
  } finally {
    clearLoginStageTimer();
    loginStage.value = 'idle';
    loading.value = false;
  }
}

const passwordPattern =
  /^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?!([^(0-9a-zA-Z)]|[()])+$)(?!^.*[\u4E00-\u9FA5].*$)([^(0-9a-zA-Z)]|[()]|[a-z]|[A-Z]|[0-9]){8,18}$/;

onMounted(async () => {
  if (loginScenario.directLoginToken) {
    await handleDirectTokenLogin(loginScenario.directLoginToken);
    return;
  }

  if (loginScenario.shouldLoadLoginPageConfig) {
    await loadLoginPageConfig();
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
      <span>{{ ui.login.headerTitle }}</span>
    </div>

    <div class="login-container">
      <div class="login-box">
        <div class="login-form">
          <ObLoginBoxV2
            v-model:username="form.username"
            v-model:password="form.password"
            :title="ui.login.loginBoxTitle"
            :loading="loading"
            :encrypt="useVerifyLogin"
            :load-captcha="loadCaptcha"
            :check-captcha="fetchCaptchaCheck"
            :validate-password="false"
            username-label=""
            password-label=""
            username-placeholder="账号"
            password-placeholder="密码"
            @stage-change="handleLoginStageChange"
            @submit="doLogin"
          />
          <div v-if="showStageTip" class="login-stage-tip">
            <span class="login-stage-tip__spinner" />
            <span>{{ stageText }}</span>
          </div>
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

.login-stage-tip {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 12px;
  color: #0f79e9;
  font-size: 13px;
  line-height: 20px;
}

.login-stage-tip__spinner {
  box-sizing: border-box;
  width: 14px;
  height: 14px;
  border: 2px solid rgb(15 121 233 / 30%);
  border-top-color: #0f79e9;
  border-radius: 50%;
  animation: login-stage-spin 0.7s linear infinite;
}

@keyframes login-stage-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
