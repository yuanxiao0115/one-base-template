<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import PositionEditForm from './components/PositionEditForm.vue'
import PositionSearchForm from './components/PositionSearchForm.vue'
import { positionFormRules } from './form'
import { usePositionPageState } from './composables/usePositionPageState'

defineOptions({
  name: 'PositionManagementPage'
})

// 页面仅保留编排层：职位管理查询、CRUD 与分页行为统一下沉到 composable。
const pageState = usePositionPageState()

const refs = pageState.refs
const {
  loading,
  dataList,
  tablePagination,
  tableColumns,
  searchForm
} = pageState.table

const {
  crud,
  crudVisible,
  crudMode,
  crudTitle,
  crudReadonly,
  crudSubmitting,
  crudForm
} = pageState.editor

const {
  tableSearch,
  onKeywordUpdate,
  onResetSearch,
  handleSizeChange,
  handleCurrentChange,
  handleDelete
} = pageState.actions
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
      title="职位管理"
      :columns="tableColumns"
      placeholder="请输入职位名称搜索"
      :keyword="searchForm.postName"
      @search="tableSearch"
      @update:keyword="onKeywordUpdate"
      @reset-form="onResetSearch"
    >
      <template #buttons>
        <el-button type="primary" :icon="Plus" @click="crud.openCreate()">新增职位</el-button>
      </template>

      <template #default="{ size, dynamicColumns }">
        <ObVxeTable
          :ref="refs.tableRef"
          :size="size"
          :loading="loading"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="tablePagination"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row, size: actionSize }">
            <ObActionButtons>
              <el-button link type="primary" :size="actionSize" @click="crud.openEdit(row)">编辑</el-button>
              <el-button link type="primary" :size="actionSize" @click="crud.openDetail(row)">查看</el-button>
              <el-button link type="danger" :size="actionSize" @click="handleDelete(row)">删除</el-button>
            </ObActionButtons>
          </template>
        </ObVxeTable>
      </template>

      <template #drawer>
        <PositionSearchForm :ref="refs.searchRef" v-model="searchForm" />
      </template>
    </ObTableBox>
  </ObPageContainer>

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
    <PositionEditForm :ref="refs.editFormRef" v-model="crudForm" :rules="positionFormRules" :disabled="crudReadonly" />
  </ObCrudContainer>
</template>
