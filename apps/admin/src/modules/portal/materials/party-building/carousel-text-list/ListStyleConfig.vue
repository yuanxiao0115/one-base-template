<template>
  <el-collapse-item title="列表样式" name="list">
    <el-form-item label="标题文字颜色">
      <div class="form-item-with-tip">
        <el-color-picker v-model="modelValue.titleColor" show-alpha />
        <div class="form-tip">设置标题文字的颜色</div>
      </div>
    </el-form-item>

    <el-form-item label="标题字体大小">
      <div class="form-item-with-tip">
        <div class="input-with-unit">
          <el-input-number
            v-model="modelValue.titleFontSize"
            :min="12"
            :max="24"
            controls-position="right"
          >
            <template #suffix>
              <span class="suffix-unit">px</span>
            </template>
          </el-input-number>
        </div>
        <div class="form-tip">设置标题字体大小</div>
      </div>
    </el-form-item>

    <el-form-item label="发布时间颜色">
      <div class="form-item-with-tip">
        <el-color-picker v-model="modelValue.timeColor" show-alpha />
        <div class="form-tip">设置发布时间的颜色</div>
      </div>
    </el-form-item>

    <el-form-item label="发布时间字体大小">
      <div class="form-item-with-tip">
        <div class="input-with-unit">
          <el-input-number
            v-model="modelValue.timeFontSize"
            :min="10"
            :max="20"
            controls-position="right"
          >
            <template #suffix>
              <span class="suffix-unit">px</span>
            </template>
          </el-input-number>
        </div>
        <div class="form-tip">设置发布时间的字体大小</div>
      </div>
    </el-form-item>
  </el-collapse-item>
</template>

<script setup lang="ts">
// 类型定义
export interface ListStyleModelType {
  titleColor: string;
  titleFontSize: number;
  timeColor: string;
  timeFontSize: number;
}

// 使用defineModel
const modelValue = defineModel<ListStyleModelType>({
  default: () => ({
    titleColor: '#303133',
    titleFontSize: 14,
    timeColor: '#909399',
    timeFontSize: 12
  })
});

// 组件名称定义
defineOptions({
  name: 'pb-list-style-config'
});
</script>

<style scoped>
:deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--config-muted, #64748b);
}

.form-item-with-tip {
  display: flex;
  flex-direction: column;
}

.form-tip {
  margin-top: 5px;
  font-size: 12px;
  color: var(--config-muted, #909399);
  line-height: 1.4;
}

.input-with-unit {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.suffix-unit {
  margin-right: 8px;
  font-size: 14px;
  color: var(--config-muted, #909399);
}
</style>
