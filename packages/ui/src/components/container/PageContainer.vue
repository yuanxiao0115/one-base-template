<script setup lang="ts">
import { computed } from 'vue';

defineOptions({
  name: 'PageContainer'
});

type PageContainerOverflow = 'auto' | 'scroll' | 'hidden';

interface PageContainerProps {
  padding?: string;
  overflow?: PageContainerOverflow;
}

const props = withDefaults(defineProps<PageContainerProps>(), {
  padding: '0',
  overflow: 'auto'
});

const containerStyle = computed(() => ({
  '--ob-page-container-padding': props.padding,
  '--ob-page-container-overflow': props.overflow
}));
</script>

<template>
  <section class="ob-page-container" :style="containerStyle">
    <header v-if="$slots.header" class="ob-page-container__header">
      <slot name="header" />
    </header>

    <div class="ob-page-container__body">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="ob-page-container__footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped>
.ob-page-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.ob-page-container__header,
.ob-page-container__footer {
  flex-shrink: 0;
}

.ob-page-container__body {
  flex: 1;
  min-width: 0;
  min-height: 0;
  padding: var(--ob-page-container-padding);
  overflow: var(--ob-page-container-overflow);
}
</style>
