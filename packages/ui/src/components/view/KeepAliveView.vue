<script setup lang="ts">
import { useTabsStore } from '@standard-base-tamplate/core';

const tabsStore = useTabsStore();
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive :include="tabsStore.cacheNames">
      <component :is="Component" :key="route.fullPath" />
    </keep-alive>
  </router-view>
</template>
