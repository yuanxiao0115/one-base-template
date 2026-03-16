<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { UserFilled } from '@element-plus/icons-vue';
import { useAuthStore } from '@one-base-template/core';
import { openPersonnelSelection } from '@/components/PersonnelSelector';
import type {
  PersonnelFetchNodes,
  PersonnelNode,
  PersonnelSearchNodes,
  PersonnelSelectedUser
} from '@/components/PersonnelSelector/types';
import { portalAuthorityApi } from '../../api';
import type { PortalTab } from '../../types';

interface RoleOption {
  id: string;
  name: string;
}

interface PermissionGroupPayload {
  roleIds: string[];
  userIds: string[];
}

interface PagePermissionPayload {
  authType: 'person' | 'role';
  allowPerms: PermissionGroupPayload;
  forbiddenPerms: PermissionGroupPayload;
  configPerms: PermissionGroupPayload;
}

interface SelectedUserLite {
  id: string;
  nickName: string;
}

type UserField = 'allow' | 'forbidden' | 'config';

interface AuthUserWithCompanyId {
  companyId?: number | string | null;
}

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    embedded?: boolean;
    loading?: boolean;
    initial?: Partial<PortalTab>;
  }>(),
  {
    modelValue: false,
    embedded: false,
    loading: false,
    initial: () => ({})
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'submit', payload: PagePermissionPayload): void;
}>();

defineOptions({
  name: 'PagePermissionDialog'
});

const visible = computed({
  get: () => (props.embedded ? true : Boolean(props.modelValue)),
  set: (value: boolean) => {
    if (props.embedded) {
      return;
    }
    emit('update:modelValue', value);
  }
});

const form = reactive({
  authType: 'person' as 'person' | 'role',
  allowRoleIds: [] as string[],
  forbiddenRoleIds: [] as string[],
  configRoleIds: [] as string[],
  allowUsers: [] as SelectedUserLite[],
  forbiddenUsers: [] as SelectedUserLite[],
  configUsers: [] as SelectedUserLite[]
});

const roleOptions = ref<RoleOption[]>([]);
const roleLoading = ref(false);
const pickingField = ref<UserField | ''>('');
const authStore = useAuthStore();

const personDisplay = computed(() => ({
  allow: formatUserNames(form.allowUsers),
  forbidden: formatUserNames(form.forbiddenUsers),
  config: formatUserNames(form.configUsers)
}));

watch(
  () => visible.value,
  (opened) => {
    if (props.embedded || !opened) {
      return;
    }
    hydrateFromInitial(props.initial);
    void ensureRoleOptions();
  }
);

watch(
  () => props.initial,
  (nextInitial) => {
    if (!props.embedded) {
      return;
    }
    hydrateFromInitial(nextInitial);
    void ensureRoleOptions();
  },
  {
    immediate: true
  }
);

function normalizeIdLike(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return '';
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function formatUserNames(users: SelectedUserLite[]): string {
  if (!Array.isArray(users) || users.length === 0) {
    return '';
  }
  return users.map((item) => item.nickName || item.id).join(', ');
}

const rootParentId = computed(() => {
  const user = authStore.user as AuthUserWithCompanyId | null;
  const companyId = normalizeIdLike(user?.companyId);
  return companyId || '0';
});

function normalizeRoleIds(value: unknown): string[] {
  if (!value || typeof value !== 'object') {
    return [];
  }
  const obj = value as Record<string, unknown>;
  const roleIdsRaw = Array.isArray(obj.roleIds) ? obj.roleIds : [];
  const roleListRaw = Array.isArray(obj.roleList) ? obj.roleList : [];
  const fromIds = roleIdsRaw.map(normalizeIdLike).filter(Boolean);
  const fromList = roleListRaw
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return '';
      }
      const row = item as Record<string, unknown>;
      return normalizeIdLike(row.id) || normalizeIdLike(row.roleId);
    })
    .filter(Boolean);
  return Array.from(new Set([...fromIds, ...fromList]));
}

function normalizeUsersFromUnknown(value: unknown, fallbackIds?: unknown): SelectedUserLite[] {
  const fromUserList = Array.isArray(value)
    ? value
        .map((item) => {
          if (!item || typeof item !== 'object') {
            return null;
          }
          const row = item as Record<string, unknown>;
          const id = normalizeIdLike(row.id) || normalizeIdLike(row.userId);
          if (!id) {
            return null;
          }
          const nickName =
            normalizeString(row.nickName) ||
            normalizeString(row.name) ||
            normalizeString(row.title) ||
            id;
          return { id, nickName };
        })
        .filter((item): item is SelectedUserLite => Boolean(item))
    : [];
  if (fromUserList.length > 0) {
    return fromUserList;
  }
  if (!Array.isArray(fallbackIds)) {
    return [];
  }
  return fallbackIds
    .map((item) => {
      const id = normalizeIdLike(item);
      if (!id) {
        return null;
      }
      return {
        id,
        nickName: id
      };
    })
    .filter((item): item is SelectedUserLite => Boolean(item));
}

function normalizePermissionGroup(value: unknown): {
  roleIds: string[];
  users: SelectedUserLite[];
} {
  if (!value || typeof value !== 'object') {
    return { roleIds: [], users: [] };
  }
  const obj = value as Record<string, unknown>;
  return {
    roleIds: normalizeRoleIds(obj),
    users: normalizeUsersFromUnknown(obj.userList, obj.userIds)
  };
}

function hydrateFromInitial(initial: Partial<PortalTab> | undefined) {
  const payload = (initial || {}) as Record<string, unknown>;
  form.authType = payload.authType === 'role' ? 'role' : 'person';

  const allow = normalizePermissionGroup(payload.allowPerms);
  const forbidden = normalizePermissionGroup(payload.forbiddenPerms);
  const config = normalizePermissionGroup(payload.configPerms);

  form.allowRoleIds = allow.roleIds;
  form.forbiddenRoleIds = forbidden.roleIds;
  form.configRoleIds = config.roleIds;

  form.allowUsers = allow.users;
  form.forbiddenUsers = forbidden.users;
  form.configUsers = config.users;
}

function toPersonnelNode(row: Record<string, unknown>): PersonnelNode | null {
  const id = normalizeIdLike(row.id);
  if (!id) {
    return null;
  }
  const nodeTypeRaw = normalizeString(row.nodeType);
  const hasUser = Boolean(normalizeIdLike(row.userId)) || Boolean(normalizeString(row.nickName));
  const nodeType =
    nodeTypeRaw === 'org' || nodeTypeRaw === 'user' ? nodeTypeRaw : hasUser ? 'user' : 'org';
  const parentId = normalizeIdLike(row.parentId) || '0';
  const companyId = normalizeIdLike(row.companyId) || '0';
  const title =
    normalizeString(row.title) ||
    normalizeString(row.orgName) ||
    normalizeString(row.nickName) ||
    normalizeString(row.userAccount) ||
    id;

  if (nodeType === 'org') {
    return {
      id,
      parentId,
      companyId,
      title,
      orgName: normalizeString(row.orgName) || title,
      orgType: typeof row.orgType === 'number' ? row.orgType : 0,
      nodeType: 'org'
    };
  }

  return {
    id,
    parentId,
    companyId,
    title,
    userId: normalizeIdLike(row.userId) || id,
    nickName: normalizeString(row.nickName) || title,
    userAccount: normalizeString(row.userAccount),
    phone: normalizeString(row.phone),
    nodeType: 'user'
  };
}

const fetchNodes: PersonnelFetchNodes = async ({ parentId }) => {
  const normalizedParentId = normalizeIdLike(parentId);
  const requestParentId =
    !normalizedParentId || normalizedParentId === '0' ? rootParentId.value : normalizedParentId;
  const res = await portalAuthorityApi.getOrgContactsLazy({
    parentId: requestParentId
  });
  const rows = Array.isArray(res?.data) ? res.data : [];
  return rows
    .map((item) =>
      item && typeof item === 'object' ? toPersonnelNode(item as Record<string, unknown>) : null
    )
    .filter((item): item is PersonnelNode => Boolean(item));
};

const searchNodes: PersonnelSearchNodes = async ({ keyword }) => {
  const res = await portalAuthorityApi.searchContactUsers({
    search: keyword
  });
  const rows = Array.isArray(res?.data) ? res.data : [];
  return rows
    .map((item) =>
      item && typeof item === 'object' ? toPersonnelNode(item as Record<string, unknown>) : null
    )
    .filter((item): item is PersonnelNode => Boolean(item && item.nodeType === 'user'));
};

async function ensureRoleOptions() {
  if (roleOptions.value.length > 0 || roleLoading.value) {
    return;
  }

  roleLoading.value = true;
  try {
    const listRes = await portalAuthorityApi.listRoles();
    const rows = Array.isArray(listRes?.data) ? listRes.data : [];
    roleOptions.value = rows
      .map((item) => {
        const id = normalizeIdLike(item?.id);
        if (!id) {
          return null;
        }
        const name = normalizeString(item?.name) || normalizeString(item?.roleName) || id;
        return { id, name };
      })
      .filter((item): item is RoleOption => Boolean(item));
    if (roleOptions.value.length > 0) {
      return;
    }
  } catch {
    // 这里降级到分页接口，避免部分环境缺失 get-list 时无角色数据。
  } finally {
    roleLoading.value = false;
  }

  roleLoading.value = true;
  try {
    const pageRes = await portalAuthorityApi.pageRoles({
      currentPage: 1,
      pageSize: 500
    });
    const records = Array.isArray(pageRes?.data?.records) ? pageRes.data.records : [];
    roleOptions.value = records
      .map((item) => {
        const id = normalizeIdLike(item?.id);
        if (!id) {
          return null;
        }
        const name = normalizeString(item?.name) || normalizeString(item?.roleName) || id;
        return { id, name };
      })
      .filter((item): item is RoleOption => Boolean(item));
  } finally {
    roleLoading.value = false;
  }
}

function getUsersByField(field: UserField): SelectedUserLite[] {
  if (field === 'allow') {
    return form.allowUsers;
  }
  if (field === 'forbidden') {
    return form.forbiddenUsers;
  }
  return form.configUsers;
}

function setUsersByField(field: UserField, users: SelectedUserLite[]) {
  if (field === 'allow') {
    form.allowUsers = users;
    return;
  }
  if (field === 'forbidden') {
    form.forbiddenUsers = users;
    return;
  }
  form.configUsers = users;
}

async function pickUsers(field: UserField) {
  if (pickingField.value) {
    return;
  }
  pickingField.value = field;
  try {
    const current = getUsersByField(field);
    const result = await openPersonnelSelection({
      title: '选择人员',
      mode: 'person',
      required: false,
      users: current.map((item) => ({
        id: item.id,
        nickName: item.nickName
      })),
      model: {
        userIds: current.map((item) => item.id)
      },
      fetchNodes,
      searchNodes
    }).catch(() => null);

    if (!result) {
      return;
    }

    const users = (Array.isArray(result.users) ? result.users : [])
      .map((item: PersonnelSelectedUser) => {
        const id = normalizeIdLike(item.id);
        if (!id) {
          return null;
        }
        return {
          id,
          nickName: item.nickName || item.title || id
        };
      })
      .filter((item): item is SelectedUserLite => Boolean(item));
    setUsersByField(field, users);
  } finally {
    pickingField.value = '';
  }
}

function onCancel() {
  if (props.embedded) {
    return;
  }
  visible.value = false;
}

function onSubmit() {
  if (form.authType === 'role') {
    emit('submit', {
      authType: 'role',
      allowPerms: { roleIds: [...form.allowRoleIds], userIds: [] },
      forbiddenPerms: { roleIds: [...form.forbiddenRoleIds], userIds: [] },
      configPerms: { roleIds: [...form.configRoleIds], userIds: [] }
    });
    return;
  }

  emit('submit', {
    authType: 'person',
    allowPerms: { roleIds: [], userIds: form.allowUsers.map((item) => item.id) },
    forbiddenPerms: { roleIds: [], userIds: form.forbiddenUsers.map((item) => item.id) },
    configPerms: { roleIds: [], userIds: form.configUsers.map((item) => item.id) }
  });
}
</script>

<template>
  <template v-if="props.embedded">
    <div class="permission-panel permission-panel--embedded">
      <el-form label-position="left" label-width="96px" class="permission-form">
        <el-form-item label="授权类型">
          <el-radio-group v-model="form.authType" class="auth-type-toggle">
            <el-radio value="person">人员</el-radio>
            <el-radio value="role">角色</el-radio>
          </el-radio-group>
        </el-form-item>

        <template v-if="form.authType === 'role'">
          <el-form-item label="可访问角色">
            <el-select
              v-model="form.allowRoleIds"
              multiple
              collapse-tags
              collapse-tags-tooltip
              filterable
              :loading="roleLoading"
              placeholder="请选择"
              class="permission-role-select"
            >
              <el-option
                v-for="role in roleOptions"
                :key="role.id"
                :label="role.name"
                :value="role.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="不可访问角色">
            <el-select
              v-model="form.forbiddenRoleIds"
              multiple
              collapse-tags
              collapse-tags-tooltip
              filterable
              :loading="roleLoading"
              placeholder="请选择"
              class="permission-role-select"
            >
              <el-option
                v-for="role in roleOptions"
                :key="role.id"
                :label="role.name"
                :value="role.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="可维护角色">
            <el-select
              v-model="form.configRoleIds"
              multiple
              collapse-tags
              collapse-tags-tooltip
              filterable
              :loading="roleLoading"
              placeholder="请选择"
              class="permission-role-select"
            >
              <el-option
                v-for="role in roleOptions"
                :key="role.id"
                :label="role.name"
                :value="role.id"
              />
            </el-select>
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="可访问者">
            <el-input
              :model-value="personDisplay.allow"
              readonly
              placeholder="请选择"
              @click="pickUsers('allow')"
              class="permission-user-input"
            >
              <template #append>
                <el-button
                  class="picker-trigger"
                  :icon="UserFilled"
                  :loading="pickingField === 'allow'"
                  @click="pickUsers('allow')"
                />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="不可访问者">
            <el-input
              :model-value="personDisplay.forbidden"
              readonly
              placeholder="请选择"
              @click="pickUsers('forbidden')"
              class="permission-user-input"
            >
              <template #append>
                <el-button
                  class="picker-trigger"
                  :icon="UserFilled"
                  :loading="pickingField === 'forbidden'"
                  @click="pickUsers('forbidden')"
                />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="可维护人员">
            <el-input
              :model-value="personDisplay.config"
              readonly
              placeholder="请选择"
              @click="pickUsers('config')"
              class="permission-user-input"
            >
              <template #append>
                <el-button
                  class="picker-trigger"
                  :icon="UserFilled"
                  :loading="pickingField === 'config'"
                  @click="pickUsers('config')"
                />
              </template>
            </el-input>
          </el-form-item>
        </template>
      </el-form>

      <div class="footer footer--embedded">
        <el-button type="primary" class="submit-btn" :loading="props.loading" @click="onSubmit">
          保存页面权限
        </el-button>
      </div>
    </div>
  </template>

  <el-dialog
    v-else
    v-model="visible"
    title="页面权限"
    width="720px"
    :close-on-click-modal="false"
    destroy-on-close
    class="permission-dialog"
  >
    <el-form label-position="left" label-width="96px" class="permission-form">
      <el-form-item label="授权类型">
        <el-radio-group v-model="form.authType" class="auth-type-toggle">
          <el-radio value="person">人员</el-radio>
          <el-radio value="role">角色</el-radio>
        </el-radio-group>
      </el-form-item>

      <template v-if="form.authType === 'role'">
        <el-form-item label="可访问角色">
          <el-select
            v-model="form.allowRoleIds"
            multiple
            collapse-tags
            collapse-tags-tooltip
            filterable
            :loading="roleLoading"
            placeholder="请选择"
            class="permission-role-select"
          >
            <el-option
              v-for="role in roleOptions"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="不可访问角色">
          <el-select
            v-model="form.forbiddenRoleIds"
            multiple
            collapse-tags
            collapse-tags-tooltip
            filterable
            :loading="roleLoading"
            placeholder="请选择"
            class="permission-role-select"
          >
            <el-option
              v-for="role in roleOptions"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="可维护角色">
          <el-select
            v-model="form.configRoleIds"
            multiple
            collapse-tags
            collapse-tags-tooltip
            filterable
            :loading="roleLoading"
            placeholder="请选择"
            class="permission-role-select"
          >
            <el-option
              v-for="role in roleOptions"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
      </template>

      <template v-else>
        <el-form-item label="可访问者">
          <el-input
            :model-value="personDisplay.allow"
            readonly
            placeholder="请选择"
            @click="pickUsers('allow')"
            class="permission-user-input"
          >
            <template #append>
              <el-button
                class="picker-trigger"
                :icon="UserFilled"
                :loading="pickingField === 'allow'"
                @click="pickUsers('allow')"
              />
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="不可访问者">
          <el-input
            :model-value="personDisplay.forbidden"
            readonly
            placeholder="请选择"
            @click="pickUsers('forbidden')"
            class="permission-user-input"
          >
            <template #append>
              <el-button
                class="picker-trigger"
                :icon="UserFilled"
                :loading="pickingField === 'forbidden'"
                @click="pickUsers('forbidden')"
              />
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="可维护人员">
          <el-input
            :model-value="personDisplay.config"
            readonly
            placeholder="请选择"
            @click="pickUsers('config')"
            class="permission-user-input"
          >
            <template #append>
              <el-button
                class="picker-trigger"
                :icon="UserFilled"
                :loading="pickingField === 'config'"
                @click="pickUsers('config')"
              />
            </template>
          </el-input>
        </el-form-item>
      </template>
    </el-form>

    <template #footer>
      <div class="footer">
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" class="submit-btn" :loading="props.loading" @click="onSubmit"
          >保存</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.permission-panel {
  --surface-border: #dbe4ef;
  --surface-bg: #fff;
}

.permission-panel--embedded {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  border: none;
  border-radius: 0;
  background: transparent;
  padding: 0;
}

.permission-form :deep(.el-form-item) {
  margin-bottom: 8px;
}

.permission-form :deep(.el-form-item__label) {
  color: #334155;
  font-weight: 500;
  font-size: 13px;
  padding-right: 8px;
}

.permission-form :deep(.el-form-item__content) {
  min-height: 32px;
}

.auth-type-toggle :deep(.el-radio__label) {
  color: #334155;
}

.auth-type-toggle :deep(.el-radio__input.is-checked + .el-radio__label) {
  color: var(--el-color-primary);
  font-weight: 600;
}

.permission-role-select,
.permission-user-input {
  width: 100%;
}

.permission-role-select :deep(.el-select__wrapper),
.permission-user-input :deep(.el-input__wrapper) {
  border-radius: 3px;
  box-shadow: 0 0 0 1px var(--surface-border) inset;
  background: #fff;
  min-height: 32px;
}

.permission-role-select :deep(.el-select__wrapper.is-focused),
.permission-user-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset;
}

.permission-user-input :deep(.el-input-group__append) {
  border-radius: 0 3px 3px 0;
  padding: 0;
  border-left: 1px solid #dbe4ef;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  min-width: 34px;
  overflow: hidden;
}

.picker-trigger {
  border: none;
  border-radius: 0;
  width: 100%;
  min-width: 0;
  height: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  line-height: 1;
  color: var(--el-color-primary);
  background: transparent;
}

.permission-user-input :deep(.el-input-group__append .el-button .el-icon) {
  margin: 0;
  font-size: 15px;
  line-height: 1;
}

.footer {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.footer--embedded {
  margin-top: auto;
  padding-top: 8px;
  border-top: none;
}

.submit-btn {
  min-width: 98px;
}

:deep(.permission-dialog .el-dialog__body) {
  padding-top: 10px;
  padding-bottom: 12px;
  background: #fff;
}

:deep(.permission-dialog .el-dialog__header) {
  border-bottom: 1px solid #dbe4ef;
}

:deep(.permission-dialog .el-dialog__footer) {
  border-top: 1px solid #dbe4ef;
  padding-top: 10px;
}

@media (max-width: 960px) {
  .permission-panel--embedded {
    border-radius: 0;
    padding: 0;
  }

  .permission-form :deep(.el-form-item__label) {
    width: 88px !important;
  }
}
</style>
