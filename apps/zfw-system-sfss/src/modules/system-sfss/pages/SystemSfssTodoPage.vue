<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    routePath?: string;
    legacyFile?: string;
  }>(),
  {
    routePath: '',
    legacyFile: ''
  }
);
</script>

<template>
  <section class="system-sfss-todo-page">
    <h2>{{ title }}</h2>
    <p>当前页面属于迁移落地阶段，已完成目录与路由接入，可继续逐页替换业务实现。</p>
    <p v-if="routePath">
      路由：<code>{{ routePath }}</code>
    </p>
    <p v-if="legacyFile">
      legacy 文件：<code>{{ legacyFile }}</code>
    </p>
  </section>
</template>

<style scoped>
.system-sfss-todo-page {
  box-sizing: border-box;
  max-width: 960px;
  padding: 20px;
  margin: 16px;
  line-height: 1.7;
  color: var(--el-text-color-primary);
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
}

.system-sfss-todo-page h2 {
  margin: 0 0 12px;
  font-size: 18px;
}

.system-sfss-todo-page p {
  margin: 8px 0;
  color: var(--el-text-color-regular);
}

.system-sfss-todo-page code {
  padding: 2px 8px;
  font-family:
    'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  font-size: 12px;
  color: #0f5cc0;
  background: #edf4ff;
  border-radius: 6px;
}
</style>
