<script setup lang="ts">
  import type { CSSProperties } from 'vue';

  const props = withDefaults(
    defineProps<{
      contentScrollStyle?: CSSProperties;
    }>(),
    {
      contentScrollStyle: () => ({}),
    }
  );
</script>

<template>
  <div class="preview-layout preview-layout--header-footer-fixed-content-scroll">
    <div class="preview-layout__header">
      <slot name="header" />
    </div>
    <div class="preview-layout__content">
      <div class="preview-layout__content-scroll" :style="props.contentScrollStyle">
        <slot name="content" />
      </div>
    </div>
    <div class="preview-layout__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
  .preview-layout {
    display: flex;
    min-height: 0;
    height: 100%;
    flex-direction: column;
  }

  .preview-layout__header,
  .preview-layout__footer {
    flex: none;
    min-height: 0;
  }

  .preview-layout__content {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .preview-layout__content-scroll {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
</style>
