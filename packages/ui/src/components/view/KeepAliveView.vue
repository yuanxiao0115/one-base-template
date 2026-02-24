<script setup lang="ts">
import { computed } from 'vue';
import { useTagStoreHook } from '@one/tag';

const tagStore = useTagStoreHook();

const cacheNames = computed(() => {
  const names = new Set<string>();

  for (const tag of tagStore.multiTags) {
    if (!tag.meta?.keepAlive) continue;

    const name = typeof tag.name === 'string' && tag.name ? tag.name : '';
    if (name) names.add(name);
  }

  return Array.from(names);
});
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive :include="cacheNames">
      <component :is="Component" :key="route.fullPath" />
    </keep-alive>
  </router-view>
</template>
