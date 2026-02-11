<script setup lang="ts">
defineOptions({
  name: 'ForbiddenPage'
});
</script>

<template>
  <el-result icon="warning" title="403" sub-title="无权限访问该页面" />
</template>
