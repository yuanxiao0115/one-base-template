<script setup lang="ts">
import { reactive } from 'vue';
import TenantManagerSearchForm from './components/TenantManagerSearchForm.vue';
import { useTenantManagerPageState } from './composables/useTenantManagerPageState';

defineOptions({
  name: 'TenantManagerManagementPage'
});

const pageState = useTenantManagerPageState();

const { refs, actions } = pageState;
const table = reactive(pageState.table);
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
      title="租户管理员管理"
      :columns="table.tableColumns"
      placeholder="请输入租户名称搜索"
      :keyword="table.searchForm.tenantName"
      @search="actions.tableSearch"
      @update:keyword="actions.onKeywordUpdate"
      @reset-form="actions.onResetSearch"
    >
      <template #default="{ size, dynamicColumns }">
        <ObTable
          :ref="refs.tableRef"
          :size
          :loading="table.loading"
          :data="table.dataList"
          :columns="dynamicColumns"
          :pagination="table.tablePagination"
          row-key="id"
          @page-size-change="actions.handleSizeChange"
          @page-current-change="actions.handleCurrentChange"
        >
          <template #isEnable="{ row }">
            <el-tag :type="actions.getStatusType(row)">{{ actions.getStatusText(row) }}</el-tag>
          </template>

          <template #operation="{ row, size: actionSize }">
            <ObActionButtons>
              <el-button link type="primary" :size="actionSize" @click="actions.handleStatus(row)">
                {{ actions.isEnabled(row) ? '停用' : '启用' }}
              </el-button>
              <el-button
                link
                type="primary"
                :size="actionSize"
                @click="actions.handleResetPassword(row)"
              >
                重置密码
              </el-button>
            </ObActionButtons>
          </template>
        </ObTable>
      </template>

      <template #drawer>
        <TenantManagerSearchForm :ref="refs.searchRef" v-model="table.searchForm" />
      </template>
    </ObTableBox>
  </ObPageContainer>
</template>
