<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import {
  CrudContainer as ObCrudContainer,
  VxeTable as ObVxeTable,
  ActionButtons as ObActionButtons,
  type TableColumnList
} from '@one-base-template/ui'
import type { FormInstance, FormRules } from 'element-plus'
import { orgApi, type OrgLevelItem, type OrgLevelSavePayload } from '../api'

type OrgLevelForm = {
  id?: string
  orgLevel: number
  orgLevelName: string
  remark: string
}

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'updated'): void
}>()

const tableRef = ref<unknown>(null)
const formRef = ref<FormInstance>()

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const tableColumns: TableColumnList = [
  {
    label: '等级名称',
    prop: 'orgLevelName',
    minWidth: 220,
    showOverflowTooltip: true
  },
  {
    label: '级别',
    prop: 'orgLevel',
    width: 140,
    align: 'center'
  },
  {
    label: '备注',
    prop: 'remark',
    minWidth: 240,
    showOverflowTooltip: true
  },
  {
    label: '操作',
    slot: 'operation',
    fixed: 'right',
    width: 180
  }
]

const tableOpt = reactive({
  searchApi: orgApi.getOrgLevelList,
  paginationFlag: false
})

const { loading, dataList, onSearch } = useTable(tableOpt, tableRef)

const defaultLevelForm: OrgLevelForm = {
  orgLevel: 1,
  orgLevelName: '',
  remark: ''
}

const levelFormRules: FormRules<OrgLevelForm> = {
  orgLevelName: [{ required: true, message: '请输入等级名称', trigger: 'blur' }],
  orgLevel: [{ required: true, message: '请输入级别', trigger: 'blur', type: 'number' }]
}

const levelCrud = useCrudContainer<OrgLevelForm, OrgLevelItem, OrgLevelItem, OrgLevelSavePayload>({
  entityName: '组织等级',
  container: 'dialog',
  createForm: () => ({ ...defaultLevelForm }),
  formRef,
  loadDetail: async ({ row }) => row,
  mapDetailToForm: ({ detail }) => ({
    id: detail.id,
    orgLevelName: detail.orgLevelName || '',
    orgLevel: Number(detail.orgLevel || 1),
    remark: detail.remark || ''
  }),
  beforeSubmit: ({ form }) => ({
    id: form.id,
    orgLevelName: (form.orgLevelName || '').trim(),
    orgLevel: Number(form.orgLevel || 0),
    remark: (form.remark || '').trim()
  }),
  submit: async ({ mode, payload }) => {
    const response = mode === 'create'
      ? await orgApi.addOrgLevel(payload)
      : await orgApi.updateOrgLevel(payload)

    if (response.code !== 200) {
      throw new Error(response.message || '保存等级失败')
    }

    return response
  },
  onSuccess: async ({ mode }) => {
    message.success(mode === 'create' ? '新增等级成功' : '更新等级成功')
    await onSearch(false)
    emit('updated')
  }
})

const levelCrudVisible = levelCrud.visible
const levelCrudMode = levelCrud.mode
const levelCrudTitle = levelCrud.title
const levelCrudSubmitting = levelCrud.submitting
const levelCrudReadonly = levelCrud.readonly
const levelCrudForm = levelCrud.form

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

async function handleDelete(row: OrgLevelItem) {
  try {
    await obConfirm.warn(`是否确认删除等级「${row.orgLevelName}」？`, '删除确认')

    const response = await orgApi.deleteOrgLevel({ id: row.id })
    if (response.code !== 200) {
      throw new Error(response.message || '删除等级失败')
    }

    message.success('删除等级成功')
    await onSearch(false)
    emit('updated')
  } catch (error) {
    if (error === 'cancel') return
    message.error(getErrorMessage(error, '删除等级失败'))
  }
}

watch(
  () => props.modelValue,
  (visibleValue) => {
    if (!visibleValue) return
    void onSearch(false)
  },
  { immediate: true }
)
</script>

<template>
  <el-dialog
    v-model="visible"
    title="等级管理"
    width="760"
    append-to-body
    destroy-on-close
  >
    <div class="org-level-dialog">
      <div class="org-level-dialog__toolbar">
        <el-button type="primary" :icon="Plus" @click="levelCrud.openCreate()">新增等级</el-button>
      </div>

      <ObVxeTable
        ref="tableRef"
        :loading="loading"
        :data="dataList"
        :columns="tableColumns"
        :pagination="false"
        row-key="id"
      >
        <template #operation="{ row, size }">
          <ObActionButtons>
            <el-button link type="primary" :size="size" @click="levelCrud.openEdit(row)">编辑</el-button>
            <el-button link type="danger" :size="size" @click="handleDelete(row)">删除</el-button>
          </ObActionButtons>
        </template>
      </ObVxeTable>
    </div>

    <template #footer>
      <div class="org-level-dialog__footer">
        <el-button @click="visible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>

  <ObCrudContainer
    v-model="levelCrudVisible"
    container="dialog"
    :mode="levelCrudMode"
    :title="levelCrudTitle"
    :loading="levelCrudSubmitting"
    :show-cancel-button="!levelCrudReadonly"
    :confirm-text="'保存'"
    :dialog-width="520"
    @confirm="levelCrud.confirm"
    @cancel="levelCrud.close"
    @close="levelCrud.close"
  >
    <el-form
      ref="formRef"
      :model="levelCrudForm"
      :rules="levelFormRules"
      :disabled="levelCrudReadonly"
      label-position="top"
    >
      <el-form-item label="等级名称" prop="orgLevelName">
        <el-input
          v-model.trim="levelCrudForm.orgLevelName"
          maxlength="30"
          show-word-limit
          placeholder="请输入等级名称"
        />
      </el-form-item>

      <el-form-item label="等级值" prop="orgLevel">
        <el-input-number v-model="levelCrudForm.orgLevel" class="w-full" :min="1" :max="999" />
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model.trim="levelCrudForm.remark"
          type="textarea"
          :rows="3"
          maxlength="200"
          show-word-limit
          placeholder="请输入备注"
        />
      </el-form-item>
    </el-form>
  </ObCrudContainer>
</template>

<style scoped>
.org-level-dialog {
  display: flex;
  flex-direction: column;
  height: 460px;
  background: #ffffff;
}

.org-level-dialog__toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.org-level-dialog :deep(.ob-vxe-table) {
  background: #ffffff;
}

.org-level-dialog__footer {
  display: flex;
  justify-content: flex-end;
}
</style>
