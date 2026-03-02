<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Download, Lock, Plus, Rank, Unlock, Upload } from '@element-plus/icons-vue'
import { sm4EncryptBase64 } from '@/infra/sczfw/crypto'
import {
  ImportUpload as ObImportUpload,
  type CrudFormLike
} from '@one-base-template/ui'
import buildUserColumns from './columns'
import UserSearchForm from './components/UserSearchForm.vue'
import UserEditForm from './components/UserEditForm.vue'
import UserAccountForm from './components/UserAccountForm.vue'
import UserBindAccountForm, { type UserBindOption } from './components/UserBindAccountForm.vue'
import {
  userApi,
  type OrgTreeNode,
  type PositionItem,
  type RoleItem,
  type UserDetailData,
  type UserListRecord,
  type UserSavePayload
} from './api'
import {
  createDefaultUserForm,
  defaultUserAccountForm,
  toUserForm,
  toUserPayload,
  type UserAccountForm as UserAccountFormModel,
  type UserBindForm,
  type UserForm,
  userFormRules
} from './form'
import { userTypeOptions } from './const'
import {
  createUserTypeLabelMap,
  downloadUserImportTemplate,
  mapCorporateUsersToBindOptions,
  resolveUserTypeLabel
} from './actions'
import {
  assertUniqueCheck,
  shouldCheckUserUnique,
  toUserUniqueSnapshot,
  type UserUniqueSnapshot
} from '../shared/unique'
import buildUserListParams from './utils/buildUserListParams'
import {
  dragHandleClass
} from './utils/dragSort'
import { useUserStatusActions } from './composables/useUserStatusActions'
import { useUserDragSort } from './composables/useUserDragSort'

defineOptions({
  name: 'UserManagementPage'
})

type BindFormExpose = CrudFormLike & {
  loadOptions?: (keyword?: string) => Promise<void>
  setSelectedUsers?: (users: UserBindOption[]) => void
}

const tableRef = ref<unknown>(null)
const searchRef = ref<{ resetFields?: () => void }>()
const editFormRef = ref<CrudFormLike>()
const accountFormRef = ref<CrudFormLike>()
const bindFormRef = ref<BindFormExpose>()
const treeRef = ref<{
  setCurrentKey?: (key?: string | null) => void
}>()
const userUniqueSnapshot = ref<UserUniqueSnapshot | null>(null)

const orgTreeData = ref<OrgTreeNode[]>([])
const positionOptions = ref<PositionItem[]>([])
const roleOptions = ref<RoleItem[]>([])

const searchForm = reactive({
  nickName: '',
  phone: '',
  userAccount: '',
  isEnable: null as boolean | null,
  mail: '',
  date: [] as string[],
  orgId: ''
})

const defaultTreeProps = {
  children: 'children',
  label: 'orgName'
}

const canDragSort = computed(() => Boolean(searchForm.orgId))
const tableColumns = computed(() => buildUserColumns(canDragSort.value))

const tableOpt = reactive({
  query: {
    api: (params: Record<string, unknown>) => userApi.page(buildUserListParams(params)),
    params: searchForm,
    pagination: true,
    immediate: false
  },
  remove: {
    api: (payload: { id: string }) => userApi.remove(payload),
    deleteConfirm: {
      nameKey: 'nickName',
      requireInput: true,
      title: '删除确认',
      message: '此操作不可逆，会删除即时消息相关记录，请输入确认删除的姓名「{name}」',
      inputPlaceholder: '请输入确认删除的姓名',
      confirmButtonText: '确认删除'
    },
    onSuccess: () => {
      message.success('删除用户成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '删除用户失败'
      message.error(errorMessage)
    }
  }
})

const crudPage = useCrudPage<UserForm, UserListRecord, UserDetailData, UserSavePayload>({
  table: tableOpt,
  tableRef,
  editor: {
    entity: {
      name: '用户'
    },
    form: {
      create: () => createDefaultUserForm(),
      ref: editFormRef
    },
    detail: {
      async beforeOpen({ mode, form }) {
        await Promise.all([loadOrgTree(), loadPositionOptions(), loadRoleOptions()])

        if (mode === 'create') {
          userUniqueSnapshot.value = null
          form.userOrgs = [
            {
              orgId: searchForm.orgId || '',
              orgRankType: null,
              ownSort: 1,
              sort: 1,
              status: 1,
              postVos: [{ postId: '', sort: 1, status: 1 }]
            }
          ]
        }
      },
      async load({ row }) {
        const response = await userApi.detail({ id: row.id })
        if (response.code !== 200) {
          throw new Error(response.message || '加载用户详情失败')
        }
        return response.data
      },
      mapToForm: ({ detail }) => {
        const mapped = toUserForm(detail)
        userUniqueSnapshot.value = toUserUniqueSnapshot(mapped)
        return mapped
      }
    },
    save: {
      buildPayload: async ({ form }) => {
        const payload = toUserPayload(form)
        const currentUnique = toUserUniqueSnapshot(payload)

        if (shouldCheckUserUnique(currentUnique, userUniqueSnapshot.value)) {
          const uniqueResponse = await userApi.checkUnique({
            userId: payload.id,
            userAccount: payload.userAccount,
            phone: payload.phone,
            mail: payload.mail
          })

          const isUnique = assertUniqueCheck(uniqueResponse, '用户唯一性校验失败')
          if (!isUnique) {
            throw new Error('登录账号、手机号或邮箱已存在')
          }
        }

        return payload
      },
      request: async ({ mode, payload }) => {
        const response = mode === 'create'
          ? await userApi.add(payload)
          : await userApi.update(payload)

        if (response.code !== 200) {
          throw new Error(response.message || '保存用户失败')
        }

        return response
      },
      onSuccess: async ({ mode }) => {
        message.success(mode === 'create' ? '新增用户成功' : '更新用户成功')
      }
    }
  }
})

const {
  loading,
  dataList,
  pagination,
  selectedList,
  onSearch,
  resetForm,
  handleSelectionChange,
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

const accountVisible = ref(false)
const accountSubmitting = ref(false)
const accountForm = reactive<UserAccountFormModel>({
  ...defaultUserAccountForm
})

const bindVisible = ref(false)
const bindLoading = ref(false)
const bindSubmitting = ref(false)
const bindTargetUserId = ref('')
const bindForm = reactive<UserBindForm>({
  userIds: []
})

const userTypeLabelMap = createUserTypeLabelMap(userTypeOptions)
const currentOrgId = computed(() => searchForm.orgId)

function sortOrgTree(nodes: OrgTreeNode[]): OrgTreeNode[] {
  return [...nodes]
    .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
    .map((item) => ({
      ...item,
      children: Array.isArray(item.children) ? sortOrgTree(item.children) : []
    }))
}

async function loadOrgTree() {
  const response = await userApi.orgList()
  if (response.code !== 200) {
    throw new Error(response.message || '加载组织树失败')
  }

  orgTreeData.value = sortOrgTree(response.data || [])
}

async function loadPositionOptions() {
  const response = await userApi.positionList()
  if (response.code !== 200) {
    throw new Error(response.message || '加载职位列表失败')
  }

  positionOptions.value = response.data || []
}

async function loadRoleOptions() {
  const response = await userApi.roleList()
  if (response.code !== 200) {
    throw new Error(response.message || '加载角色列表失败')
  }

  roleOptions.value = response.data || []
}

async function checkFieldUnique(params: {
  userId?: string
  userAccount?: string
  phone?: string
  mail?: string
}) {
  const payload: {
    userId?: string
    userAccount?: string
    phone?: string
    mail?: string
  } = {
    userId: params.userId
  }

  if (params.userAccount !== undefined) {
    payload.userAccount = toUserUniqueSnapshot({ userAccount: params.userAccount }).userAccount
  }

  if (params.phone !== undefined) {
    payload.phone = toUserUniqueSnapshot({ phone: params.phone }).phone
  }

  if (params.mail !== undefined) {
    payload.mail = toUserUniqueSnapshot({ mail: params.mail }).mail
  }

  const response = await userApi.checkUnique(payload)
  return assertUniqueCheck(response, '字段唯一性校验失败')
}

async function uploadAvatar(file: File, userId: string): Promise<boolean> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('userId', userId)

  const response = await userApi.manageEditPhoto(formData)
  if (response.code !== 200) {
    throw new Error(response.message || '头像上传失败')
  }

  return true
}

function tableSearch(keyword: string) {
  searchForm.nickName = keyword
  void onSearch()
}

function onKeywordUpdate(keyword: string) {
  searchForm.nickName = keyword
}

function onResetSearch() {
  searchForm.orgId = ''
  searchForm.date = []
  treeRef.value?.setCurrentKey?.(null)
  resetForm(searchRef, 'nickName')
}

function handleNodeClick(node: OrgTreeNode) {
  searchForm.orgId = Number(node.orgType) === 1 ? '' : node.id
  void onSearch()
}

function getUserTypeLabel(value: number): string {
  return resolveUserTypeLabel(value, userTypeLabelMap)
}

async function handleDelete(row: UserListRecord) {
  await remove(row)
}

const {
  handleSingleStatus,
  handleBatchStatus,
  handleResetPassword
} = useUserStatusActions({
  selectedList,
  onSearch
})

function resetAccountForm() {
  Object.assign(accountForm, defaultUserAccountForm)
}

function openAccountDialog(row: UserListRecord) {
  resetAccountForm()
  accountForm.userId = row.id
  accountForm.nickName = row.nickName
  accountForm.phone = row.phone
  accountForm.userAccount = row.userAccount
  accountForm.newUsername = row.userAccount
  accountVisible.value = true
}

function closeAccountDialog() {
  resetAccountForm()
  accountVisible.value = false
}

async function submitAccountDialog() {
  if (accountSubmitting.value) return

  const isValid = await accountFormRef.value?.validate?.()
  if (isValid === false) return

  if (accountForm.isReset === 1 && accountForm.newPassword !== accountForm.newPasswordRepeat) {
    message.error('两次密码输入不一致')
    return
  }

  accountSubmitting.value = true
  try {
    const response = await userApi.changeUserAccount({
      userId: sm4EncryptBase64(accountForm.userId),
      newUsername: sm4EncryptBase64(accountForm.newUsername),
      isReset: accountForm.isReset,
      newPassword: accountForm.isReset === 1 && accountForm.newPassword
        ? sm4EncryptBase64(accountForm.newPassword)
        : ''
    })

    if (response.code !== 200) {
      throw new Error(response.message || '修改账号失败')
    }

    message.success('修改账号成功')
    closeAccountDialog()
    await onSearch(false)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '修改账号失败'
    message.error(errorMessage)
  } finally {
    accountSubmitting.value = false
  }
}

function resetBindForm() {
  bindForm.userIds = []
}

async function fetchBindUsers(keyword: string): Promise<UserBindOption[]> {
  const response = await userApi.searchUsers({ nickName: keyword })
  if (response.code !== 200) {
    throw new Error(response.message || '加载用户列表失败')
  }

  return (response.data || []).map((item) => ({
    id: item.id,
    nickName: item.nickName,
    userAccount: item.userAccount,
    phone: item.phone
  }))
}

async function openBindDialog(row: UserListRecord) {
  bindTargetUserId.value = row.id
  bindVisible.value = true
  bindLoading.value = true
  resetBindForm()

  try {
    const response = await userApi.detail({ id: row.id })
    if (response.code !== 200) {
      throw new Error(response.message || '加载关联账号失败')
    }

    const users = mapCorporateUsersToBindOptions(response.data.corporateUserList)

    bindForm.userIds = users.map((item) => item.id).filter(Boolean)

    await nextTick()
    bindFormRef.value?.setSelectedUsers?.(users)
    await bindFormRef.value?.loadOptions?.('')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '加载关联账号失败'
    message.error(errorMessage)
  } finally {
    bindLoading.value = false
  }
}

function closeBindDialog() {
  resetBindForm()
  bindVisible.value = false
  bindTargetUserId.value = ''
}

async function submitBindDialog() {
  if (bindSubmitting.value) return

  const isValid = await bindFormRef.value?.validate?.()
  if (isValid === false) return

  bindSubmitting.value = true
  try {
    const response = await userApi.updateCorporateUser({
      corporateUserId: bindTargetUserId.value,
      userIds: bindForm.userIds
    })

    if (response.code !== 200) {
      throw new Error(response.message || '关联账号保存失败')
    }

    message.success('关联账号保存成功')
    closeBindDialog()
    await onSearch(false)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '关联账号保存失败'
    message.error(errorMessage)
  } finally {
    bindSubmitting.value = false
  }
}

function downloadTemplate() {
  downloadUserImportTemplate()
}

async function importRequest(file: File) {
  return userApi.importUser(file)
}

async function handleImportUploaded() {
  await onSearch(false)
}

useUserDragSort({
  tableRef,
  canDragSort,
  dataList,
  orgId: currentOrgId,
  pagination,
  onSearch
})

onMounted(async () => {
  try {
    await Promise.all([loadOrgTree(), loadPositionOptions(), loadRoleOptions()])
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '初始化用户管理失败'
    message.error(errorMessage)
  }

  await onSearch(false)
})
</script>

<template>
  <PageContainer padding="0" overflow="hidden" left-width="216px">
    <template #left>
      <div class="user-management-page__tree">
        <ObTree
          ref="treeRef"
          node-key="id"
          :data="orgTreeData"
          :tree-props="defaultTreeProps"
          highlight-current
          @node-click="handleNodeClick"
        />
      </div>
    </template>

    <OneTableBar
      title="用户管理"
      :columns="tableColumns"
      placeholder="请输入用户名查询"
      :keyword="searchForm.nickName"
      @search="tableSearch"
      @update:keyword="onKeywordUpdate"
      @reset-form="onResetSearch"
    >
      <template #buttons>
        <el-button :icon="Download" @click="downloadTemplate">模板下载</el-button>

        <ObImportUpload
          :request="importRequest"
          :disabled="loading"
          :button-icon="Upload"
          button-text="导入"
          @uploaded="handleImportUploaded"
        />

        <el-button :icon="Unlock" @click="handleBatchStatus(true)">批量启用</el-button>
        <el-button :icon="Lock" @click="handleBatchStatus(false)">批量停用</el-button>
        <el-button type="primary" :icon="Plus" @click="crud.openCreate()">新增</el-button>
      </template>

      <template #default="{ size, dynamicColumns }">
        <ObVxeTable
          ref="tableRef"
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
          <template #dragHandle>
            <el-icon :class="dragHandleClass"><Rank /></el-icon>
          </template>

          <template #nickName="{ row }">
            <div class="user-management-page__name-cell">
              <span>{{ row.nickName }}</span>
              <el-tag v-if="row.isExternal" size="small" type="warning">外部</el-tag>
            </div>
          </template>

          <template #gender="{ row }">
            {{ Number(row.gender) === 0 ? '女' : '男' }}
          </template>

          <template #status="{ row }">
            <el-tag :type="row.isEnable ? 'success' : 'danger'">{{ row.isEnable ? '启用' : '停用' }}</el-tag>
          </template>

          <template #userType="{ row }">
            {{ getUserTypeLabel(Number(row.userType)) }}
          </template>

          <template #operation="{ row, size: actionSize }">
            <div class="user-management-page__actions">
              <ObActionButtons>
                <el-button link type="primary" :size="actionSize" @click="crud.openEdit(row)">编辑</el-button>
                <el-button link type="primary" :size="actionSize" @click="crud.openDetail(row)">查看</el-button>
                <el-button link type="primary" :size="actionSize" @click="handleSingleStatus(row)">
                  {{ row.isEnable ? '停用' : '启用' }}
                </el-button>
                <el-button link type="primary" :size="actionSize" @click="openAccountDialog(row)">修改账号</el-button>
                <el-button link type="primary" :size="actionSize" @click="handleResetPassword(row)">重置密码</el-button>
                <el-button v-if="Number(row.userType) === 1" link type="primary" :size="actionSize" @click="openBindDialog(row)">
                  关联账号
                </el-button>
                <el-button link type="danger" :size="actionSize" @click="handleDelete(row)">删除</el-button>
              </ObActionButtons>
            </div>
          </template>
        </ObVxeTable>
      </template>

      <template #drawer>
        <UserSearchForm ref="searchRef" v-model="searchForm" />
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
    :drawer-size="920"
    @confirm="crud.confirm"
    @cancel="crud.close"
    @close="crud.close"
  >
    <UserEditForm
      ref="editFormRef"
      v-model="crudForm"
      :mode="crudMode"
      :rules="userFormRules"
      :disabled="crudReadonly"
      :org-tree-options="orgTreeData"
      :position-options="positionOptions"
      :role-options="roleOptions"
      :check-unique="checkFieldUnique"
      :upload-avatar="uploadAvatar"
    />
  </ObCrudContainer>

  <ObCrudContainer
    v-model="accountVisible"
    container="drawer"
    mode="edit"
    title="登录账号"
    :loading="accountSubmitting"
    :drawer-size="420"
    @confirm="submitAccountDialog"
    @cancel="closeAccountDialog"
    @close="closeAccountDialog"
  >
    <UserAccountForm
      ref="accountFormRef"
      v-model="accountForm"
      :disabled="false"
      :check-user-account-unique="async ({ userId, userAccount }) => checkFieldUnique({ userId, userAccount })"
    />
  </ObCrudContainer>

  <ObCrudContainer
    v-model="bindVisible"
    container="drawer"
    mode="edit"
    title="关联账号"
    :loading="bindSubmitting || bindLoading"
    :drawer-size="680"
    @confirm="submitBindDialog"
    @cancel="closeBindDialog"
    @close="closeBindDialog"
  >
    <UserBindAccountForm
      ref="bindFormRef"
      v-model="bindForm"
      :disabled="bindLoading"
      :fetch-users="fetchBindUsers"
    />
  </ObCrudContainer>
</template>

<style scoped>
.user-management-page__tree {
  height: 100%;
  border-right: 1px solid var(--el-border-color-light);
  overflow: auto;
  padding-right: 16px;
}

.user-management-page__tree :deep(.ob-tree) {
  min-height: 100%;
  padding: 16px 12px;
}

.user-management-page__tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
  color: var(--one-color-primary);
  background: var(--one-color-primary-light-100);
}

.user-management-page__tree :deep(.el-tree-node__content) {
  min-height: 32px;
  line-height: 32px;
}

.user-management-page__name-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.user-management-page__actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.user-drag-handle {
  color: var(--el-text-color-secondary);
  cursor: move;
}

.user-drag-handle:hover {
  color: var(--el-text-color-primary);
}
</style>
