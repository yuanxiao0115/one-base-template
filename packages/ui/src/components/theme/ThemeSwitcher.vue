<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from '@one-base-template/core';

const themeStore = useThemeStore();

const options = computed(() => Object.keys(themeStore.themes));

function onChange(value: unknown) {
  themeStore.setTheme(String(value));
}
</script>

<template>
  <el-select
    v-model="themeStore.themeKey"
    size="small"
    style="width: 140px"
    @change="onChange"
  >
    <el-option v-for="key in options" :key="key" :label="key" :value="key" />
  </el-select>
</template>
