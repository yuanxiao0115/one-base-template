<script setup lang="ts">
import { reactive } from 'vue';
import { Delete, Plus, Search } from '@element-plus/icons-vue';
import RoleAssignMemberSelectForm from './components/RoleAssignMemberSelectForm.vue';
import { useRoleAssignPageState } from './composables/useRoleAssignPageState';

defineOptions({
  name: 'RoleAssignPage'
});

const pageState = useRoleAssignPageState();

const { refs, actions } = pageState;
const table = reactive(pageState.table);
const roles = reactive(pageState.roles);
const dialogs = reactive(pageState.dialogs);

function onRoleMenuSelect(roleId: string) {
  const target = roles.roleList.find((item) => String(item.id) === roleId);
  if (!target) {
    return;
  }
  void actions.selectRole(target);
}
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden" left-width="248px">
    <template #left>
      <section class="flex flex-col h-full min-h-0">
        <div
          class="flex font-medium items-center justify-between mb-2 text-[var(--el-text-color-primary)] text-sm"
        >
          <span>角色列表</span>
          <el-tag size="small" type="info">{{ roles.roleList.length }}</el-tag>
        </div>

        <el-input
          :model-value="roles.roleKeyword"
          class="mb-2 role-assign-page__role-search"
          clearable
          placeholder="输入角色进行搜索"
          :suffix-icon="Search"
          @update:model-value="actions.onRoleKeywordUpdate"
          @clear="actions.onRoleKeywordClear"
          @keyup.enter="actions.onRoleKeywordSearch"
        />

        <el-scrollbar v-loading="roles.roleLoading" class="flex-1 min-h-0">
          <el-empty
            v-if="roles.roleList.length === 0"
            description="暂无角色数据"
            :image-size="78"
          />
          <el-menu
            v-else
            class="role-assign-page__role-menu"
            :default-active="roles.currentRole ? String(roles.currentRole.id) : ''"
            @select="onRoleMenuSelect"
          >
            <el-menu-item
              v-for="item in roles.roleList"
              :key="item.id"
              :index="String(item.id)"
              class="flex justify-between mb-1 pr-2 text-xs"
            >
              <span class="flex-1 mr-2 truncate">{{ item.roleName }}</span>
              <el-tag size="small" effect="plain">{{ item.userAmount || 0 }}人</el-tag>
            </el-menu-item>
          </el-menu>
        </el-scrollbar>
      </section>
    </template>

    <ObTableBox
      :title="table.currentRoleName"
      :columns="table.tableColumns"
      placeholder="请输入用户名搜索"
      :keyword="table.searchForm.keyWord"
      :selected-num="table.selectedNum"
      @search="actions.tableSearch"
      @update:keyword="actions.onKeywordUpdate"
      @reset-form="actions.onResetSearch"
      @selection-cancel="actions.onSelectionCancel"
    >
      <template #buttons>
        <el-button :icon="Delete" @click="actions.handleRemove()">移除人员</el-button>
        <el-button type="primary" :icon="Plus" @click="actions.openAddMembersDialog"
          >添加人员</el-button
        >
      </template>

      <template #default="{ size, dynamicColumns }">
        <ObVxeTable
          :ref="refs.tableRef"
          :loading="table.loading"
          :size
          :data="table.dataList"
          :columns="dynamicColumns"
          :pagination="table.tablePagination"
          row-key="id"
          @selection-change="actions.handleSelectionChange"
          @page-size-change="actions.handleSizeChange"
          @page-current-change="actions.handleCurrentChange"
        >
          <template #operation="{ row, size: actionSize }">
            <ObActionButtons>
              <el-button link type="danger" :size="actionSize" @click="actions.handleRemove(row)"
                >移除</el-button
              >
            </ObActionButtons>
          </template>
        </ObVxeTable>
      </template>
    </ObTableBox>
  </ObPageContainer>

  <ObCrudContainer
    v-model="dialogs.memberDialogVisible"
    container="dialog"
    mode="edit"
    title="添加人员"
    :loading="dialogs.memberDialogLoading || dialogs.memberDialogSubmitting"
    :dialog-width="1120"
    @confirm="actions.submitAddMembersDialog"
    @cancel="actions.closeAddMembersDialog"
    @close="actions.closeAddMembersDialog"
  >
    <RoleAssignMemberSelectForm
      :ref="refs.memberFormRef"
      v-model="dialogs.memberForm"
      :disabled="dialogs.memberDialogLoading || dialogs.memberDialogSubmitting"
      :initial-selected-users="dialogs.memberDialogSelectedUsers"
      :fetch-nodes="actions.fetchNodes"
      :search-nodes="actions.searchNodes"
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
