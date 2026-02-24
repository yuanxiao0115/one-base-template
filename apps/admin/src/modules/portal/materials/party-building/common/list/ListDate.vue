<template>
  <div class="pb-list-date" :class="{ inline }">
    {{ text }}
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    text?: string;
    inline?: boolean;
  }>(),
  {
    text: '',
    inline: false
  }
);

defineOptions({
  name: 'pb-list-date'
});
</script>

<style scoped>
.pb-list-date {
  margin-top: 4px;
  font-size: var(--list-date-font-size, 14px);
  color: var(--list-date-color, #9095a1);
}

.pb-list-date.inline {
  margin-top: 0;
  white-space: nowrap;
}
</style>
