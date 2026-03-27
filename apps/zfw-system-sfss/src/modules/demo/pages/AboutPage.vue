<script setup lang="ts">
defineOptions({
  name: 'ZfwSystemSfssAboutPage'
});
</script>

<template>
  <ObPageContainer padding="16px">
    <el-card>
      <template #header>
        <div>改造说明</div>
      </template>
      <ul>
        <li>平台配置入口：`apps/zfw-system-sfss/src/config/platform-config.ts`</li>
        <li>模块契约：`manifest.ts + module.ts + routes.ts`</li>
        <li>架构门禁：`pnpm -C apps/zfw-system-sfss lint:arch`</li>
      </ul>
    </el-card>
  </ObPageContainer>
</template>
