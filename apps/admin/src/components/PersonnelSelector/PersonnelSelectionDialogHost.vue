<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { message } from '@/utils/message'
import PersonnelSelector from './PersonnelSelector.vue'
import type {
  OpenPersonnelSelectionResult,
  PersonnelFetchNodes,
  PersonnelSearchNodes,
  PersonnelSelectMode,
  PersonnelSelectedItem,
  PersonnelSelectedOrg,
  PersonnelSelectedPosition,
  PersonnelSelectedRole,
  PersonnelSelectedUser,
  PersonnelSelectionField,
  PersonnelSelectionModel
} from './types'

type PersonnelSelectorExpose = {
  loadRootNodes?: () => Promise<void>
  setSelectedItems?: (items: PersonnelSelectedItem[]) => void
  getSelectedItems?: () => PersonnelSelectedItem[]
}

const props = withDefaults(defineProps<{
  visible?: boolean
  title: string
  width?: string | number
  mode?: PersonnelSelectMode
  selectionField?: PersonnelSelectionField
  allowSelectOrg?: boolean
  disabled?: boolean
  required?: boolean
  confirmText?: string
  cancelText?: string
  closeOnClickModal?: boolean
  initialModel?: PersonnelSelectionModel
  initialSelectedItems?: PersonnelSelectedItem[]
  fetchNodes: PersonnelFetchNodes
  searchNodes: PersonnelSearchNodes
}>(), {
  visible: true,
  mode: 'person',
  selectionField: 'userIds',
  allowSelectOrg: false,
  disabled: false,
  required: true,
  confirmText: '确定',
  cancelText: '取消',
  closeOnClickModal: false,
  width: 1120,
  initialModel: () => ({
    userIds: [],
    orgIds: [],
    roleIds: [],
    positionIds: []
  }),
  initialSelectedItems: () => []
})

const emit = defineEmits<{
  (event: 'confirm', payload: OpenPersonnelSelectionResult): void
  (event: 'cancel'): void
  (event: 'closed'): void
}>()

const selectorRef = ref<PersonnelSelectorExpose>()
const submitting = ref(false)
const closeReason = ref<'none' | 'cancel' | 'confirm'>('none')
const dialogVisible = ref(props.visible)

const localModel = reactive<Required<PersonnelSelectionModel>>({
  userIds: [],
  orgIds: [],
  roleIds: [],
  positionIds: []
})

const activeSelectionField = computed<PersonnelSelectionField>(() => {
  if (props.selectionField) return props.selectionField
  if (props.mode === 'org') return 'orgIds'
  if (props.mode === 'role') return 'roleIds'
  if (props.mode === 'position') return 'positionIds'
  return 'userIds'
})

const requiredLabel = computed(() => {
  if (activeSelectionField.value === 'orgIds') return '组织'
  if (activeSelectionField.value === 'roleIds') return '角色'
  if (activeSelectionField.value === 'positionIds') return '岗位'
  return '人员'
})

function syncModelFromProps() {
  localModel.userIds = Array.from(new Set(props.initialModel.userIds || []))
  localModel.orgIds = Array.from(new Set(props.initialModel.orgIds || []))
  localModel.roleIds = Array.from(new Set(props.initialModel.roleIds || []))
  localModel.positionIds = Array.from(new Set(props.initialModel.positionIds || []))
}

function getSelectedItems(): PersonnelSelectedItem[] {
  return selectorRef.value?.getSelectedItems?.() || []
}

function buildResult(): OpenPersonnelSelectionResult {
  const selectedItems = getSelectedItems()
  const users = selectedItems.filter((item): item is PersonnelSelectedUser => item.nodeType === 'user')
  const orgs = selectedItems.filter((item): item is PersonnelSelectedOrg => item.nodeType === 'org')
  const roles = selectedItems.filter((item): item is PersonnelSelectedRole => item.nodeType === 'role')
  const positions = selectedItems.filter((item): item is PersonnelSelectedPosition => item.nodeType === 'position')

  const normalizedModel: Required<PersonnelSelectionModel> = {
    userIds: [...localModel.userIds],
    orgIds: [...localModel.orgIds],
    roleIds: [...localModel.roleIds],
    positionIds: [...localModel.positionIds]
  }

  const ids = [...(normalizedModel[activeSelectionField.value] || [])]

  return {
    mode: props.mode,
    selectionField: activeSelectionField.value,
    ids,
    model: normalizedModel,
    selectedItems,
    users,
    orgs,
    roles,
    positions
  }
}

async function initDialogData() {
  syncModelFromProps()
  await nextTick()
  selectorRef.value?.setSelectedItems?.(props.initialSelectedItems)
  await selectorRef.value?.loadRootNodes?.()
}

function onCancel() {
  closeReason.value = 'cancel'
  dialogVisible.value = false
}

function onDialogClose() {
  if (closeReason.value === 'none') {
    closeReason.value = 'cancel'
  }
}

function onDialogClosed() {
  if (closeReason.value === 'cancel') {
    emit('cancel')
  }
  closeReason.value = 'none'
  emit('closed')
}

async function onConfirm() {
  if (submitting.value || props.disabled) return

  const ids = localModel[activeSelectionField.value] || []
  if (props.required && ids.length === 0) {
    message.warning(`请至少选择一个${requiredLabel.value}`)
    return
  }

  submitting.value = true
  try {
    closeReason.value = 'confirm'
    emit('confirm', buildResult())
    dialogVisible.value = false
  } finally {
    submitting.value = false
  }
}

watch(
  () => dialogVisible.value,
  (visible) => {
    if (!visible) return
    closeReason.value = 'none'
    void initDialogData()
  },
  { immediate: true }
)
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    class="personnel-selection-dialog"
    append-to-body
    destroy-on-close
    :close-on-click-modal="props.closeOnClickModal"
    :close-on-press-escape="!submitting"
    :show-close="!submitting"
    :title="props.title"
    :width="props.width"
    @close="onDialogClose"
    @closed="onDialogClosed"
  >
    <PersonnelSelector
      ref="selectorRef"
      v-model="localModel"
      :mode="props.mode"
      :selection-field="activeSelectionField"
      :allow-select-org="props.allowSelectOrg"
      :disabled="props.disabled || submitting"
      :fetch-nodes="props.fetchNodes"
      :search-nodes="props.searchNodes"
    />

    <template #footer>
      <div class="personnel-selection-dialog__footer">
        <el-button :disabled="submitting" @click="onCancel">{{ props.cancelText }}</el-button>
        <el-button type="primary" :loading="submitting" :disabled="props.disabled" @click="onConfirm">
          {{ props.confirmText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.personnel-selection-dialog__footer {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  gap: 8px;
}

:global(.personnel-selection-dialog .el-dialog__body) {
  padding-top: 8px;
}
</style>
