<script setup lang="ts">
defineOptions({
  name: 'TemplateAboutPage'
});
</script>

<template>
  <ObPageContainer padding="16px">
    <el-card>
      <template #header>
        <div>改造说明</div>
      </template>
      <ul>
        <li>平台配置入口：`apps/template/src/config/platform-config.ts`</li>
        <li>模块契约：`manifest.ts + module.ts + routes.ts`</li>
        <li>架构门禁：`pnpm -C apps/template lint:arch`</li>
      </ul>
    </el-card>
  </ObPageContainer>
</template>
