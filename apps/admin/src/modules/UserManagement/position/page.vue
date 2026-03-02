<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { positionColumns } from './columns'
import PositionEditForm from './components/PositionEditForm.vue'
import PositionSearchForm from './components/PositionSearchForm.vue'
import {
  positionApi,
  type PositionRecord
} from './api'
import {
  defaultPositionForm,
  positionFormRules,
  toPositionForm,
  toPositionPayload,
  type PositionForm
} from './form'
import {
  assertUniqueCheck,
  shouldCheckPositionUnique,
  toPositionUniqueSnapshot,
  type PositionUniqueSnapshot
} from '../shared/unique'

defineOptions({
  name: 'PositionManagementPage'
})

const tableRef = ref<unknown>(null)
const searchRef = ref<{ resetFields?: () => void }>()
const editFormRef = ref()
const positionUniqueSnapshot = ref<PositionUniqueSnapshot | null>(null)

const searchForm = reactive({
  postName: ''
})

const tableOpt = {
  query: {
    api: positionApi.page,
    params: searchForm,
    pagination: true
  },
  remove: {
    api: positionApi.removePost,
    deleteConfirm: {
      nameKey: 'postName',
      title: '删除确认',
      message: '是否确认删除职位「{name}」？'
    },
    onSuccess: () => {
      message.success('删除职位成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '删除职位失败'
      message.error(errorMessage)
    }
  }
}

const crudPage = useCrudPage<PositionForm, PositionRecord>({
  table: tableOpt,
  tableRef,
  editor: {
    entity: {
      name: '职位'
    },
    form: {
      create: () => ({ ...defaultPositionForm }),
      ref: editFormRef
    },
    detail: {
      beforeOpen: async ({ mode }) => {
        if (mode === 'create') {
          positionUniqueSnapshot.value = null
        }
      },
      load: async ({ row }) => row,
      mapToForm: ({ detail }) => {
        const mapped = toPositionForm(detail)
        positionUniqueSnapshot.value = toPositionUniqueSnapshot(mapped)
        return mapped
      }
    },
    save: {
      buildPayload: async ({ form }) => {
        const payload = toPositionPayload(form)
        const currentUnique = toPositionUniqueSnapshot(payload)

        if (shouldCheckPositionUnique(currentUnique, positionUniqueSnapshot.value)) {
          const response = await positionApi.checkUnique({
            id: payload.id,
            postName: payload.postName
          })
          const isUnique = assertUniqueCheck(response, '职位名称校验失败')
          if (!isUnique) {
            throw new Error('已存在相同职位名称')
          }
        }

        return payload
      },
      request: async ({ mode, payload }) => {
        const response = mode === 'create'
          ? await positionApi.addPost(payload)
          : await positionApi.updatePost(payload)

        if (response.code !== 200) {
          throw new Error(response.message || '保存职位失败')
        }
        return response
      },
      onSuccess: async ({ mode }) => {
        message.success(mode === 'create' ? '新增职位成功' : '更新职位成功')
      }
    }
  }
})

const {
  loading,
  dataList,
  pagination,
  onSearch,
  resetForm,
  handleSizeChange,
  handleCurrentChange
} = crudPage.table

const crud = crudPage.editor
const { remove } = crudPage.actions

const tablePagination = computed(() => ({
  ...pagination
}))

const crudVisible = crud.visible
const crudMode = crud.mode
const crudTitle = crud.title
const crudReadonly = crud.readonly
const crudSubmitting = crud.submitting
const crudForm = crud.form

function tableSearchByName(keyword: string) {
  searchForm.postName = keyword
  void onSearch()
}

function onResetSearch() {
  resetForm(searchRef, 'postName')
}

async function handleDelete(row: PositionRecord) {
  await remove(row)
}
</script>

<template>
  <PageContainer padding="0" overflow="hidden">
    <OneTableBar
      title="职位管理"
      :columns="positionColumns"
      placeholder="请输入职位名称搜索"
      :keyword="searchForm.postName"
      @search="tableSearchByName"
      @update:keyword="searchForm.postName = $event"
      @reset-form="onResetSearch"
    >
      <template #buttons>
        <el-button type="primary" :icon="Plus" @click="crud.openCreate()">新增职位</el-button>
      </template>

      <template #default="{ size, dynamicColumns }">
        <ObVxeTable
          ref="tableRef"
          :size="size"
          :loading="loading"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="tablePagination"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row }">
            <ObActionButtons>
              <el-button link type="primary" :size="size" @click="crud.openEdit(row)">编辑</el-button>
              <el-button link type="primary" :size="size" @click="crud.openDetail(row)">查看</el-button>
              <el-button link type="danger" :size="size" @click="handleDelete(row)">删除</el-button>
            </ObActionButtons>
          </template>
        </ObVxeTable>
      </template>

      <template #drawer>
        <PositionSearchForm ref="searchRef" v-model="searchForm" />
      </template>
    </OneTableBar>
  </PageContainer>

  <ObCrudContainer
    v-model="crudVisible"
    container="drawer"
    :mode="crudMode"
    :title="crudTitle"
    :loading="crudSubmitting"
    :show-cancel-button="!crudReadonly"
    :confirm-text="'保存'"
    :drawer-size="400"
    @confirm="crud.confirm"
    @cancel="crud.close"
    @close="crud.close"
  >
    <PositionEditForm ref="editFormRef" v-model="crudForm" :rules="positionFormRules" :disabled="crudReadonly" />
  </ObCrudContainer>
</template>
