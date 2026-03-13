<template>
  <div class="config-tip">透明占位模块无属性配置。</div>
</template>

<script setup lang="ts">
  defineProps({
    schema: {
      type: Object,
      required: true,
    },
  });

  defineOptions({
    name: 'pb-transparent-placeholder-content',
  });
</script>

<style scoped>
  .config-tip {
    font-size: 12px;
    line-height: 1.6;
    color: #64748b;
  }
</style>
