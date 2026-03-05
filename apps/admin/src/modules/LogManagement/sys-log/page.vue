<script setup lang="ts">
  import SysLogSearchForm from "./components/SysLogSearchForm.vue";
  import SysLogDetail from "./components/SysLogDetail.vue";
  import { useSysLogPageState } from "./composables/useSysLogPageState";

  defineOptions({
    name: "SysLogManagementPage",
  });

  // 页面仅保留编排层：操作日志查询、详情与删除逻辑统一下沉到 composable。
  const pageState = useSysLogPageState();

  const { refs } = pageState;

  const { loading, dataList, pagination, tableColumns, searchForm } = pageState.table;

  const { detailVisible, detailLoading, detailData } = pageState.detail;

  const {
    tableSearch,
    onKeywordUpdate,
    onResetSearch,
    handleSizeChange,
    handleCurrentChange,
    openDetail,
    handleDelete,
  } = pageState.actions;
</script>

<template>
  <div>
    <ObPageContainer padding="0" overflow="hidden">
      <ObTableBox
        title="操作日志"
        :columns="tableColumns"
        placeholder="请输入操作人账号"
        :keyword="searchForm.operator"
        @search="tableSearch"
        @update:keyword="onKeywordUpdate"
        @reset-form="onResetSearch"
      >
        <template #default="{ size, dynamicColumns }">
          <ObVxeTable
            :ref="refs.tableRef"
            :loading
            :size
            :data="dataList"
            :columns="dynamicColumns"
            :pagination
            row-key="id"
            @page-size-change="handleSizeChange"
            @page-current-change="handleCurrentChange"
          >
            <template #operationResult="{ row }">
              <el-tag :type="row.operationResult === 0 ? 'success' : 'danger'">
                {{ row.operationResult === 0 ? '成功' : '失败' }}
              </el-tag>
            </template>

            <template #operation="{ row, size: actionSize }">
              <ObActionButtons>
                <el-button link type="primary" :size="actionSize" @click="() => openDetail(row)">查看</el-button>
                <el-button link type="danger" :size="actionSize" @click="() => handleDelete(row)">删除</el-button>
              </ObActionButtons>
            </template>
          </ObVxeTable>
        </template>

        <template #drawer> <SysLogSearchForm :ref="refs.searchRef" v-model="searchForm" /> </template>
      </ObTableBox>
    </ObPageContainer>

    <el-drawer v-model="detailVisible" title="日志详情" :size="760" append-to-body>
      <el-skeleton v-if="detailLoading" :rows="8" animated />
      <SysLogDetail v-else :detail="detailData" />
    </el-drawer>
  </div>
</template>
