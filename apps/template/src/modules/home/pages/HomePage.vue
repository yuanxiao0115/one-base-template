<script setup lang="ts">
defineOptions({
  name: 'TemplateHomePage'
});
</script>

<template>
  <ObPageContainer padding="16px">
    <el-card>
      <template #header>
        <div>Template 最小项目</div>
      </template>
      <p>这是一个使用静态菜单的最小可用后台模板。</p>
      <p>菜单来源：`src/modules/**/routes.ts` 的 `meta.title`。</p>
    </el-card>
  </ObPageContainer>
</template>
