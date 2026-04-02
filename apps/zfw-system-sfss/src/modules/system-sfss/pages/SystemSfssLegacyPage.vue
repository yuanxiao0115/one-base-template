<script setup lang="ts">
import SystemSfssTodoPage from './SystemSfssTodoPage.vue';

defineOptions({
  name: 'SystemSfssLegacyPage'
});
</script>

<template>
  <SystemSfssTodoPage
    title="System-sfss legacy 占位页"
    legacy-file="System-sfss/*"
    route-path="(按子路由实际路径访问)"
  />
</template>
