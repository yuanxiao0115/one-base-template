<script setup lang="ts">
import { ElButton } from 'element-plus'
import 'element-plus/dist/index.css'

const typeOptions = [
  { label: 'default', value: '' },
  { label: 'primary', value: 'primary' },
  { label: 'success', value: 'success' },
  { label: 'warning', value: 'warning' },
  { label: 'info', value: 'info' },
  { label: 'danger', value: 'danger' }
] as const

type ButtonTypeValue = (typeof typeOptions)[number]['value']

type ButtonSizeValue = 'large' | 'default' | 'small'

const sizeOptions: Array<{ label: string; value: ButtonSizeValue }> = [
  { label: '40', value: 'large' },
  { label: '32', value: 'default' },
  { label: '24', value: 'small' }
]

function normalizeType(value: ButtonTypeValue): '' | 'primary' | 'success' | 'warning' | 'info' | 'danger' {
  return value
}

function normalizeSize(value: ButtonSizeValue) {
  if (value === 'default') return undefined
  return value
}
</script>

<template>
  <div class="button-doc-demo">
    <section class="button-doc-demo__section">
      <h4 class="button-doc-demo__title">尺寸预览（40 / 32 / 24）</h4>
      <div class="button-doc-demo__row">
        <el-button v-for="item in sizeOptions" :key="item.value" :size="normalizeSize(item.value)" type="primary">
          {{ item.label }} 按钮
        </el-button>
      </div>
    </section>

    <section class="button-doc-demo__section">
      <h4 class="button-doc-demo__title">样式预览</h4>
      <div class="button-doc-demo__row">
        <el-button type="primary">
          <span class="button-doc-demo__icon">☆</span>
          主按钮
        </el-button>
        <el-button plain>次按钮</el-button>
        <el-button plain class="ob-button--dashed">虚线按钮</el-button>
        <el-button text type="primary">文字按钮</el-button>
        <el-button link type="primary">Link 按钮</el-button>
        <el-button link type="primary" class="ob-link-underline">网址按钮</el-button>
      </div>
    </section>

    <section class="button-doc-demo__section">
      <h4 class="button-doc-demo__title">状态预览（default / loading / disabled）</h4>
      <div class="button-doc-demo__row">
        <el-button type="primary">默认</el-button>
        <el-button type="primary" loading>加载中</el-button>
        <el-button type="primary" disabled>禁用</el-button>
      </div>
    </section>

    <section class="button-doc-demo__section">
      <h4 class="button-doc-demo__title">禁用态一致性（实体按钮）</h4>
      <div class="button-doc-demo__row button-doc-demo__row--grid">
        <el-button
          v-for="item in typeOptions"
          :key="item.label"
          :type="normalizeType(item.value)"
          disabled
        >
          {{ item.label }}
        </el-button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.button-doc-demo {
  --ob-button-size-large: 40px;
  --ob-button-size-default: 32px;
  --ob-button-size-small: 24px;
  --ob-button-icon-gap-large: 8px;
  --ob-button-icon-gap-default: 6px;
  --ob-button-icon-gap-small: 4px;
  --doc-button-disabled-text-color: var(--one-button-disabled-text-color, var(--el-text-color-disabled));
  --doc-button-disabled-bg-color: var(--one-button-disabled-bg-color, var(--el-fill-color-light));
  --doc-button-disabled-border-color: var(--one-button-disabled-border-color, var(--el-border-color-light));
  --doc-link-color: var(--one-color-link, var(--el-color-primary));
  --doc-link-color-hover: var(--one-color-link-light-5, var(--el-color-primary-light-5));
  --doc-link-color-active: var(--one-color-link-light-7, var(--el-color-primary-dark-2));

  padding: 16px;
  margin: 16px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

.button-doc-demo__section + .button-doc-demo__section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed var(--vp-c-divider);
}

.button-doc-demo__title {
  margin: 0 0 12px;
  color: var(--vp-c-text-1);
  font-size: 14px;
  line-height: 1.4;
}

.button-doc-demo__row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.button-doc-demo__row--grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
}

.button-doc-demo__icon {
  margin-right: var(--ob-button-icon-gap-default);
}

.button-doc-demo :deep(.el-button),
.button-doc-demo :deep(.el-button--primary),
.button-doc-demo :deep(.el-button--success),
.button-doc-demo :deep(.el-button--warning),
.button-doc-demo :deep(.el-button--info),
.button-doc-demo :deep(.el-button--danger) {
  --el-button-disabled-text-color: var(--doc-button-disabled-text-color);
  --el-button-disabled-bg-color: var(--doc-button-disabled-bg-color);
  --el-button-disabled-border-color: var(--doc-button-disabled-border-color);
}

.button-doc-demo :deep(.el-button) {
  height: var(--ob-button-size-default);
  padding: 8px 15px;
}

.button-doc-demo :deep(.el-button--large) {
  height: var(--ob-button-size-large);
  padding: 12px 19px;
}

.button-doc-demo :deep(.el-button--small) {
  height: var(--ob-button-size-small);
  padding: 5px 11px;
}

.button-doc-demo :deep(.el-button.is-disabled),
.button-doc-demo :deep(.el-button.is-disabled:hover),
.button-doc-demo :deep(.el-button.is-disabled:focus),
.button-doc-demo :deep(.el-button.is-disabled:active) {
  color: var(--el-button-disabled-text-color);
  background-color: var(--el-button-disabled-bg-color);
  border-color: var(--el-button-disabled-border-color);
}

.button-doc-demo :deep(.el-button.is-text.is-disabled),
.button-doc-demo :deep(.el-button.is-link.is-disabled) {
  background-color: transparent !important;
  border-color: transparent !important;
}

.button-doc-demo :deep(.el-button.ob-button--dashed) {
  border-style: dashed;
}

.button-doc-demo :deep(.el-button.ob-link-underline) {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.button-doc-demo :deep(.el-button.is-link) {
  --el-button-text-color: var(--doc-link-color);
}

.button-doc-demo :deep(.el-button.is-link:not(.el-button--danger)) {
  --el-button-hover-link-text-color: var(--doc-link-color-hover);
  --el-button-active-color: var(--doc-link-color-active);
}

@media (max-width: 768px) {
  .button-doc-demo__row {
    flex-direction: column;
  }

  .button-doc-demo__row--grid {
    grid-template-columns: 1fr;
  }
}
</style>
