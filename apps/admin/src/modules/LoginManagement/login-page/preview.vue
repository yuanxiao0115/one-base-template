<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { message } from '@one-base-template/ui';
import { loginPageApi } from './api';
import type { LoginPageRecord } from './types';
import { createLatestRequestGuard } from '../shared/latestRequest';
import { getErrorMessage, normalizeFodderId } from '../shared/utils';

defineOptions({
  name: 'PortalLoginPagePreview'
});

const route = useRoute();
const detailLoading = ref(false);
const detail = ref<LoginPageRecord | null>(null);

const detailGuard = createLatestRequestGuard();

const previewTitle = computed(() => detail.value?.modelName || '登录页预览');
const logoText = computed(() => detail.value?.webLogoText || '欢迎登录');
const boxLocation = computed(() => (detail.value?.boxLocation === 'center' ? 'center' : 'right'));
const boxOpacity = computed(() =>
  typeof detail.value?.boxOpacity === 'number'
    ? Math.min(Math.max(detail.value.boxOpacity, 0), 100)
    : 100
);

const logoFodderId = computed(() => normalizeFodderId(detail.value?.webLoginLogo));
const backgroundFodderId = computed(() => {
  const fodders = Array.isArray(detail.value?.loginPageFodders)
    ? detail.value.loginPageFodders
    : [];
  if (fodders.length === 0) {
    return '';
  }
  return normalizeFodderId(fodders[0]);
});

const logoUrl = computed(() =>
  logoFodderId.value ? `/cmict/file/resource/show?id=${logoFodderId.value}` : ''
);
const backgroundUrl = computed(() =>
  backgroundFodderId.value ? `/cmict/file/resource/show?id=${backgroundFodderId.value}` : ''
);

const loginBoxStyle = computed(() => {
  const baseStyle = {
    opacity: boxOpacity.value / 100
  };

  if (boxLocation.value === 'center') {
    return {
      ...baseStyle,
      margin: '0 auto'
    };
  }

  return baseStyle;
});

async function loadDetail(id: string) {
  if (!id) {
    detail.value = null;
    return;
  }

  detailLoading.value = true;
  const token = detailGuard.next();

  try {
    const response = await loginPageApi.detail(id);
    if (!detailGuard.isLatest(token)) {
      return;
    }

    if (response.code !== 200) {
      throw new Error(response.message || '加载预览详情失败');
    }

    detail.value = response.data;
  } catch (error) {
    if (!detailGuard.isLatest(token)) {
      return;
    }
    detail.value = null;
    message.error(getErrorMessage(error, '加载预览详情失败'));
  } finally {
    if (detailGuard.isLatest(token)) {
      detailLoading.value = false;
    }
  }
}

watch(
  () => String(route.params.id || ''),
  (id) => {
    void loadDetail(id);
  },
  { immediate: true }
);
</script>

<template>
  <ObPageContainer padding="16px">
    <section class="login-page-preview">
      <header class="login-page-preview__header">
        <h2>{{ previewTitle }}</h2>
      </header>

      <el-skeleton v-if="detailLoading" animated :rows="6" />

      <div
        v-else
        class="login-page-preview__canvas"
        :style="{
          backgroundImage: backgroundUrl
            ? `url(${backgroundUrl})`
            : 'linear-gradient(140deg, #f1f5f9, #e2e8f0)'
        }"
      >
        <div
          class="login-page-preview__form-box"
          :class="{
            'is-center': boxLocation === 'center',
            'is-right': boxLocation === 'right'
          }"
          :style="loginBoxStyle"
        >
          <div class="login-page-preview__logo-wrap">
            <img v-if="logoUrl" :src="logoUrl" alt="logo" class="login-page-preview__logo" />
            <div v-else class="login-page-preview__logo-placeholder">Logo</div>
            <p class="login-page-preview__logo-text">{{ logoText }}</p>
          </div>

          <el-form label-position="top">
            <el-form-item label="账号">
              <el-input placeholder="请输入账号" disabled />
            </el-form-item>
            <el-form-item label="密码">
              <el-input placeholder="请输入密码" show-password disabled />
            </el-form-item>
            <el-button type="primary" class="login-page-preview__button" disabled>登录</el-button>
          </el-form>
        </div>
      </div>
    </section>
  </ObPageContainer>
</template>

<style scoped>
.login-page-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.login-page-preview__header h2 {
  margin: 0;
  font-size: 18px;
}

.login-page-preview__canvas {
  min-height: calc(100vh - 240px);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-light);
  background-size: cover;
  background-position: center;
  padding: 32px;
  display: flex;
  align-items: center;
}

.login-page-preview__form-box {
  width: min(420px, 100%);
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.14);
}

.login-page-preview__form-box.is-right {
  margin-left: auto;
}

.login-page-preview__logo-wrap {
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.login-page-preview__logo {
  width: 56px;
  height: 56px;
  object-fit: contain;
}

.login-page-preview__logo-placeholder {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: #e2e8f0;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

.login-page-preview__logo-text {
  margin: 0;
  font-size: 14px;
  color: #1f2937;
}

.login-page-preview__button {
  width: 100%;
}

@media (max-width: 960px) {
  .login-page-preview__canvas {
    padding: 20px;
    min-height: calc(100vh - 220px);
  }

  .login-page-preview__form-box {
    margin: 0 auto;
    width: 100%;
  }
}
</style>
