<script setup lang="ts">
import { Delete, Plus, Search } from '@element-plus/icons-vue'
import RoleAssignMemberSelectForm from './components/RoleAssignMemberSelectForm.vue'
import { useRoleAssignPageState } from './composables/useRoleAssignPageState'

defineOptions({
  name: 'RoleAssignPage'
})

const pageState = useRoleAssignPageState()

const refs = pageState.refs

const {
  loading,
  dataList,
  tableColumns,
  tablePagination,
  selectedNum,
  searchForm,
  currentRoleName
} = pageState.table

const {
  roleLoading,
  roleKeyword,
  roleList,
  currentRole
} = pageState.roles

const {
  memberDialogVisible,
  memberDialogLoading,
  memberDialogSubmitting,
  memberForm
} = pageState.dialogs

const {
  onRoleKeywordUpdate,
  onRoleKeywordSearch,
  onRoleKeywordClear,
  selectRole,
  tableSearch,
  onKeywordUpdate,
  onResetSearch,
  handleSelectionChange,
  handleSizeChange,
  handleCurrentChange,
  onSelectionCancel,
  handleRemove,
  fetchContactNodes,
  searchContactUsers,
  openAddMembersDialog,
  closeAddMembersDialog,
  submitAddMembersDialog
} = pageState.actions

function onRoleMenuSelect(roleId: string) {
  const target = roleList.value.find((item) => String(item.id) === roleId)
  if (!target) return
  void selectRole(target)
}
</script>

<template>
  <PageContainer padding="0" overflow="hidden" left-width="248px">
    <template #left>
      <section class="flex h-full min-h-0 flex-col">
        <div class="mb-2 flex items-center justify-between text-sm font-medium text-[var(--el-text-color-primary)]">
          <span>角色列表</span>
          <el-tag size="small" type="info">{{ roleList.length }}</el-tag>
        </div>

        <el-input
          :model-value="roleKeyword"
          class="mb-2 role-assign-page__role-search"
          clearable
          placeholder="输入角色进行搜索"
          :suffix-icon="Search"
          @update:model-value="onRoleKeywordUpdate"
          @clear="onRoleKeywordClear"
          @keyup.enter="onRoleKeywordSearch"
        />

        <el-scrollbar v-loading="roleLoading" class="min-h-0 flex-1">
          <el-empty v-if="roleList.length === 0" description="暂无角色数据" :image-size="78" />
          <el-menu
            v-else
            class="role-assign-page__role-menu"
            :default-active="currentRole ? String(currentRole.id) : ''"
            @select="onRoleMenuSelect"
          >
            <el-menu-item
              v-for="item in roleList"
              :key="item.id"
              :index="String(item.id)"
              class="mb-1 flex justify-between pr-2 text-xs"
            >
              <span class="mr-2 flex-1 truncate">{{ item.roleName }}</span>
              <el-tag size="small" effect="plain">{{ item.userAmount || 0 }}人</el-tag>
            </el-menu-item>
          </el-menu>
        </el-scrollbar>
      </section>
    </template>

    <OneTableBar
      :title="currentRoleName"
      :columns="tableColumns"
      placeholder="请输入用户名搜索"
      :keyword="searchForm.keyWord"
      :selected-num="selectedNum"
      @search="tableSearch"
      @update:keyword="onKeywordUpdate"
      @reset-form="onResetSearch"
      @selection-cancel="onSelectionCancel"
    >
      <template #buttons>
        <el-button :icon="Delete" @click="handleRemove()">移除人员</el-button>
        <el-button type="primary" :icon="Plus" @click="openAddMembersDialog">添加人员</el-button>
      </template>

      <template #default="{ size, dynamicColumns }">
        <ObVxeTable
          :ref="refs.tableRef"
          :loading="loading"
          :size="size"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="tablePagination"
          row-key="id"
          @selection-change="handleSelectionChange"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row, size: actionSize }">
            <ObActionButtons>
              <el-button link type="danger" :size="actionSize" @click="handleRemove(row)">移除</el-button>
            </ObActionButtons>
          </template>
        </ObVxeTable>
      </template>
    </OneTableBar>
  </PageContainer>

  <ObCrudContainer
    v-model="memberDialogVisible"
    container="dialog"
    mode="edit"
    title="添加人员"
    :loading="memberDialogLoading || memberDialogSubmitting"
    :dialog-width="1120"
    @confirm="submitAddMembersDialog"
    @cancel="closeAddMembersDialog"
    @close="closeAddMembersDialog"
  >
    <RoleAssignMemberSelectForm
      :ref="refs.memberFormRef"
      v-model="memberForm"
      :disabled="memberDialogLoading || memberDialogSubmitting"
      :fetch-contact-nodes="fetchContactNodes"
      :search-contact-users="searchContactUsers"
    />
  </ObCrudContainer>
</template>

<style scoped>
:deep(.ob-page-container__left) {
  padding: 16px 12px;
  margin-right: 16px;
  background-color: #fff;
}

.role-assign-page__role-menu {
  --el-menu-item-height: 40px;
  border-right: none;
  background: transparent;
}

.role-assign-page__role-search :deep(.el-input__wrapper) {
  border-radius: 0;
}

.role-assign-page__role-menu :deep(.el-menu-item),
.role-assign-page__role-menu :deep(.el-menu-item.is-active) {
  border-radius: 0;
}
</style>
