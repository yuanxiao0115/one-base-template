<script setup lang="ts">
import OrgManagerDialogContactPane from './OrgManagerDialogContactPane.vue';
import OrgManagerDialogSelectedPane from './OrgManagerDialogSelectedPane.vue';
import { useOrgManagerDialogState } from './useOrgManagerDialogState';

const props = defineProps<{
  modelValue: boolean;
  orgId: string;
  orgName: string;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'success'): void;
}>();

const state = useOrgManagerDialogState(props, emit);
const {
  visible,
  loading,
  saving,
  searchKeyword,
  breadcrumbs,
  showBreadcrumb,
  currentNodes,
  selectedUsers,
  selectedUserIdSet,
  actions
} = state;
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="`设置管理员 - ${props.orgName || '组织'}`"
    width="980"
    append-to-body
    destroy-on-close
  >
    <div v-loading="loading" class="org-manager-dialog">
      <OrgManagerDialogContactPane
        :search-keyword="searchKeyword"
        :show-breadcrumb="showBreadcrumb"
        :breadcrumbs="breadcrumbs"
        :current-nodes="currentNodes"
        :selected-user-id-set="selectedUserIdSet"
        @update:search-keyword="searchKeyword = $event"
        @search="actions.handleSearch"
        @search-clear="actions.handleSearchClear"
        @goto-breadcrumb="actions.gotoBreadcrumb"
        @enter-org="actions.enterOrgNode"
        @toggle-user="actions.toggleUser"
      />
      <OrgManagerDialogSelectedPane
        :selected-users="selectedUsers"
        @clear="actions.clearSelected"
        @remove="actions.removeSelectedById"
      />
    </div>

    <template #footer>
      <div class="org-manager-dialog__footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="actions.handleSubmit">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.org-manager-dialog {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  min-height: 520px;
  border: 1px solid var(--el-border-color-lighter);
}

.org-manager-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
