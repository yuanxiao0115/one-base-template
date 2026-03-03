<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import DictEditForm from './components/DictEditForm.vue'
import DictSearchForm from './components/DictSearchForm.vue'
import DictItemEditForm from './components/DictItemEditForm.vue'
import DictItemSearchForm from './components/DictItemSearchForm.vue'
import { useDictPageState } from './composables/useDictPageState'

defineOptions({
  name: 'SystemDictManagementPage'
})

const pageState = useDictPageState()

const refs = pageState.refs

const {
  loading,
  dataList,
  tableColumns,
  tablePagination,
  searchForm
} = pageState.table

const {
  crud,
  crudVisible,
  crudMode,
  crudTitle,
  crudReadonly,
  crudSubmitting,
  crudForm,
  dictFormRules
} = pageState.editor

const {
  settingVisible,
  settingTitle,
  currentDictInfo,
  itemLoading,
  itemDataList,
  itemTableColumns,
  itemTablePagination,
  itemSearchForm,
  itemCrud,
  itemCrudVisible,
  itemCrudMode,
  itemCrudTitle,
  itemCrudReadonly,
  itemCrudSubmitting,
  itemCrudForm,
  dictItemFormRules
} = pageState.setting

const {
  tableSearch,
  onKeywordUpdate,
  onResetSearch,
  openSetting,
  closeSetting,
  itemTableSearch,
  onItemKeywordUpdate,
  onResetItemSearch,
  handleSelectionChange,
  handleSizeChange,
  handleCurrentChange,
  handleDelete,
  handleItemSelectionChange,
  handleItemSizeChange,
  handleItemCurrentChange,
  handleDeleteItem,
  handleToggleItemStatus
} = pageState.actions
</script>

<template>
  <ObPageContainer padding="0" overflow="hidden">
    <ObTableBox
      title="字典管理"
      :columns="tableColumns"
      placeholder="请输入字典编码搜索"
      :keyword="searchForm.dictCode"
      @search="tableSearch"
      @update:keyword="onKeywordUpdate"
      @reset-form="onResetSearch"
    >
      <template #buttons>
        <el-button type="primary" :icon="Plus" @click="crud.openCreate()">添加字典</el-button>
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
              <el-button link type="primary" :size="actionSize" @click="crud.openEdit(row)">编辑</el-button>
              <el-button link type="primary" :size="actionSize" @click="crud.openDetail(row)">查看</el-button>
              <el-button link type="primary" :size="actionSize" @click="openSetting(row)">字典配置</el-button>
              <el-button link type="danger" :size="actionSize" @click="handleDelete(row)">删除</el-button>
            </ObActionButtons>
          </template>
        </ObVxeTable>
      </template>

      <template #drawer>
        <DictSearchForm :ref="refs.searchRef" v-model="searchForm" />
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
    :drawer-size="640"
    :drawer-columns="2"
    @confirm="crud.confirm"
    @cancel="crud.close"
    @close="crud.close"
  >
    <DictEditForm
      :ref="refs.editFormRef"
      v-model="crudForm"
      :rules="dictFormRules"
      :disabled="crudReadonly"
    />
  </ObCrudContainer>

  <ObCrudContainer
    v-model="settingVisible"
    container="dialog"
    mode="edit"
    :title="settingTitle"
    :dialog-width="1200"
    :show-footer="false"
    @close="closeSetting"
  >
    <div class="system-dict-management-page__setting">
      <div class="system-dict-management-page__setting-head">
        <span>字典编码：{{ currentDictInfo.dictCode }}</span>
        <span>字典名称：{{ currentDictInfo.dictName }}</span>
      </div>

      <ObTableBox
        title="字典项列表"
        :columns="itemTableColumns"
        placeholder="请输入字段名称搜索"
        :keyword="itemSearchForm.itemName"
        @search="itemTableSearch"
        @update:keyword="onItemKeywordUpdate"
        @reset-form="onResetItemSearch"
      >
        <template #buttons>
          <el-button type="primary" :icon="Plus" @click="itemCrud.openCreate()">添加字段</el-button>
        </template>

        <template #default="{ size, dynamicColumns }">
          <ObVxeTable
            :ref="refs.itemTableRef"
            :loading="itemLoading"
            :size="size"
            :data="itemDataList"
            :columns="dynamicColumns"
            :pagination="itemTablePagination"
            row-key="id"
            @selection-change="handleItemSelectionChange"
            @page-size-change="handleItemSizeChange"
            @page-current-change="handleItemCurrentChange"
          >
            <template #disabled="{ row }">
              <el-tag :type="row.disabled === 0 ? 'success' : 'info'">
                {{ row.disabled === 0 ? '已启用' : '已停用' }}
              </el-tag>
            </template>

            <template #itemOperation="{ row, size: actionSize }">
              <ObActionButtons>
                <el-button link type="primary" :size="actionSize" @click="itemCrud.openEdit(row)">编辑</el-button>
                <el-button link type="primary" :size="actionSize" @click="handleToggleItemStatus(row)">
                  {{ row.disabled === 0 ? '停用' : '启用' }}
                </el-button>
                <el-button link type="primary" :size="actionSize" @click="itemCrud.openDetail(row)">查看</el-button>
                <el-button link type="danger" :size="actionSize" @click="handleDeleteItem(row)">删除</el-button>
              </ObActionButtons>
            </template>
          </ObVxeTable>
        </template>

        <template #drawer>
          <DictItemSearchForm :ref="refs.itemSearchRef" v-model="itemSearchForm" />
        </template>
      </ObTableBox>
    </div>
  </ObCrudContainer>

  <ObCrudContainer
    v-model="itemCrudVisible"
    container="dialog"
    :mode="itemCrudMode"
    :title="itemCrudTitle"
    :loading="itemCrudSubmitting"
    :dialog-width="620"
    :show-cancel-button="!itemCrudReadonly"
    :confirm-text="'保存'"
    @confirm="itemCrud.confirm"
    @cancel="itemCrud.close"
    @close="itemCrud.close"
  >
    <DictItemEditForm
      :ref="refs.itemEditFormRef"
      v-model="itemCrudForm"
      :rules="dictItemFormRules"
      :disabled="itemCrudReadonly"
    />
  </ObCrudContainer>
</template>

<style scoped>
.system-dict-management-page__setting {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 68vh;
  min-height: 520px;
}

.system-dict-management-page__setting-head {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
  color: var(--el-text-color-regular);
  font-size: 13px;
}
</style>
