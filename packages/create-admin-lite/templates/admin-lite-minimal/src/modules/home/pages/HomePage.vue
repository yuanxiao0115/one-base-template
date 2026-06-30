<script setup lang="ts">
defineOptions({
  name: 'HomePage'
});
</script>

<template>
  <div class="space-y-4">
    <el-card>
      <template #header> <div class="font-medium">欢迎</div> </template>
      <div class="text-[var(--el-text-color-regular)] text-sm">
        这是一个最小后台基座：登录、首页、布局、路由、HTTP、鉴权、菜单和主题已经接好。
      </div>
    </el-card>
  </div>
</template>
