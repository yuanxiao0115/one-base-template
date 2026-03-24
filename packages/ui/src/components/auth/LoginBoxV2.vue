<script setup lang="ts">
import { ref } from 'vue';
import LoginBox, { type LoginBoxSubmitPayload } from './LoginBox.vue';
import VerifySlide from './VerifySlide.vue';

defineOptions({
  name: 'LoginBoxV2'
});

interface CaptchaBlockPuzzleData {
  originBase64?: string;
  jigsawBase64?: string;
  captchaKey?: string;
  [k: string]: unknown;
}

interface CaptchaBizResponse<T> {
  code?: unknown;
  data?: T;
  message?: string;
}

interface LoginBoxV2SubmitPayload extends LoginBoxSubmitPayload {
  captcha: string;
  captchaKey: string;
  encrypt?: 1;
}

type LoginBoxV2Stage =
  | 'idle'
  | 'captcha-opening'
  | 'captcha-loading'
  | 'captcha-checking'
  | 'captcha-passed';

const props = withDefaults(
  defineProps<{
    username: string;
    password: string;
    title?: string;
    usernameLabel?: string;
    passwordLabel?: string;
    usernamePlaceholder?: string;
    passwordPlaceholder?: string;
    submitText?: string;
    loading?: boolean;
    size?: 'default' | 'large' | 'small';
    requireUsername?: boolean;
    validatePassword?: boolean;
    passwordPattern?: RegExp;
    passwordRuleMessage?: string;
    encrypt?: boolean;
    sm4KeyHex?: string;
    loadCaptcha: (params: {
      captchaKey: string;
    }) => Promise<CaptchaBizResponse<CaptchaBlockPuzzleData>>;
    checkCaptcha: (params: {
      captcha: string;
      captchaKey: string;
    }) => Promise<CaptchaBizResponse<unknown>>;
  }>(),
  {
    title: '',
    usernameLabel: '账号',
    passwordLabel: '密码',
    usernamePlaceholder: '请输入账号',
    passwordPlaceholder: '请输入密码',
    submitText: '登录',
    loading: false,
    size: 'large',
    requireUsername: true,
    validatePassword: true,
    passwordPattern: () =>
      /^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?!([^(0-9a-zA-Z)]|[()])+$)(?!^.*[\u4E00-\u9FA5].*$)([^(0-9a-zA-Z)]|[()]|[a-z]|[A-Z]|[0-9]){8,18}$/,
    passwordRuleMessage: '密码格式应为8-18位数字、字母、符号的任意两种组合',
    encrypt: false,
    sm4KeyHex: '6f889d54ad8c4ddb8c525fc96a185444'
  }
);

const emit = defineEmits<{
  'update:username': [value: string];
  'update:password': [value: string];
  submit: [payload: LoginBoxV2SubmitPayload];
  'stage-change': [stage: LoginBoxV2Stage];
}>();

const verifyRef = ref<InstanceType<typeof VerifySlide> | null>(null);
const pendingPayload = ref<LoginBoxSubmitPayload | null>(null);

async function handleBaseSubmit(payload: LoginBoxSubmitPayload) {
  pendingPayload.value = payload;
  emit('stage-change', 'captcha-opening');
  await verifyRef.value?.show();
}

function handleVerifySuccess(payload: { captcha: string; captchaKey: string }) {
  if (!pendingPayload.value) {
    return;
  }

  emit('stage-change', 'captcha-passed');
  emit('submit', {
    ...pendingPayload.value,
    ...payload,
    ...(props.encrypt ? { encrypt: 1 as const } : {})
  });
  pendingPayload.value = null;
}

function handleVerifyClose() {
  emit('stage-change', 'idle');
}

function handleVerifyError() {
  emit('stage-change', 'idle');
}

function handleCaptchaLoadingChange(loading: boolean) {
  emit('stage-change', loading ? 'captcha-loading' : 'idle');
}

function handleCaptchaCheckingChange(checking: boolean) {
  emit('stage-change', checking ? 'captcha-checking' : 'idle');
}
</script>

<template>
  <LoginBox
    :username="username"
    :password="password"
    :title="title"
    :username-label="usernameLabel"
    :password-label="passwordLabel"
    :username-placeholder="usernamePlaceholder"
    :password-placeholder="passwordPlaceholder"
    :submit-text="submitText"
    :loading="loading"
    :size="size"
    :require-username="requireUsername"
    :validate-password="validatePassword"
    :password-pattern="passwordPattern"
    :password-rule-message="passwordRuleMessage"
    :encrypt="encrypt"
    :sm4-key-hex="sm4KeyHex"
    @update:username="emit('update:username', $event)"
    @update:password="emit('update:password', $event)"
    @submit="handleBaseSubmit"
  />

  <VerifySlide
    ref="verifyRef"
    :load-captcha="loadCaptcha"
    :check-captcha="checkCaptcha"
    :sm4-key-hex="sm4KeyHex"
    @loading-change="handleCaptchaLoadingChange"
    @checking-change="handleCaptchaCheckingChange"
    @success="handleVerifySuccess"
    @error="handleVerifyError"
    @close-box="handleVerifyClose"
  />
</template>
