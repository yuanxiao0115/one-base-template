<script setup lang="ts">
import LoginLogSearchForm from './components/LoginLogSearchForm.vue'
import LoginLogDetail from './components/LoginLogDetail.vue'
import { useLoginLogPageState } from './composables/useLoginLogPageState'

defineOptions({
  name: 'LoginLogManagementPage'
})

// 页面仅保留编排层：登录日志查询、详情与删除逻辑统一下沉到 composable。
const pageState = useLoginLogPageState()

const refs = pageState.refs

const {
  loading,
  dataList,
  pagination,
  tableColumns,
  searchForm,
  clientTypeList
} = pageState.table

const {
  detailVisible,
  detailLoading,
  detailData
} = pageState.detail

const {
  tableSearch,
  onKeywordUpdate,
  onResetSearch,
  handleSizeChange,
  handleCurrentChange,
  openDetail,
  handleDelete
} = pageState.actions
</script>

<template>
  <PageContainer padding="0" overflow="hidden">
    <OneTableBar
      title="登录日志"
      :columns="tableColumns"
      placeholder="请输入登录人姓名"
      :keyword="searchForm.nickName"
      @search="tableSearch"
      @update:keyword="onKeywordUpdate"
      @reset-form="onResetSearch"
    >
      <template #default="{ size, dynamicColumns }">
        <ObVxeTable
          :ref="refs.tableRef"
          :loading="loading"
          :size="size"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="pagination"
          row-key="id"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row, size: actionSize }">
            <ObActionButtons>
              <el-button link type="primary" :size="actionSize" @click="openDetail(row)">查看</el-button>
              <el-button link type="danger" :size="actionSize" @click="handleDelete(row)">删除</el-button>
            </ObActionButtons>
          </template>
        </ObVxeTable>
      </template>

      <template #drawer>
        <LoginLogSearchForm :ref="refs.searchRef" v-model="searchForm" :client-type-list="clientTypeList" />
      </template>
    </OneTableBar>
  </PageContainer>

  <el-drawer v-model="detailVisible" title="日志详情" :size="520" append-to-body>
    <el-skeleton v-if="detailLoading" :rows="6" animated />
    <LoginLogDetail v-else :detail="detailData" />
  </el-drawer>
</template>
