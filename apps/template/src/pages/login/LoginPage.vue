<script setup lang="ts">
  import { finalizeAuthSession, safeRedirect, useAuthStore } from "@one-base-template/core";
  import { ElMessage } from "element-plus";
  import { reactive, ref } from "vue";
  import { useRoute, useRouter } from "vue-router";

  defineOptions({
    name: "TemplateLoginPage",
  });

  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();

  const loading = ref(false);
  const form = reactive({
    username: "demo",
    password: "demo",
  });

  function getRedirectTarget() {
    return safeRedirect(route.query.redirect, "/home/index");
  }

  async function onSubmit() {
    loading.value = true;
    try {
      await authStore.login({
        username: form.username,
        password: form.password,
      });
      await finalizeAuthSession({ shouldFetchMe: false });
      await router.replace(getRedirectTarget());
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : "登录失败";
      ElMessage.error(message);
    } finally {
      loading.value = false;
    }
  }
</script>

<template>
  <div class="template-login">
    <el-card class="template-login__card">
      <template #header>
        <div>Template 登录</div>
      </template>

      <el-form label-position="top">
        <el-form-item label="账号">
          <el-input v-model="form.username" autocomplete="username" @keyup.enter="onSubmit" />
        </el-form-item>

        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            show-password
            @keyup.enter="onSubmit"
          />
        </el-form-item>

        <el-button class="w-full" type="primary" :loading="loading" @click="onSubmit"> 登录 </el-button>
      </el-form>

      <p class="template-login__tip">此项目默认使用本地 mock 鉴权，无需后端。</p>
    </el-card>
  </div>
</template>

<style scoped>
  .template-login {
    width: 100%;
    min-height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: #f5f7fa;
  }

  .template-login__card {
    width: 100%;
    max-width: 420px;
  }

  .template-login__tip {
    margin-top: 12px;
    color: #606266;
    font-size: 12px;
  }
</style>
