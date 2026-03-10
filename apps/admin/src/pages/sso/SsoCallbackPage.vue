<script setup lang="ts">
  import { finalizeAuthSession, handleSsoCallback } from "@one-base-template/core";
  import { ElMessage } from "element-plus";
  import { onMounted, ref } from "vue";
  import { useRouter } from "vue-router";
  import { DEFAULT_FALLBACK_HOME } from "@/config/systems";
  import { getAppEnv } from "@/infra/env";
  import { APP_LOGIN_ROUTE_PATH } from "@/router/constants";
  import { getAppRedirectTarget } from "@/router/redirect";
  import {
    loginByDesktop,
    loginByExternal,
    loginByTicket,
    loginByYdbg,
    loginByZhxt,
  } from "@/shared/services/auth-remote-service";

  defineOptions({
    name: "SsoCallbackPage",
  });

  const appEnv = getAppEnv();
  const router = useRouter();
  const loading = ref(true);
  const errorMessage = ref("");
  const loginStatus = ref<"" | "fail" | "success">("");

  const { backend } = appEnv;
  const { baseUrl } = appEnv;
  const { tokenKey } = appEnv;
  const { idTokenKey } = appEnv;

  function safeMessage(e: unknown, fallback: string) {
    return e instanceof Error && e.message ? e.message : fallback;
  }

  async function setTokenAndBootstrap(token: string, redirect: string) {
    localStorage.setItem(tokenKey, token);
    await finalizeAuthSession({ shouldFetchMe: true });

    loginStatus.value = "success";
    await router.replace(redirect);
  }

  async function handleZhxt(token: string, redirect: string) {
    const res = await loginByZhxt(token);
    const authToken = res.data?.authToken;
    if (!authToken) {
      throw new Error(res.message || "智慧协同单点登录失败");
    }
    await setTokenAndBootstrap(authToken, redirect);
  }

  async function handleYdbg(token: string, redirect: string) {
    const res = await loginByYdbg(token);
    const authToken = res.data?.authToken;
    if (!authToken) {
      throw new Error(res.message || "移动办公单点登录失败");
    }
    await setTokenAndBootstrap(authToken, redirect);
  }

  async function handleTicket(ticket: string, redirectUrlRaw: string | null, redirect: string) {
    // 老项目行为：serviceUrl = redirectUrl ? `${origin}/${redirectUrl}` : 当前完整 URL
    const serviceUrl = redirectUrlRaw ? `${window.location.origin}/${redirectUrlRaw}` : window.location.href;

    const res = await loginByTicket({
      ticket,
      serviceUrl,
    });

    const authToken = res.data?.authToken;
    if (!authToken) {
      throw new Error(res.message || "票据验证失败");
    }
    await setTokenAndBootstrap(authToken, redirect);
  }

  async function handleTypeToken(token: string, redirect: string) {
    await setTokenAndBootstrap(token, redirect);
  }

  async function handleExternalSso(params: { from: "om" | "portal"; token: string; redirect: string }) {
    const res = await loginByExternal({
      from: params.from,
      token: params.token,
    });

    const authToken = res.data?.token ?? res.data?.authToken;
    if (!authToken) {
      throw new Error(res.message || "SSO 登录失败");
    }
    localStorage.setItem(tokenKey, authToken);

    // 兼容老项目：额外换取 idToken（用于后续桌面统一认证场景）
    const ssoRes = await loginByDesktop();
    const idToken = ssoRes.data?.idToken;
    if (idToken) {
      localStorage.setItem(idTokenKey, idToken);
    }

    await setTokenAndBootstrap(authToken, params.redirect);
  }

  onMounted(async () => {
    loading.value = true;
    errorMessage.value = "";
    loginStatus.value = "";

    try {
      if (backend !== "sczfw") {
        const { redirect } = await handleSsoCallback();
        await router.replace(getAppRedirectTarget(redirect, { fallback: DEFAULT_FALLBACK_HOME, baseUrl }));
        loginStatus.value = "success";
        return;
      }

      const url = new URL(window.location.href);
      const sp = url.searchParams;

      const token = sp.get("token");
      const type = sp.get("type");
      const userToken = sp.get("Usertoken");
      const moaToken = sp.get("moaToken");
      const ticket = sp.get("ticket");
      const sourceCode = sp.get("sourceCode");

      const redirectUrlRaw = sp.get("redirectUrl") ?? sp.get("redirect");
      const redirect = getAppRedirectTarget(redirectUrlRaw, {
        fallback: DEFAULT_FALLBACK_HOME,
        baseUrl,
      });

      if (sourceCode === "zhxt" && token) {
        await handleZhxt(token, redirect);
        return;
      }

      if (sourceCode === "YDBG" && token) {
        await handleYdbg(token, redirect);
        return;
      }

      if (ticket) {
        // ticket 流程对 serviceUrl 有特殊要求，这里保持与老项目一致，不走 core 的通用处理
        await handleTicket(ticket, sp.get("redirectUrl"), redirect);
        return;
      }

      if (type && token) {
        await handleTypeToken(token, redirect);
        return;
      }

      if (moaToken) {
        await handleExternalSso({
          from: "om",
          token: moaToken,
          redirect,
        });
        return;
      }

      if (userToken) {
        await handleExternalSso({
          from: "portal",
          token: userToken,
          redirect,
        });
        return;
      }

      throw new Error("登录参数无效");
    } catch (e: unknown) {
      loginStatus.value = "fail";
      errorMessage.value = safeMessage(e, "SSO 登录失败");
      ElMessage.error(errorMessage.value);
      localStorage.removeItem(tokenKey);
    } finally {
      loading.value = false;
    }
  });
</script>

<template>
  <div class="bg-(--el-bg-color-page) flex h-screen items-center justify-center w-screen">
    <el-card class="max-w-md w-full">
      <template #header> <div class="font-medium">SSO 登录</div> </template>

      <div v-if="loading" class="text-[var(--el-text-color-regular)] text-sm">正在处理 SSO 回调，请稍候。</div>

      <div v-else-if="loginStatus === 'fail'" class="text-sm">
        <p class="text-[var(--el-text-color-regular)]">{{ errorMessage || '登录失败' }}</p>
        <div class="mt-4">
          <el-button type="primary" @click="router.replace(APP_LOGIN_ROUTE_PATH)">返回登录页</el-button>
        </div>
      </div>

      <div v-else class="text-[var(--el-text-color-regular)] text-sm">登录成功，正在跳转...</div>
    </el-card>
  </div>
</template>
