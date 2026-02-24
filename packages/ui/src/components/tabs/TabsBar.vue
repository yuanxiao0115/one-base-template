<script setup lang="ts">
import { TagComponent } from '@one/tag';
</script>

<template>
  <div class="ob-tabs-bar">
    <TagComponent class="ob-tag-component" />
  </div>
</template>

<style scoped>
.ob-tabs-bar {
  height: 44px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}

.ob-tabs-bar :deep(.tags-view) {
  height: 44px;
  padding: 4px 10px;
  border: 0;
  background: transparent;
}

.ob-tabs-bar :deep(.tags-view .arrow-left),
.ob-tabs-bar :deep(.tags-view .arrow-right),
.ob-tabs-bar :deep(.tags-view .arrow-down) {
  width: 28px;
  height: 28px;
  border-radius: 4px;
}

.ob-tabs-bar :deep(.tags-view .scroll-item) {
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.2;
  padding: 2px 8px;
  margin-right: 6px;
}

.ob-tabs-bar :deep(.tags-view .scroll-item:not(:first-child)) {
  padding-right: 24px;
}

.ob-tabs-bar :deep(.tags-view .scroll-item .tag-title) {
  padding: 0;
}

.ob-tabs-bar :deep(.tags-view .scroll-item .tag-close-icon) {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  font-size: 12px;
}
</style>
