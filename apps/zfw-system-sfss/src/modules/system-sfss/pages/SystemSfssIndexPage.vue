<script setup lang="ts">
defineOptions({
  name: 'SystemSfssIndex'
});

const subModules = [
  'sunshine-petition（阳光信访）',
  'petition-supervision（信访督查）',
  'petition-processing（信访件处理）',
  'special-petition-management（特殊信访件管理）',
  'petition-query（信访件查询）',
  'litigation-related（涉法涉诉）'
] as const;
</script>

<template>
  <section class="system-sfss-index-page">
    <h1>System-sfss 模块</h1>
    <p>
      已按 legacy 目录 <code>views/System-sfss</code> 重建 6 个子模块，路由路径与老系统 URL 对齐。
    </p>
    <ul>
      <li v-for="item in subModules" :key="item">{{ item }}</li>
    </ul>
    <p>
      legacy 来源：
      <code>/Users/haoqiuzhi/code/monorepo-web/apps/zfw-system-sfss/src/views/System-sfss</code>
    </p>
  </section>
</template>

<style scoped>
.system-sfss-index-page {
  box-sizing: border-box;
  padding: 24px;
  margin: 16px;
  line-height: 1.8;
  color: var(--el-text-color-primary);
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
}

.system-sfss-index-page h1 {
  margin: 0 0 12px;
  font-size: 22px;
}

.system-sfss-index-page ul {
  padding-left: 20px;
  margin: 10px 0;
}

.system-sfss-index-page code {
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
