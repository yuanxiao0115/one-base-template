<script setup lang="ts">
import { computed, ref } from 'vue'
import { Link, Star } from '@element-plus/icons-vue'
import { PageContainer } from '@one-base-template/ui'

defineOptions({
  name: 'DemoButtonStylePage'
})

type ButtonSizeMode = 'large' | 'default' | 'small'
type ButtonType = 'primary' | 'success' | 'warning' | 'info' | 'danger'
type StateKey = 'default' | 'hover' | 'active' | 'disabled' | 'loading'

type VariantKey = 'solid' | 'plain' | 'dashed' | 'text' | 'link'

type VariantConfig = {
  key: VariantKey
  title: string
  withIconTitle: string
  plain?: boolean
  text?: boolean
  link?: boolean
  className?: string
  defaultType?: ButtonType
}

const currentSize = ref<ButtonSizeMode>('default')

const sizeOptions: Array<{ label: string; value: ButtonSizeMode }> = [
  { label: '40', value: 'large' },
  { label: '32', value: 'default' },
  { label: '24', value: 'small' }
]

const stateOptions: Array<{ key: StateKey; label: string }> = [
  { key: 'default', label: '默认' },
  { key: 'hover', label: '悬浮（样式模拟）' },
  { key: 'active', label: '点击（样式模拟）' },
  { key: 'disabled', label: '禁用' },
  { key: 'loading', label: '加载' }
]

const typeOptions: Array<{ label: string; type?: ButtonType }> = [
  { label: 'default' },
  { label: 'primary', type: 'primary' },
  { label: 'success', type: 'success' },
  { label: 'warning', type: 'warning' },
  { label: 'info', type: 'info' },
  { label: 'danger', type: 'danger' }
]

const variants: VariantConfig[] = [
  {
    key: 'solid',
    title: '主按钮',
    withIconTitle: '主按钮-带图标',
    defaultType: 'primary'
  },
  {
    key: 'plain',
    title: '次按钮',
    withIconTitle: '次按钮-带图标',
    plain: true
  },
  {
    key: 'dashed',
    title: '虚线按钮',
    withIconTitle: '虚线按钮-带图标',
    plain: true,
    className: 'ob-button--dashed'
  },
  {
    key: 'text',
    title: '文字按钮',
    withIconTitle: '文字按钮-带图标',
    text: true,
    defaultType: 'primary'
  },
  {
    key: 'link',
    title: '图标按钮',
    withIconTitle: '图标按钮-带图标',
    link: true,
    defaultType: 'primary'
  }
]

const displaySize = computed(() => {
  if (currentSize.value === 'default') return undefined
  return currentSize.value
})

function getStateClass(state: StateKey) {
  if (state === 'hover') return 'ob-button-demo__state-hover'
  if (state === 'active') return 'ob-button-demo__state-active'
  return ''
}

function isDisabledState(state: StateKey) {
  return state === 'disabled'
}

function isLoadingState(state: StateKey) {
  return state === 'loading'
}

function getShowTypeLabel(type?: ButtonType) {
  return type ?? 'default'
}
</script>

<template>
  <PageContainer overflow="auto">
    <div class="ob-button-demo">
      <el-card shadow="never" class="ob-button-demo__card">
        <template #header>
          <div class="ob-button-demo__header">
            <div>
              <h2 class="ob-button-demo__title">Element 按钮样式 Demo</h2>
              <p class="ob-button-demo__desc">
                覆盖目标：三档尺寸（40/32/24）、跨 type 禁用统一（按变体）、颜色全部走主题变量。
              </p>
            </div>
            <el-radio-group v-model="currentSize" size="small">
              <el-radio-button v-for="item in sizeOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </el-radio-button>
            </el-radio-group>
          </div>
        </template>

        <section class="ob-button-demo__section">
          <h3 class="ob-button-demo__section-title">尺寸预览（不区分 type）</h3>
          <div class="ob-button-demo__size-preview">
            <el-button size="large" type="primary" :icon="Star">40 按钮</el-button>
            <el-button type="primary" :icon="Star">32 按钮</el-button>
            <el-button size="small" type="primary" :icon="Star">24 按钮</el-button>
          </div>
        </section>

        <section v-for="variant in variants" :key="variant.key" class="ob-button-demo__section">
          <h3 class="ob-button-demo__section-title">{{ variant.withIconTitle }}</h3>
          <div class="ob-button-demo__state-grid">
            <div v-for="state in stateOptions" :key="`${variant.key}-icon-${state.key}`" class="ob-button-demo__state-item">
              <span class="ob-button-demo__state-label">{{ state.label }}</span>
              <el-button
                :size="displaySize"
                :type="variant.defaultType"
                :plain="variant.plain"
                :text="variant.text"
                :link="variant.link"
                :icon="state.key === 'loading' ? undefined : Star"
                :disabled="isDisabledState(state.key)"
                :loading="isLoadingState(state.key)"
                :class="[variant.className, getStateClass(state.key)]"
              >
                示例按钮
              </el-button>
            </div>
          </div>

          <h3 class="ob-button-demo__section-title">{{ variant.title }}</h3>
          <div class="ob-button-demo__state-grid">
            <div v-for="state in stateOptions" :key="`${variant.key}-text-${state.key}`" class="ob-button-demo__state-item">
              <span class="ob-button-demo__state-label">{{ state.label }}</span>
              <el-button
                :size="displaySize"
                :type="variant.defaultType"
                :plain="variant.plain"
                :text="variant.text"
                :link="variant.link"
                :disabled="isDisabledState(state.key)"
                :loading="isLoadingState(state.key)"
                :class="[variant.className, getStateClass(state.key)]"
              >
                示例按钮
              </el-button>
            </div>
          </div>
        </section>

        <section class="ob-button-demo__section">
          <h3 class="ob-button-demo__section-title">网址按钮（仅语义类启用下划线）</h3>
          <div class="ob-button-demo__state-grid ob-button-demo__state-grid--two">
            <div class="ob-button-demo__state-item">
              <span class="ob-button-demo__state-label">普通 link</span>
              <el-button :size="displaySize" link type="primary" :icon="Link">默认网址</el-button>
            </div>
            <div class="ob-button-demo__state-item">
              <span class="ob-button-demo__state-label">ob-link-underline</span>
              <el-button :size="displaySize" link type="primary" :icon="Link" class="ob-link-underline">
                默认网址
              </el-button>
            </div>
          </div>
        </section>

        <section class="ob-button-demo__section">
          <h3 class="ob-button-demo__section-title">禁用一致性校验（同一变体跨 type）</h3>
          <div class="ob-button-demo__disabled-rows">
            <div class="ob-button-demo__disabled-row">
              <span class="ob-button-demo__state-label">实体按钮</span>
              <div class="ob-button-demo__type-grid">
                <el-button
                  v-for="item in typeOptions"
                  :key="`solid-${item.label}`"
                  :size="displaySize"
                  :type="item.type"
                  disabled
                >
                  {{ getShowTypeLabel(item.type) }}
                </el-button>
              </div>
            </div>

            <div class="ob-button-demo__disabled-row">
              <span class="ob-button-demo__state-label">描边按钮</span>
              <div class="ob-button-demo__type-grid">
                <el-button
                  v-for="item in typeOptions"
                  :key="`plain-${item.label}`"
                  :size="displaySize"
                  :type="item.type"
                  plain
                  disabled
                >
                  {{ getShowTypeLabel(item.type) }}
                </el-button>
              </div>
            </div>

            <div class="ob-button-demo__disabled-row">
              <span class="ob-button-demo__state-label">虚线按钮</span>
              <div class="ob-button-demo__type-grid">
                <el-button
                  v-for="item in typeOptions"
                  :key="`dashed-${item.label}`"
                  :size="displaySize"
                  :type="item.type"
                  plain
                  disabled
                  class="ob-button--dashed"
                >
                  {{ getShowTypeLabel(item.type) }}
                </el-button>
              </div>
            </div>

            <div class="ob-button-demo__disabled-row">
              <span class="ob-button-demo__state-label">文字按钮</span>
              <div class="ob-button-demo__type-grid">
                <el-button
                  v-for="item in typeOptions"
                  :key="`text-${item.label}`"
                  :size="displaySize"
                  :type="item.type"
                  text
                  disabled
                >
                  {{ getShowTypeLabel(item.type) }}
                </el-button>
              </div>
            </div>

            <div class="ob-button-demo__disabled-row">
              <span class="ob-button-demo__state-label">link 按钮</span>
              <div class="ob-button-demo__type-grid">
                <el-button
                  v-for="item in typeOptions"
                  :key="`link-${item.label}`"
                  :size="displaySize"
                  :type="item.type"
                  link
                  disabled
                >
                  {{ getShowTypeLabel(item.type) }}
                </el-button>
              </div>
            </div>
          </div>
        </section>
      </el-card>
    </div>
  </PageContainer>
</template>

<style scoped>
.ob-button-demo {
  min-height: 100%;
  padding: 16px;
}

.ob-button-demo__card {
  border-radius: 8px;
}

.ob-button-demo__header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.ob-button-demo__title {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 18px;
  font-weight: 600;
  line-height: 26px;
}

.ob-button-demo__desc {
  margin: 6px 0 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 20px;
}

.ob-button-demo__section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.ob-button-demo__section-title {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
}

.ob-button-demo__size-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.ob-button-demo__state-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.ob-button-demo__state-grid--two {
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

.ob-button-demo__state-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  background: var(--el-bg-color-overlay);
}

.ob-button-demo__state-label {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 18px;
}

.ob-button-demo__disabled-rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ob-button-demo__disabled-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  background: var(--el-bg-color-overlay);
}

.ob-button-demo__type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(126px, 1fr));
  gap: 10px;
}

.ob-button-demo__state-hover {
  color: var(--el-button-hover-text-color) !important;
  background-color: var(--el-button-hover-bg-color) !important;
  border-color: var(--el-button-hover-border-color) !important;
}

.ob-button-demo__state-active {
  color: var(--el-button-active-text-color) !important;
  background-color: var(--el-button-active-bg-color) !important;
  border-color: var(--el-button-active-border-color) !important;
}

.ob-button-demo__state-hover.el-button.is-text,
.ob-button-demo__state-hover.el-button.is-link {
  color: var(--el-button-hover-link-text-color, var(--el-button-hover-text-color)) !important;
  border-color: transparent !important;
  background-color: transparent !important;
}

.ob-button-demo__state-hover.el-button.is-text {
  background-color: var(--el-fill-color-light) !important;
}

.ob-button-demo__state-active.el-button.is-text,
.ob-button-demo__state-active.el-button.is-link {
  color: var(--el-button-active-color, var(--el-button-active-text-color)) !important;
  border-color: transparent !important;
  background-color: transparent !important;
}

.ob-button-demo__state-active.el-button.is-text {
  background-color: var(--el-fill-color) !important;
}

@media (max-width: 768px) {
  .ob-button-demo {
    padding: 12px;
  }

  .ob-button-demo__state-grid,
  .ob-button-demo__state-grid--two,
  .ob-button-demo__type-grid {
    grid-template-columns: 1fr;
  }
}
</style>
