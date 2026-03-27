<script setup lang="ts">
defineOptions({
  name: 'TemplateHomePage'
});
</script>

<template>
  <ObPageContainer padding="16px">
    <el-card>
      <template #header>
        <div>Template 迁移基座</div>
      </template>
      <p>当前项目已对齐 admin 启动骨架与模块装配契约。</p>
      <p>后续新子项目请在 modules 目录内新增业务模块并接入 platform-config 的 enabledModules。</p>
    </el-card>
  </ObPageContainer>
</template>
