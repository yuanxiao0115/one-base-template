<template>
  <div class="list-display-config">
    <el-divider content-position="left">列表显示</el-divider>

    <el-form-item label="最大显示条数">
      <el-input-number
        v-model="modelValue.maxDisplayCount"
        :min="1"
        :max="20"
        controls-position="right"
      />
    </el-form-item>

    <el-form-item label="显示圆点">
      <el-switch v-model="modelValue.showDot" />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import type { ListDisplayConfigModelType } from './types';

const modelValue = defineModel<ListDisplayConfigModelType>({
  default: () => ({
    maxDisplayCount: 10,
    showDot: true
  })
});

defineOptions({
  name: 'pb-list-display-config'
});
</script>

<style scoped>
.list-display-config {
  --config-text: #0f172a;
  --config-muted: #64748b;

  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-display-config :deep(.el-divider__text) {
  font-weight: 600;
  color: var(--config-text);
  letter-spacing: 0.2px;
}

.list-display-config :deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--config-muted);
}
</style>
