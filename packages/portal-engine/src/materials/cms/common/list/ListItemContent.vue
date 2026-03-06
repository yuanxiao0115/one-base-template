<template>
  <div class="pb-list-item-content"><slot /></div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'PbListItemContent',
  });
</script>

<style scoped>
  .pb-list-item-content {
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    flex: 1;
    flex-direction: column;
  }
</style>
