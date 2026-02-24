<script setup lang="ts">
defineOptions({
  name: 'Home'
});
</script>

<template>
  <div class="space-y-4">
    <el-card>
      <template #header>
        <div class="font-medium">欢迎</div>
      </template>
      <div class="text-sm text-[var(--el-text-color-regular)]">
        这是一个可拆可切的 Monorepo 脚手架示例：静态路由 + 动态菜单（菜单树决定可访问路由）。
      </div>
      <div class="mt-3 flex gap-2">
        <el-button type="primary" @click="$router.push('/demo/page-a')">去示例页面</el-button>
        <el-button @click="$router.push('/sso?token=demo&redirect=%2Fhome')">模拟 SSO(token)</el-button>
        <el-button @click="$router.push('/sso?ticket=st-demo&redirect=%2Fhome')">模拟 SSO(ticket)</el-button>
      </div>
    </el-card>

    <el-alert
      title="提示"
      type="info"
      :closable="false"
      description="你可以通过 apps/admin/public/platform-config.json 的 menuMode=static 切换为静态菜单模式。"
    />
  </div>
</template>
