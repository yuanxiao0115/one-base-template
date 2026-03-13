<template>
  <div class="config-tip">透明占位模块无样式配置。</div>
</template>

<script setup lang="ts">
  defineProps({
    schema: {
      type: Object,
      required: true,
    },
  });

  defineOptions({
    name: 'base-transparent-placeholder-style',
  });
</script>

<style scoped>
  .config-tip {
    font-size: 12px;
    line-height: 1.6;
    color: #64748b;
  }
</style>
