<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';

import { useAuthStore, useMenuStore, type LoginPayload } from '@one-base-template/core';
import { getObHttpClient } from '@/infra/http';
import VerifySlide from '@/components/verifition-plus/VerifySlide.vue';
import { sm4EncryptBase64 } from '@/infra/sczfw/crypto';

defineOptions({
  name: 'LoginPage'
});

type BackendKind = 'default' | 'sczfw';

type BizResponse<T> = {
  code?: unknown;
  data?: T;
  message?: string;
};

type LoginPageConfig = {
  webLogoText?: string;
  loginPageFodders?: string[];
  [k: string]: unknown;
};

const router = useRouter();
const route = useRoute();

const authStore = useAuthStore();
const menuStore = useMenuStore();

const backend = computed<BackendKind>(() => {
  const raw = import.meta.env.VITE_BACKEND;
  if (raw === 'sczfw' || raw === 'default') return raw;
  // 默认策略：配置了真实后端地址 -> 使用 sczfw 适配器；否则保持模板默认（mock + /api）
  return import.meta.env.VITE_API_BASE_URL ? 'sczfw' : 'default';
});

const tokenKey = computed(() => {
  const envKey = import.meta.env.VITE_TOKEN_KEY;
  if (typeof envKey === 'string' && envKey) return envKey;
  // 兼容老项目：默认 token 存储键名为 token
  return backend.value === 'sczfw' ? 'token' : 'ob_token';
});

const loading = ref(false);
const formRef = ref<FormInstance>();
const verifyRef = ref<InstanceType<typeof VerifySlide> | null>(null);

const form = reactive({
  username: '',
  password: ''
});

const loginInfoConfig = ref<LoginPageConfig | null>(null);
const backgroundImage = ref('');

function normalizeRedirect(raw: unknown, fallback: string): string {
  if (typeof raw !== 'string' || !raw) return fallback;
  if (!raw.startsWith('/')) return fallback;
  if (raw.startsWith('//')) return fallback;
  return raw;
}

function getRedirectTarget() {
  // 兼容老项目常用 query：redirectUrl
  const raw = route.query.redirect ?? route.query.redirectUrl;
  const fallback = backend.value === 'sczfw' ? '/home/index' : '/';
  return normalizeRedirect(raw, fallback);
}

const rules: FormRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [
    {
      validator: (_rule, value: string, callback) => {
        // 密码格式应为 8-18 位：数字/字母/符号任意两种组合，且不允许中文
        const REGEXP_PWD =
          /^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?!([^(0-9a-zA-Z)]|[()])+$)(?!^.*[\u4E00-\u9FA5].*$)([^(0-9a-zA-Z)]|[()]|[a-z]|[A-Z]|[0-9]){8,18}$/;
        if (!value) return callback(new Error('请输入密码'));
        if (!REGEXP_PWD.test(value)) return callback(new Error('密码格式应为8-18位数字、字母、符号的任意两种组合'));
        callback();
      },
      trigger: 'blur'
    }
  ]
};

async function loadLoginPageConfig() {
  const http = getObHttpClient();
  const res = await http.get<BizResponse<LoginPageConfig>>('/cmict/portal/getLoginPage', {
    $noErrorAlert: true
  });

  if (!res || res.code !== 200) return;

  loginInfoConfig.value = res.data ?? null;

  const firstImgId = res.data?.loginPageFodders?.[0];
  if (firstImgId) {
    backgroundImage.value = `/cmict/file/resource/show?id=${firstImgId}`;
  }
}

async function handleDirectTokenLogin(token: string) {
  localStorage.setItem(tokenKey.value, token);
  try {
    await authStore.fetchMe();
    await menuStore.loadMenus();
    await router.replace(getRedirectTarget());
  } catch (e: unknown) {
    const message = e instanceof Error && e.message ? e.message : '登录失败';
    ElMessage.error(message);
    localStorage.removeItem(tokenKey.value);
  }
}

async function doDefaultLogin() {
  loading.value = true;
  try {
    await authStore.login({ username: form.username, password: form.password });
    await menuStore.loadMenus();
    await router.replace(getRedirectTarget());
  } catch (e: unknown) {
    const message = e instanceof Error && e.message ? e.message : '登录失败';
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
}

async function doSczfwLogin(captcha: { captcha: string; captchaKey: string }) {
  loading.value = true;
  try {
    const payload: LoginPayload = {
      username: sm4EncryptBase64(form.username),
      password: sm4EncryptBase64(form.password),
      captcha: captcha.captcha,
      captchaKey: captcha.captchaKey,
      encrypt: 1
    };

    await authStore.login(payload);
    await menuStore.loadMenus();
    await router.replace(getRedirectTarget());
  } catch (e: unknown) {
    const message = e instanceof Error && e.message ? e.message : '登录失败';
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
}

async function onSubmit() {
  if (backend.value === 'default') {
    await doDefaultLogin();
    return;
  }

  if (!formRef.value) return;

  const valid = await formRef.value
    .validate()
    .then(() => true)
    .catch(() => false);

  if (!valid) return;

  // 验证码弹层
  await verifyRef.value?.show();
}

function onCaptchaSuccess(payload: { captcha: string; captchaKey: string }) {
  void doSczfwLogin(payload);
}

onMounted(async () => {
  if (backend.value === 'default') {
    form.username = 'demo';
    form.password = 'demo';
    return;
  }

  await loadLoginPageConfig();

  // 兼容老项目：/login?token=xxx 直接免密登录
  const token = route.query.token;
  if (typeof token === 'string' && token) {
    await handleDirectTokenLogin(token);
  }
});
</script>

<template>
  <!-- 默认模板：mock(/api) + 简单表单 -->
  <div v-if="backend === 'default'" class="h-screen w-screen flex items-center justify-center bg-[var(--el-bg-color-page)] p-4">
    <el-card class="w-full max-w-md">
      <template #header>
        <div class="font-medium">登录</div>
      </template>

      <el-form label-position="top">
        <el-form-item label="账号">
          <el-input v-model="form.username" autocomplete="username" @keyup.enter="onSubmit" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" autocomplete="current-password" show-password @keyup.enter="onSubmit" />
        </el-form-item>
        <el-button class="w-full" type="primary" :loading="loading" @click="onSubmit">
          登录
        </el-button>
      </el-form>

      <div class="mt-3 text-xs text-[var(--el-text-color-regular)]">
        开发模式下使用 Vite middleware mock，无需后端。
      </div>
    </el-card>
  </div>

  <!-- sczfw：移植 standard-oa-web-sczfw 登录页（滑块验证码 + SM4 加密 + 动态背景） -->
  <div v-else class="login-desktop" :style="{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined }">
    <div class="login-header">
      <span v-if="loginInfoConfig?.webLogoText">{{ loginInfoConfig.webLogoText }}</span>
      <el-divider v-if="loginInfoConfig?.webLogoText" direction="vertical" />
      <span>后台管理</span>
    </div>

    <div class="login-container">
      <div class="login-box">
        <div class="login-form">
          <div class="title">用户登录</div>
          <el-form ref="formRef" :model="form" :rules="rules" size="large">
            <el-form-item prop="username" class="custom-input">
              <el-input v-model="form.username" clearable placeholder="账号" @keyup.enter="onSubmit" />
            </el-form-item>

            <el-form-item prop="password" class="custom-input">
              <el-input
                v-model="form.password"
                clearable
                show-password
                placeholder="密码"
                autocomplete="current-password"
                @keyup.enter="onSubmit"
              />
            </el-form-item>

            <el-button class="w-full mt-4 login-btn custom-color" type="primary" :loading="loading" @click="onSubmit">
              登录
            </el-button>
          </el-form>
        </div>
      </div>
    </div>

    <VerifySlide ref="verifyRef" :img-size="{ width: '350px', height: '175px' }" @success="onCaptchaSuccess" />
  </div>
</template>

<style scoped>
.login-desktop {
  height: 100vh;
  min-width: 1200px;
  background-color: #0f79e9;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  overflow: hidden;
  position: relative;
}

.login-header {
  height: 56px;
  box-sizing: border-box;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.login-header span {
  font-size: 40px;
  font-weight: 500;
  color: #ffffff;
  margin: 0 24px;
}

.login-container {
  margin-top: -5%;
  background-color: #ffffff;
  padding: 24px 48px 48px 48px;
  border-radius: 8px;
}

.login-container .title {
  text-align: center;
  font-size: 28px;
  height: 72px;
  color: #333333;
  font-weight: bold;
}

.login-container .login-form {
  width: 360px;
}

.login-container .login-btn {
  background: #0f79e9;
  height: 40px;
  color: #fff !important;
}

.login-box {
  display: flex;
  align-items: center;
  text-align: center;
  overflow: hidden;
}

.custom-color {
  border-color: transparent !important;
}
</style>
