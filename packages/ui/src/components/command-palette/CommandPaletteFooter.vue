<template>
  <footer class="ob-command-palette-footer">
    <span><kbd>↑</kbd>/<kbd>↓</kbd> 切换</span>
    <span><kbd>Enter</kbd> 跳转</span>
    <span><kbd>Esc</kbd> 关闭</span>
  </footer>
</template>

<style scoped>
.ob-command-palette-footer {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 2px 0;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

kbd {
  border-radius: 4px;
  border: 1px solid var(--el-border-color);
  background: var(--el-fill-color-light);
  padding: 1px 4px;
  font-size: 11px;
}
</style>
