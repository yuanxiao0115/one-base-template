<script setup lang="ts">
import { computed } from 'vue';
import { useSystemStore, useTabsStore } from '@one-base-template/core';

const tabsStore = useTabsStore();
const systemStore = useSystemStore();

const viewKeyPrefix = computed(() => (systemStore.currentSystemCode ? systemStore.currentSystemCode : 'default'));
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive :include="tabsStore.cacheNames">
      <component :is="Component" :key="`${viewKeyPrefix}:${route.fullPath}`" />
    </keep-alive>
  </router-view>
</template>
