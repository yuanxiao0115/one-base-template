<script setup lang="ts">
  defineOptions({
    name: "TemplateAboutPage",
  });
</script>

<template>
  <ObPageContainer padding="16px">
    <el-card>
      <template #header>
        <div>配置说明</div>
      </template>
      <ul>
        <li>运行时配置文件：`apps/template/public/platform-config.json`</li>
        <li>推荐最小配置：`{ "preset": "static-single" }`</li>
        <li>登录数据：本地鉴权（无后端依赖，仅 template 示例）</li>
      </ul>
    </el-card>
  </ObPageContainer>
</template>
