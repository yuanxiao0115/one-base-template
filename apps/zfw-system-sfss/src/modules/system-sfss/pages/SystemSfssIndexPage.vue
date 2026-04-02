<script setup lang="ts">
defineOptions({
  name: 'SystemSfssIndex'
});
</script>

<template>
  <el-card>
    <template #header>
      <div class="font-medium">涉法涉诉系统</div>
    </template>
    <el-alert
      type="success"
      :closable="false"
      title="System-sfss 模块已接入老项目路由路径，可直接联调登录/菜单链路。"
      show-icon
    />
    <p class="text-sm text-[var(--el-text-color-regular)] mt-3">
      老项目来源目录：<code
        >/Users/haoqiuzhi/code/monorepo-web/apps/zfw-system-sfss/src/views/System-sfss</code
      >
    </p>
  </el-card>
</template>
