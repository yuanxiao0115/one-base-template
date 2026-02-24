<template>
  <el-collapse-item title="链接样式" name="links">
    <el-form-item label="文字颜色">
      <div class="form-item-with-tip">
        <el-color-picker v-model="modelValue.linkColor" show-alpha />
        <div class="form-tip">选择链接文字的颜色，可调整透明度</div>
      </div>
    </el-form-item>

    <el-form-item label="字体大小">
      <div class="form-item-with-tip">
        <div class="input-with-unit">
          <el-input-number
            v-model="modelValue.linkFontSize"
            :min="12"
            :max="20"
            controls-position="right"
          >
            <template #suffix>
              <span class="suffix-unit">px</span>
            </template>
          </el-input-number>
        </div>
        <div class="form-tip">设置链接的字体大小，建议使用14-16px</div>
      </div>
    </el-form-item>

    <el-form-item label="字体粗细">
      <div class="form-item-with-tip">
        <el-select v-model="modelValue.linkFontWeight">
          <el-option label="常规" value="normal" />
          <el-option label="加粗" value="bold" />
          <el-option label="更粗" value="bolder" />
          <el-option label="较细" value="lighter" />
        </el-select>
        <div class="form-tip">控制链接文字的粗细程度</div>
      </div>
    </el-form-item>

    <el-form-item label="悬停颜色">
      <div class="form-item-with-tip">
        <el-color-picker v-model="modelValue.hoverColor" show-alpha />
        <div class="form-tip">设置鼠标悬停时的文字颜色</div>
      </div>
    </el-form-item>
  </el-collapse-item>
</template>

<script setup lang="ts">
// 类型定义
export interface LinkStyleModelType {
  linkColor: string;
  linkFontSize: number;
  linkFontWeight: string;
  hoverColor: string;
}

// 使用defineModel
const modelValue = defineModel<LinkStyleModelType>({
  default: () => ({
    linkColor: '#0f79e9',
    linkFontSize: 14,
    linkFontWeight: 'normal',
    hoverColor: '#d33a31'
  })
});

// 组件名称定义
defineOptions({
  name: 'pb-link-style-config'
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
