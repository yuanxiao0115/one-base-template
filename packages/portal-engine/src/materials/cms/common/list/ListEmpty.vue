<template>
  <div class="cms-list-empty">{{ text }}</div>
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      text?: string;
    }>(),
    {
      text: '暂无列表项',
    }
  );

  defineOptions({
    name: 'PbListEmpty',
  });
</script>

<style scoped>
  .cms-list-empty {
    padding: 20px 0;
    width: 100%;
    font-size: 14px;
    text-align: center;
    color: #909399;
  }
</style>
