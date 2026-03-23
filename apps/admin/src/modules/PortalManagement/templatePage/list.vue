<script setup lang="ts">
import PagePermissionDialog from './components/PagePermissionDialog.vue';
import PortalAuthorityDialog from './components/PortalAuthorityDialog.vue';
import PortalPermissionSwitchDialog from './components/PortalPermissionSwitchDialog.vue';
import PortalTemplateCreateDialog from './components/PortalTemplateCreateDialog.vue';
import { usePortalTemplateListPageState } from './composables/usePortalTemplateListPageState';

defineOptions({ name: 'PortalTemplateList' });

const {
  tableColumns,
  loading,
  rows,
  searchForm,
  tablePagination,
  dialogVisible,
  dialogSubmitting,
  dialogMode,
  dialogTitle,
  dialogSubmitText,
  dialogInitialValue,
  authoritySubmitting,
  authorityInitial,
  permissionCenterVisible,
  permissionTemplateId,
  permissionTemplateName,
  permissionPageTree,
  pagePermissionLoading,
  pagePermissionInitial,
  pagePermissionCurrentTabId,
  tableSearch,
  onKeywordUpdate,
  onResetSearch,
  queryList,
  handlePageSizeChange,
  handlePageCurrentChange,
  isPublished,
  getPublishStatusText,
  openCreate,
  openEdit,
  goDesigner,
  openCopy,
  openPermissionCenter,
  openPreview,
  onSelectPermissionPage,
  onSubmitPagePermission,
  onSubmitAuthority,
  onSubmitTemplate,
  togglePublish,
  deleteTemplate
} = usePortalTemplateListPageState();
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
      title="门户模板"
      :columns="tableColumns"
      placeholder="请输入门户名称"
      :keyword="searchForm.searchKey"
      @search="tableSearch"
      @update:keyword="onKeywordUpdate"
      @reset-form="onResetSearch"
    >
      <template #buttons>
        <el-select
          v-model="searchForm.publishStatus"
          class="status-filter"
          clearable
          placeholder="全部状态"
        >
          <el-option :value="0" label="草稿" />
          <el-option :value="1" label="已发布" />
        </el-select>
        <el-button :loading="loading" @click="queryList(1)">刷新</el-button>
        <el-button type="primary" @click="openCreate">新增门户</el-button>
      </template>

      <template #default="{ size, dynamicColumns }">
        <ObVxeTable
          :size
          :loading
          :data="rows"
          :columns="dynamicColumns"
          :pagination="tablePagination"
          row-key="id"
          @page-size-change="handlePageSizeChange"
          @page-current-change="handlePageCurrentChange"
        >
          <template #description="{ row }">
            <span>{{ row.description || '-' }}</span>
          </template>

          <template #publishStatus="{ row }">
            <el-tag :type="isPublished(row) ? 'success' : 'info'">{{
              getPublishStatusText(row)
            }}</el-tag>
          </template>

          <template #operation="{ row, size: actionSize }">
            <ObActionButtons>
              <el-button link type="primary" :size="actionSize" @click="openEdit(row)"
                >编辑</el-button
              >
              <el-button link type="primary" :size="actionSize" @click="goDesigner(row)"
                >配置</el-button
              >
              <el-button link :size="actionSize" @click="openCopy(row)">复制</el-button>
              <el-button link :size="actionSize" @click="openPermissionCenter(row)"
                >权限配置</el-button
              >
              <el-button link :size="actionSize" @click="openPreview(row)">预览</el-button>
              <el-button link :size="actionSize" @click="togglePublish(row)">
                {{ isPublished(row) ? '取消发布' : '发布' }}
              </el-button>
              <el-button link type="danger" :size="actionSize" @click="deleteTemplate(row)"
                >删除</el-button
              >
            </ObActionButtons>
          </template>
        </ObVxeTable>
      </template>

      <template #drawer>
        <el-form label-position="top" class="drawer-form">
          <el-form-item label="发布状态">
            <el-select
              v-model="searchForm.publishStatus"
              clearable
              placeholder="全部状态"
              class="drawer-select"
            >
              <el-option :value="0" label="草稿" />
              <el-option :value="1" label="已发布" />
            </el-select>
          </el-form-item>
        </el-form>
      </template>
    </ObTableBox>
  </ObPageContainer>

  <PortalTemplateCreateDialog
    v-model="dialogVisible"
    :loading="dialogSubmitting"
    :mode="dialogMode"
    :title="dialogTitle"
    :submit-text="dialogSubmitText"
    :initial-value="dialogInitialValue"
    @submit="onSubmitTemplate"
  />

  <PortalPermissionSwitchDialog
    v-model="permissionCenterVisible"
    :template-id="permissionTemplateId"
    :template-name="permissionTemplateName"
    :page-tree="permissionPageTree"
    :current-page-id="pagePermissionCurrentTabId"
    :page-detail-loading="pagePermissionLoading"
    @select-page="onSelectPermissionPage"
  >
    <template #portal-content>
      <PortalAuthorityDialog
        embedded
        :loading="authoritySubmitting"
        :initial="authorityInitial"
        @submit="onSubmitAuthority"
      />
    </template>

    <template #page-content>
      <PagePermissionDialog
        embedded
        :loading="pagePermissionLoading"
        :initial="pagePermissionInitial"
        @submit="onSubmitPagePermission"
      />
    </template>
  </PortalPermissionSwitchDialog>
</template>

<style scoped>
.status-filter {
  width: 140px;
}

.drawer-form {
  padding: 8px 0;
}

.drawer-select {
  width: 100%;
}
</style>
