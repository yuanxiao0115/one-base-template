<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goPermissionPage = async (): Promise<void> => {
  await router.push('/system/permission');
};

const mockSsoToken = async (): Promise<void> => {
  await router.push('/sso?token=demo&redirect=%2Fhome');
};

const mockSsoTicket = async (): Promise<void> => {
  await router.push('/sso?ticket=st-demo&redirect=%2Fhome');
};

const staticMenuModeHint = [
  '你可以通过 apps/admin-lite/src/config/app.ts 的 menuMode=static',
  '切换为静态菜单模式。'
].join(' ');

defineOptions({
  name: 'HomePage'
});
</script>

<template>
  <div class="space-y-4">
    <el-card>
      <template #header> <div class="font-medium">欢迎</div> </template>
      <div class="text-[var(--el-text-color-regular)] text-sm">
        这是一个可拆可切的 Monorepo 脚手架示例：静态路由 + 动态菜单（菜单树决定可访问路由）。
      </div>
      <div class="flex gap-2 mt-3">
        <el-button type="primary" @click="goPermissionPage"> 去权限管理 </el-button>
        <el-button @click="mockSsoToken">模拟 SSO(token)</el-button>
        <el-button @click="mockSsoTicket">模拟 SSO(ticket)</el-button>
      </div>
    </el-card>

    <el-alert title="提示" type="info" :closable="false" :description="staticMenuModeHint" />
  </div>
</template>
