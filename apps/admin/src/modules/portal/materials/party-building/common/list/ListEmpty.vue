<template>
  <div class="pb-list-empty">{{ text }}</div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    text?: string;
  }>(),
  {
    text: '暂无列表项'
  }
);

defineOptions({
  name: 'pb-list-empty'
});
</script>

<style scoped>
.pb-list-empty {
  padding: 20px 0;
  width: 100%;
  font-size: 14px;
  text-align: center;
  color: #909399;
}
</style>
