<template>
  <div class="transparent-placeholder" aria-hidden="true" />
</template>

<script setup lang="ts">
  defineOptions({
    name: 'pb-transparent-placeholder-index',
  });
</script>

<style scoped>
  .transparent-placeholder {
    width: 100%;
    height: 100%;
    background: transparent;
    border: none;
    pointer-events: none;
  }
</style>
