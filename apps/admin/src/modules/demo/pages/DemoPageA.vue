<script setup lang="ts">
defineOptions({
  name: 'DemoPageA'
});
</script>

<template>
  <el-card>
    <template #header>
      <div class="font-medium">页面 A</div>
    </template>
    <p class="text-sm text-[var(--el-text-color-regular)]">
      用于演示 tabs + keep-alive。切换到页面 B 再回来，观察组件是否被缓存。
    </p>
    <div class="mt-4">
      <el-input placeholder="输入点东西以验证缓存" />
    </div>
  </el-card>
</template>
