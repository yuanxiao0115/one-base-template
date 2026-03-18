<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { UserFilled } from '@element-plus/icons-vue';
import { useAuthStore } from '@one-base-template/core';
import { openPersonnelSelection } from '@/components/PersonnelSelector';
import type { PersonnelSelectedUser } from '@/components/PersonnelSelector/types';

import { portalAuthorityApi } from '../../api';
import type { PortalTemplate } from '../../types';
import { createPermissionMemberSource } from './permission/permission-member-source';
import {
  buildTemplateAuthorityPayload,
  normalizeAuthorityUsers,
  normalizeEditUsers,
  normalizeRoleIds,
  type AuthorityUserItem,
  type TemplateAuthorityPayload
} from './permission/permission-payload';
import { loadPermissionRoleOptions, type RoleOption } from './permission/permission-role-source';

type UserField = 'white' | 'black' | 'edit';

interface AuthUserWithCompanyId {
  companyId?: number | string | null;
}

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    embedded?: boolean;
    loading?: boolean;
    initial?: Partial<PortalTemplate>;
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
  (e: 'submit', payload: TemplateAuthorityPayload): void;
}>();

defineOptions({
  name: 'PortalAuthorityDialog'
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
  whiteUsers: [] as AuthorityUserItem[],
  blackUsers: [] as AuthorityUserItem[],
  editUsers: [] as AuthorityUserItem[],
  allowRoleIds: [] as string[],
  forbiddenRoleIds: [] as string[],
  configRoleIds: [] as string[]
});

const roleOptions = ref<RoleOption[]>([]);
const roleLoading = ref(false);
const pickingField = ref<UserField | ''>('');
const authStore = useAuthStore();

const personDisplay = computed(() => ({
  white: formatUserNames(form.whiteUsers),
  black: formatUserNames(form.blackUsers),
  edit: formatUserNames(form.editUsers)
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

const rootParentId = computed(() => {
  const user = authStore.user as AuthUserWithCompanyId | null;
  const companyId = normalizeIdLike(user?.companyId);
  return companyId || '0';
});

const { fetchNodes, searchNodes } = createPermissionMemberSource({
  api: portalAuthorityApi,
  resolveRootParentId: () => rootParentId.value
});

function hydrateFromInitial(initial: Partial<PortalTemplate> | undefined) {
  const payload = (initial || {}) as Record<string, unknown>;
  const authType = payload.authType === 'role' ? 'role' : 'person';

  form.authType = authType;
  form.whiteUsers = normalizeAuthorityUsers(payload.whiteDTOS ?? payload.whiteList);
  form.blackUsers = normalizeAuthorityUsers(payload.blackDTOS ?? payload.blackList);
  form.editUsers = normalizeEditUsers(payload.editUsers, payload.userIds);
  form.allowRoleIds = normalizeRoleIds(payload.allowRole);
  form.forbiddenRoleIds = normalizeRoleIds(payload.forbiddenRole);
  form.configRoleIds = normalizeRoleIds(payload.configRole);
}

function formatUserNames(list: AuthorityUserItem[]): string {
  if (!Array.isArray(list) || list.length === 0) {
    return '';
  }
  return list.map((item) => item.typeName || item.typeId).join(', ');
}

async function ensureRoleOptions() {
  if (roleOptions.value.length > 0 || roleLoading.value) {
    return;
  }

  roleLoading.value = true;
  try {
    roleOptions.value = await loadPermissionRoleOptions(portalAuthorityApi);
  } finally {
    roleLoading.value = false;
  }
}

function getUsersByField(field: UserField): AuthorityUserItem[] {
  if (field === 'white') {
    return form.whiteUsers;
  }
  if (field === 'black') {
    return form.blackUsers;
  }
  return form.editUsers;
}

function setUsersByField(field: UserField, users: AuthorityUserItem[]) {
  if (field === 'white') {
    form.whiteUsers = users;
    return;
  }
  if (field === 'black') {
    form.blackUsers = users;
    return;
  }
  form.editUsers = users;
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
        id: item.typeId,
        nickName: item.typeName
      })),
      model: {
        userIds: current.map((item) => item.typeId)
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
          typeId: id,
          type: 0,
          typeName: item.nickName || item.title || id
        };
      })
      .filter((item): item is AuthorityUserItem => Boolean(item));
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
  emit('submit', buildTemplateAuthorityPayload(form));
}
</script>
<template>
  <template v-if="props.embedded">
    <div class="authority-panel authority-panel--embedded">
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
          <el-form-item label="可访问人员">
            <el-input
              :model-value="personDisplay.white"
              readonly
              placeholder="请选择"
              @click="pickUsers('white')"
              class="permission-user-input"
            >
              <template #append>
                <el-button
                  class="picker-trigger"
                  :icon="UserFilled"
                  :loading="pickingField === 'white'"
                  @click="pickUsers('white')"
                />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="不可访问人员">
            <el-input
              :model-value="personDisplay.black"
              readonly
              placeholder="请选择"
              @click="pickUsers('black')"
              class="permission-user-input"
            >
              <template #append>
                <el-button
                  class="picker-trigger"
                  :icon="UserFilled"
                  :loading="pickingField === 'black'"
                  @click="pickUsers('black')"
                />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="可维护人员">
            <el-input
              :model-value="personDisplay.edit"
              readonly
              placeholder="请选择"
              @click="pickUsers('edit')"
              class="permission-user-input"
            >
              <template #append>
                <el-button
                  class="picker-trigger"
                  :icon="UserFilled"
                  :loading="pickingField === 'edit'"
                  @click="pickUsers('edit')"
                />
              </template>
            </el-input>
          </el-form-item>
        </template>
      </el-form>

      <div class="footer footer--embedded">
        <el-button type="primary" class="submit-btn" :loading="props.loading" @click="onSubmit">
          保存门户权限
        </el-button>
      </div>
    </div>
  </template>

  <el-dialog
    v-else
    v-model="visible"
    title="门户权限"
    width="720px"
    :close-on-click-modal="false"
    destroy-on-close
    class="authority-dialog"
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
        <el-form-item label="可访问人员">
          <el-input
            :model-value="personDisplay.white"
            readonly
            placeholder="请选择"
            @click="pickUsers('white')"
            class="permission-user-input"
          >
            <template #append>
              <el-button
                class="picker-trigger"
                :icon="UserFilled"
                :loading="pickingField === 'white'"
                @click="pickUsers('white')"
              />
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="不可访问人员">
          <el-input
            :model-value="personDisplay.black"
            readonly
            placeholder="请选择"
            @click="pickUsers('black')"
            class="permission-user-input"
          >
            <template #append>
              <el-button
                class="picker-trigger"
                :icon="UserFilled"
                :loading="pickingField === 'black'"
                @click="pickUsers('black')"
              />
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="可维护人员">
          <el-input
            :model-value="personDisplay.edit"
            readonly
            placeholder="请选择"
            @click="pickUsers('edit')"
            class="permission-user-input"
          >
            <template #append>
              <el-button
                class="picker-trigger"
                :icon="UserFilled"
                :loading="pickingField === 'edit'"
                @click="pickUsers('edit')"
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
.authority-panel {
  --surface-border: #dbe4ef;
  --surface-bg: #fff;
}

.authority-panel--embedded {
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

:deep(.authority-dialog .el-dialog__body) {
  padding-top: 10px;
  padding-bottom: 12px;
  background: #fff;
}

:deep(.authority-dialog .el-dialog__header) {
  border-bottom: 1px solid #dbe4ef;
}

:deep(.authority-dialog .el-dialog__footer) {
  border-top: 1px solid #dbe4ef;
  padding-top: 10px;
}

@media (max-width: 960px) {
  .authority-panel--embedded {
    border-radius: 0;
    padding: 0;
  }

  .permission-form :deep(.el-form-item__label) {
    width: 88px !important;
  }
}
</style>
