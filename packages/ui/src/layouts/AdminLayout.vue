<script setup lang="ts">
import { computed } from 'vue';
import { useLayoutStore } from '@one-base-template/core';

import SideLayout from './modes/SideLayout.vue';
import TopLayout from './modes/TopLayout.vue';
import TopSideLayout from './modes/TopSideLayout.vue';

const layoutStore = useLayoutStore();

const layoutComponent = computed(() => {
  switch (layoutStore.mode) {
    case 'top':
      return TopLayout;
    case 'top-side':
      return TopSideLayout;
    case 'side':
    default:
      return SideLayout;
  }
});
</script>

<template>
  <component :is="layoutComponent" />
</template>

