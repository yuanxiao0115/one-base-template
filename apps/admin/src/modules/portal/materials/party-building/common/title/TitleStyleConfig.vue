<template>
  <el-collapse-item title="标题样式" name="title">
    <el-form-item label="文字颜色">
      <div class="form-item-with-tip">
        <el-color-picker v-model="titleStyleData.titleColor" show-alpha />
        <div class="form-tip">选择标题文字的颜色，可调整透明度</div>
      </div>
    </el-form-item>

    <el-form-item label="字体大小">
      <div class="form-item-with-tip">
        <div class="input-with-unit">
          <el-input-number
            v-model="titleStyleData.titleFontSize"
            :min="12"
            :max="36"
            controls-position="right"
          >
            <template #suffix>
              <span class="suffix-unit">px</span>
            </template>
          </el-input-number>
        </div>
        <div class="form-tip">数值越大，字体越大，建议使用18-24之间的值</div>
      </div>
    </el-form-item>

    <el-form-item label="字体粗细">
      <div class="form-item-with-tip">
        <el-select v-model="titleStyleData.titleFontWeight">
          <el-option label="常规" value="normal" />
          <el-option label="加粗" value="bold" />
          <el-option label="更粗" value="bolder" />
          <el-option label="较细" value="lighter" />
        </el-select>
        <div class="form-tip">
          控制文字的粗细程度，通常选择"加粗"使标题更突出
        </div>
      </div>
    </el-form-item>

    <el-form-item label="下划线颜色">
      <div class="form-item-with-tip">
        <el-color-picker v-model="titleStyleData.borderColor" show-alpha />
        <div class="form-tip">设置标题下方横线的颜色，可调整透明度</div>
      </div>
    </el-form-item>

    <TitleStripeConfig v-model="titleStyleData" />

    <el-divider content-position="left">更多按钮样式</el-divider>

    <el-form-item label="文字颜色">
      <div class="form-item-with-tip">
        <el-color-picker v-model="titleStyleData.linkColor" show-alpha />
        <div class="form-tip">设置"更多"链接的文字颜色</div>
      </div>
    </el-form-item>

    <el-form-item label="字体大小">
      <div class="form-item-with-tip">
        <div class="input-with-unit">
          <el-input-number
            v-model="titleStyleData.linkFontSize"
            :min="12"
            :max="24"
            controls-position="right"
          >
            <template #suffix>
              <span class="suffix-unit">px</span>
            </template>
          </el-input-number>
        </div>
        <div class="form-tip">控制"更多"链接的字体大小，建议比标题小</div>
      </div>
    </el-form-item>
  </el-collapse-item>
</template>

<script setup lang="ts">
import TitleStripeConfig from './TitleStripeConfig.vue';

// 定义接口类型
export interface TitleStyleModelType {
  titleColor: string;
  titleFontSize: number;
  titleFontWeight: string;
  titleAlign: string;
  titleBgColor: string;
  lineThickness: number;
  borderColor: string;
  stripeAccentColor: string;
  stripeAccentWidth: number;
  stripeAccentCount: number;
  stripeHeight: number;
  stripeWidth: number;
  stripeBaseColor: string;
  linkColor: string;
  linkFontSize: number;
  titlePaddingTop: number;
  titlePaddingRight: number;
  titlePaddingBottom: number;
  titlePaddingLeft: number;
}

// 使用defineModel来支持v-model，不设置默认值
const titleStyleData = defineModel<TitleStyleModelType>({
  default: () => ({
    titleColor: '#0f172a',
    titleFontSize: 20,
    titleFontWeight: 'bold',
    titleAlign: 'left',
    titleBgColor: 'transparent',
    lineThickness: 2,
    borderColor: '#be0108',
    stripeAccentColor: '#0f79e9',
    stripeAccentWidth: 3,
    stripeAccentCount: 12,
    stripeHeight: 8,
    stripeWidth: 3,
    stripeBaseColor: '#e5e7eb',
    linkColor: '#0f79e9',
    linkFontSize: 14,
    titlePaddingTop: 0,
    titlePaddingRight: 0,
    titlePaddingBottom: 0,
    titlePaddingLeft: 0
  })
});

defineOptions({
  name: 'pb-title-style-config'
});
</script>

<style scoped>
:deep(.el-divider__text) {
  font-weight: 600;
  color: var(--config-text, #0f172a);
  letter-spacing: 0.2px;
}

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

.unit-label {
  margin-left: 8px;
  font-size: 14px;
  white-space: nowrap;
  color: var(--config-muted, #606266);
}

.unit-label.mini {
  margin-left: 4px;
  min-width: 20px;
  font-size: 12px;
}

.suffix-unit {
  margin-right: 8px;
  font-size: 14px;
  color: var(--config-muted, #909399);
}

.suffix-unit-mini {
  margin-right: 8px;
  min-width: 14px;
  font-size: 12px;
  text-align: center;
  color: var(--config-muted, #909399);
}

.padding-input {
  width: 110px;
}

.padding-inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
