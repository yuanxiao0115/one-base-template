<script setup lang="ts">
import { computed, inject, useSlots } from 'vue'
import { DEFAULT_ONE_UI_GLOBAL_CONFIG, ONE_UI_GLOBAL_CONFIG_KEY } from '../../config'

export type CrudContainerMode = 'create' | 'edit' | 'detail'

export type CrudContainerType = 'dialog' | 'drawer'

export type CrudContainerDrawerColumns = 1 | 2

interface CrudContainerProps {
  modelValue: boolean
  mode?: CrudContainerMode
  container?: CrudContainerType
  title?: string
  loading?: boolean
  showFooter?: boolean
  showCancelButton?: boolean
  showConfirmButton?: boolean
  cancelText?: string
  confirmText?: string
  detailConfirmText?: string
  dialogWidth?: string | number
  drawerSize?: string | number
  drawerColumns?: CrudContainerDrawerColumns
  appendToBody?: boolean
  destroyOnClose?: boolean
  closeOnClickModal?: boolean
}

defineOptions({
  name: 'CrudContainer'
})

const props = withDefaults(defineProps<CrudContainerProps>(), {
  mode: 'create',
  container: undefined,
  title: '',
  loading: false,
  showFooter: true,
  showCancelButton: true,
  showConfirmButton: true,
  cancelText: '取消',
  confirmText: '确定',
  detailConfirmText: '我知道了',
  dialogWidth: 760,
  drawerSize: 400,
  drawerColumns: 1,
  appendToBody: true,
  destroyOnClose: true,
  closeOnClickModal: false
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'confirm'): void
  (event: 'cancel'): void
  (event: 'close'): void
}>()

const slots = useSlots()

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const isDetailMode = computed(() => props.mode === 'detail')

const globalConfig = inject(ONE_UI_GLOBAL_CONFIG_KEY, DEFAULT_ONE_UI_GLOBAL_CONFIG)

const resolvedContainer = computed(() => {
  if (props.container) {
    return props.container
  }
  return globalConfig.crudContainer?.defaultContainer || 'drawer'
})

const dialogMode = computed(() => resolvedContainer.value === 'dialog')

const resolvedDrawerColumns = computed<CrudContainerDrawerColumns>(() => {
  return props.drawerColumns === 2 ? 2 : 1
})

const modeClass = computed(() => `ob-crud-container--mode-${props.mode}`)

const dialogContainerClass = computed(() => [
  'ob-crud-container',
  'ob-crud-container--dialog',
  modeClass.value
])

const drawerBodyClass = computed(() => [
  'ob-crud-container__body',
  'ob-crud-container__body--drawer',
  `ob-crud-container__body--drawer-columns-${resolvedDrawerColumns.value}`
])

const drawerContainerClass = computed(() => [
  'ob-crud-container',
  'ob-crud-container--drawer',
  modeClass.value,
  `ob-crud-container--drawer-columns-${resolvedDrawerColumns.value}`
])

const confirmLabel = computed(() => {
  return isDetailMode.value ? props.detailConfirmText : props.confirmText
})

const hasFooterSlot = computed(() => Boolean(slots.footer))

const hasDetailSlot = computed(() => Boolean(slots.detail))

function closeContainer(): void {
  visible.value = false
}

function onCancel(): void {
  emit('cancel')
  closeContainer()
}

function onConfirm(): void {
  emit('confirm')
}

function onClose(): void {
  emit('close')
}
</script>

<template>
  <el-dialog
    v-if="dialogMode"
    v-model="visible"
    :title="title"
    :width="dialogWidth"
    :append-to-body="appendToBody"
    :destroy-on-close="destroyOnClose"
    :close-on-click-modal="closeOnClickModal"
    :class="dialogContainerClass"
    @close="onClose"
  >
    <div class="ob-crud-container__body">
      <slot v-if="isDetailMode && hasDetailSlot" name="detail" />
      <slot v-else />
    </div>

    <template v-if="showFooter" #footer>
      <slot v-if="hasFooterSlot" name="footer" :mode="mode" :loading="loading" :close="closeContainer" :confirm="onConfirm" />
      <div v-else class="ob-crud-container__footer">
        <el-button v-if="showCancelButton" @click="onCancel">{{ cancelText }}</el-button>
        <el-button
          v-if="showConfirmButton"
          type="primary"
          :loading="!isDetailMode && loading"
          @click="onConfirm"
        >
          {{ confirmLabel }}
        </el-button>
      </div>
    </template>
  </el-dialog>

  <el-drawer
    v-else
    v-model="visible"
    :title="title"
    :size="drawerSize"
    :append-to-body="appendToBody"
    :destroy-on-close="destroyOnClose"
    :close-on-click-modal="closeOnClickModal"
    :class="drawerContainerClass"
    @close="onClose"
  >
    <div :class="drawerBodyClass">
      <slot v-if="isDetailMode && hasDetailSlot" name="detail" />
      <slot v-else />
    </div>

    <template v-if="showFooter" #footer>
      <slot v-if="hasFooterSlot" name="footer" :mode="mode" :loading="loading" :close="closeContainer" :confirm="onConfirm" />
      <div v-else class="ob-crud-container__footer">
        <el-button v-if="showCancelButton" @click="onCancel">{{ cancelText }}</el-button>
        <el-button
          v-if="showConfirmButton"
          type="primary"
          :loading="!isDetailMode && loading"
          @click="onConfirm"
        >
          {{ confirmLabel }}
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<style>
.ob-crud-container__body {
  min-height: 0;
}

.ob-crud-container__body--drawer {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  min-height: 0;
  padding: 0;
}

.ob-crud-container__body--drawer .el-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  row-gap: 16px;
  column-gap: 16px;
  align-content: flex-start;
  width: 100%;
}

.ob-crud-container__body--drawer-columns-2 .el-form {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.ob-crud-container__body--drawer .el-form > .el-form-item,
.ob-crud-container__body--drawer .el-form > .el-row {
  margin-bottom: 0;
}

.ob-crud-container__body--drawer .el-form > .el-row,
.ob-crud-container__body--drawer .el-form > .ob-crud-container__item--full {
  grid-column: 1 / -1;
}

.ob-crud-container__body--drawer .el-form-item {
  display: flex;
  flex-direction: column;
}

.ob-crud-container__body--drawer .el-form-item__label {
  display: flex;
  width: 100%;
  height: auto;
  justify-content: flex-start;
  padding: 0 0 8px;
  font-size: 14px;
  line-height: 22px;
  text-align: left;
}

.ob-crud-container__body--drawer .el-form-item__content {
  margin-left: 0 !important;
  width: 100%;
}

.ob-crud-container__body--drawer .el-form-item__content > .el-input,
.ob-crud-container__body--drawer .el-form-item__content > .el-select,
.ob-crud-container__body--drawer .el-form-item__content > .el-input-number,
.ob-crud-container__body--drawer .el-form-item__content > .el-textarea {
  width: 100%;
}

.ob-crud-container__footer {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.ob-crud-container--mode-detail .el-form-item.is-required .el-form-item__label::before,
.ob-crud-container--mode-detail .el-form-item.is-required .el-form-item__label::after {
  display: none !important;
  content: none !important;
}
</style>
