<template>
  <el-divider content-position="left">蓝色简约条纹</el-divider>

  <el-form-item label="条纹颜色">
    <div class="form-item-with-tip">
      <el-color-picker v-model="modelValue.stripeAccentColor" show-alpha />
      <div class="form-tip">有色条纹颜色</div>
    </div>
  </el-form-item>

  <el-form-item label="有色条纹数量">
    <div class="form-item-with-tip">
      <div class="input-with-unit">
        <el-input-number
          v-model="modelValue.stripeAccentCount"
          :min="1"
          :max="50"
          controls-position="right"
        >
          <template #suffix>
            <span class="suffix-unit">个</span>
          </template>
        </el-input-number>
      </div>
      <div class="form-tip">有色条纹的数量（均匀分布）</div>
    </div>
  </el-form-item>

  <el-form-item label="条纹高度">
    <div class="form-item-with-tip">
      <div class="input-with-unit">
        <el-input-number
          v-model="modelValue.stripeHeight"
          :min="2"
          :max="20"
          controls-position="right"
        >
          <template #suffix>
            <span class="suffix-unit">px</span>
          </template>
        </el-input-number>
      </div>
      <div class="form-tip">条纹高度（默认 8）</div>
    </div>
  </el-form-item>

  <el-form-item label="条纹宽度">
    <div class="form-item-with-tip">
      <div class="input-with-unit">
        <el-input-number
          v-model="modelValue.stripeWidth"
          :min="1"
          :max="40"
          controls-position="right"
        >
          <template #suffix>
            <span class="suffix-unit">px</span>
          </template>
        </el-input-number>
      </div>
      <div class="form-tip">单个斜四边形底边宽度（默认 3）</div>
    </div>
  </el-form-item>

  <el-form-item label="底色">
    <div class="form-item-with-tip">
      <el-color-picker v-model="modelValue.stripeBaseColor" show-alpha />
      <div class="form-tip">灰色条纹颜色</div>
    </div>
  </el-form-item>
</template>

<script setup lang="ts">
export interface TitleStripeConfigModelType {
  stripeAccentColor: string;
  stripeAccentCount: number;
  stripeHeight: number;
  stripeWidth: number;
  stripeBaseColor: string;
}

const modelValue = defineModel<TitleStripeConfigModelType>({
  default: () => ({
    stripeAccentColor: '#0f79e9',
    stripeAccentCount: 12,
    stripeHeight: 8,
    stripeWidth: 3,
    stripeBaseColor: '#e5e7eb'
  })
});

defineOptions({ name: 'pb-title-stripe-config' });
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

.suffix-unit {
  margin-right: 8px;
  font-size: 14px;
  color: var(--config-muted, #909399);
}
</style>
