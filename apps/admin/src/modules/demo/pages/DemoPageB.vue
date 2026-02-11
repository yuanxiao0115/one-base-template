<script setup lang="ts">
defineOptions({
  name: 'DemoPageB'
});
</script>

<template>
  <el-card>
    <template #header>
      <div class="font-medium">页面 B</div>
    </template>
    <p class="text-sm text-[var(--el-text-color-regular)]">
      这里是另一个页面。
    </p>
  </el-card>
</template>
