<script setup lang="ts">
  import { computed, useSlots } from 'vue';

  interface ObCardProps {
    title?: string;
  }

  const props = withDefaults(defineProps<ObCardProps>(), {
    title: '',
  });

  defineOptions({
    name: 'ObCard',
  });

  const slots = useSlots();
  const hasTitle = computed(() => Boolean(props.title || slots.title));
</script>

<template>
  <section class="ob-card">
    <header v-if="hasTitle" class="ob-card__header">
      <slot name="title">{{ props.title }}</slot>
    </header>
    <div class="ob-card__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
  .ob-card {
    margin-bottom: 16px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 16px;
    background: #fff;
  }

  .ob-card__header {
    margin: 0 0 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
    color: #333;
  }

  .ob-card__header::before {
    width: 4px;
    height: 14px;
    border-radius: 2px;
    background: var(--el-color-primary);
    content: '';
  }

  .ob-card__body {
    min-width: 0;
  }
</style>
