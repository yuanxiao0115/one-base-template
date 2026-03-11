<script setup lang="ts">
  import { computed, reactive, ref, watch } from "vue";
  import { UserFilled } from "@element-plus/icons-vue";
  import { openPersonnelSelection } from "@/components/PersonnelSelector";
  import type {
    PersonnelFetchNodes,
    PersonnelNode,
    PersonnelSearchNodes,
    PersonnelSelectedUser,
  } from "@/components/PersonnelSelector/types";
  import { portalAuthorityApi } from "../../api";
  import type { PortalTemplate } from "../../types";

  interface AuthorityUserItem {
    typeId: string;
    type: number;
    typeName: string;
  }

  interface RoleOption {
    id: string;
    name: string;
  }

  interface TemplateAuthorityPayload {
    authType: "person" | "role";
    whiteDTOS: AuthorityUserItem[];
    blackDTOS: AuthorityUserItem[];
    userIds: string[];
    whiteList: AuthorityUserItem[];
    blackList: AuthorityUserItem[];
    editUsers: AuthorityUserItem[];
    allowRole: { roleIds: string[] };
    forbiddenRole: { roleIds: string[] };
    configRole: { roleIds: string[] };
  }

  type UserField = "white" | "black" | "edit";

  const props = defineProps<{
    modelValue: boolean;
    loading?: boolean;
    initial?: Partial<PortalTemplate>;
  }>();

  const emit = defineEmits<{
    (e: "update:modelValue", value: boolean): void;
    (e: "submit", payload: TemplateAuthorityPayload): void;
  }>();

  defineOptions({
    name: "PortalAuthorityDialog",
  });

  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit("update:modelValue", value),
  });

  const form = reactive({
    authType: "person" as "person" | "role",
    whiteUsers: [] as AuthorityUserItem[],
    blackUsers: [] as AuthorityUserItem[],
    editUsers: [] as AuthorityUserItem[],
    allowRoleIds: [] as string[],
    forbiddenRoleIds: [] as string[],
    configRoleIds: [] as string[],
  });

  const roleOptions = ref<RoleOption[]>([]);
  const roleLoading = ref(false);
  const pickingField = ref<UserField | "">("");

  const personDisplay = computed(() => ({
    white: formatUserNames(form.whiteUsers),
    black: formatUserNames(form.blackUsers),
    edit: formatUserNames(form.editUsers),
  }));

  watch(
    () => visible.value,
    (opened) => {
      if (!opened) {
        return;
      }
      hydrateFromInitial(props.initial);
      void ensureRoleOptions();
    }
  );

  function normalizeIdLike(value: unknown): string {
    if (typeof value === "string") {
      return value;
    }
    if (typeof value === "number") {
      return String(value);
    }
    return "";
  }

  function normalizeString(value: unknown): string {
    return typeof value === "string" ? value : "";
  }

  function normalizeRoleIds(value: unknown): string[] {
    if (!value || typeof value !== "object") {
      return [];
    }
    const obj = value as Record<string, unknown>;
    const roleIdsRaw = Array.isArray(obj.roleIds) ? obj.roleIds : [];
    const roleListRaw = Array.isArray(obj.roleList) ? obj.roleList : [];
    const fromIds = roleIdsRaw.map(normalizeIdLike).filter(Boolean);
    const fromList = roleListRaw
      .map((item) => {
        if (!item || typeof item !== "object") {
          return "";
        }
        const row = item as Record<string, unknown>;
        return normalizeIdLike(row.id) || normalizeIdLike(row.roleId);
      })
      .filter(Boolean);
    return Array.from(new Set([...fromIds, ...fromList]));
  }

  function normalizeAuthorityUsers(value: unknown): AuthorityUserItem[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }
        const row = item as Record<string, unknown>;
        const typeId =
          normalizeIdLike(row.typeId) ||
          normalizeIdLike(row.id) ||
          normalizeIdLike(row.userId) ||
          normalizeIdLike(row.value);
        if (!typeId) {
          return null;
        }
        const typeName =
          normalizeString(row.typeName) ||
          normalizeString(row.nickName) ||
          normalizeString(row.name) ||
          normalizeString(row.title) ||
          typeId;
        return {
          typeId,
          type: typeof row.type === "number" ? row.type : 0,
          typeName,
        };
      })
      .filter((item): item is AuthorityUserItem => Boolean(item));
  }

  function normalizeEditUsers(value: unknown, fallbackUserIds: unknown): AuthorityUserItem[] {
    const fromItems = normalizeAuthorityUsers(value);
    if (fromItems.length > 0) {
      return fromItems;
    }
    if (!Array.isArray(fallbackUserIds)) {
      return [];
    }
    return fallbackUserIds
      .map((item) => {
        const id = normalizeIdLike(item);
        if (!id) {
          return null;
        }
        return {
          typeId: id,
          type: 0,
          typeName: id,
        };
      })
      .filter((item): item is AuthorityUserItem => Boolean(item));
  }

  function hydrateFromInitial(initial: Partial<PortalTemplate> | undefined) {
    const payload = (initial || {}) as Record<string, unknown>;
    const authType = payload.authType === "role" ? "role" : "person";

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
      return "";
    }
    return list.map((item) => item.typeName || item.typeId).join(", ");
  }

  function toPersonnelNode(row: Record<string, unknown>): PersonnelNode | null {
    const id = normalizeIdLike(row.id);
    if (!id) {
      return null;
    }
    const nodeTypeRaw = normalizeString(row.nodeType);
    const hasUser = Boolean(normalizeIdLike(row.userId)) || Boolean(normalizeString(row.nickName));
    const nodeType = nodeTypeRaw === "org" || nodeTypeRaw === "user" ? nodeTypeRaw : hasUser ? "user" : "org";
    const parentId = normalizeIdLike(row.parentId) || "0";
    const companyId = normalizeIdLike(row.companyId) || "0";
    const title =
      normalizeString(row.title) ||
      normalizeString(row.orgName) ||
      normalizeString(row.nickName) ||
      normalizeString(row.userAccount) ||
      id;

    if (nodeType === "org") {
      return {
        id,
        parentId,
        companyId,
        title,
        orgName: normalizeString(row.orgName) || title,
        orgType: typeof row.orgType === "number" ? row.orgType : 0,
        nodeType: "org",
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
      nodeType: "user",
    };
  }

  const fetchNodes: PersonnelFetchNodes = async ({ parentId }) => {
    const res = await portalAuthorityApi.getOrgContactsLazy({
      parentId: parentId || undefined,
    });
    const rows = Array.isArray(res?.data) ? res.data : [];
    return rows
      .map((item) => (item && typeof item === "object" ? toPersonnelNode(item as Record<string, unknown>) : null))
      .filter((item): item is PersonnelNode => Boolean(item));
  };

  const searchNodes: PersonnelSearchNodes = async ({ keyword }) => {
    const res = await portalAuthorityApi.searchContactUsers({
      search: keyword,
    });
    const rows = Array.isArray(res?.data) ? res.data : [];
    return rows
      .map((item) => (item && typeof item === "object" ? toPersonnelNode(item as Record<string, unknown>) : null))
      .filter((item): item is PersonnelNode => Boolean(item && item.nodeType === "user"));
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
      // 这里降级到分页接口，避免不同后端版本只提供 page 时无法配置权限。
    } finally {
      roleLoading.value = false;
    }

    roleLoading.value = true;
    try {
      const pageRes = await portalAuthorityApi.pageRoles({
        currentPage: 1,
        pageSize: 500,
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

  function getUsersByField(field: UserField): AuthorityUserItem[] {
    if (field === "white") {
      return form.whiteUsers;
    }
    if (field === "black") {
      return form.blackUsers;
    }
    return form.editUsers;
  }

  function setUsersByField(field: UserField, users: AuthorityUserItem[]) {
    if (field === "white") {
      form.whiteUsers = users;
      return;
    }
    if (field === "black") {
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
        title: "选择人员",
        mode: "person",
        required: false,
        users: current.map((item) => ({
          id: item.typeId,
          nickName: item.typeName,
        })),
        model: {
          userIds: current.map((item) => item.typeId),
        },
        fetchNodes,
        searchNodes,
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
            typeName: item.nickName || item.title || id,
          };
        })
        .filter((item): item is AuthorityUserItem => Boolean(item));
      setUsersByField(field, users);
    } finally {
      pickingField.value = "";
    }
  }

  function onCancel() {
    visible.value = false;
  }

  function buildTemplateAuthorityPayload(): TemplateAuthorityPayload {
    const isRole = form.authType === "role";

    if (isRole) {
      return {
        authType: "role",
        whiteDTOS: [],
        blackDTOS: [],
        userIds: [],
        whiteList: [],
        blackList: [],
        editUsers: [],
        allowRole: { roleIds: [...form.allowRoleIds] },
        forbiddenRole: { roleIds: [...form.forbiddenRoleIds] },
        configRole: { roleIds: [...form.configRoleIds] },
      };
    }

    const white = form.whiteUsers.map((item) => ({ ...item, type: 0 }));
    const black = form.blackUsers.map((item) => ({ ...item, type: 0 }));
    const edit = form.editUsers.map((item) => ({ ...item, type: 0 }));

    return {
      authType: "person",
      whiteDTOS: white,
      blackDTOS: black,
      userIds: edit.map((item) => item.typeId),
      whiteList: white,
      blackList: black,
      editUsers: edit,
      allowRole: { roleIds: [] },
      forbiddenRole: { roleIds: [] },
      configRole: { roleIds: [] },
    };
  }

  function onSubmit() {
    emit("submit", buildTemplateAuthorityPayload());
  }
</script>

<template>
  <el-dialog v-model="visible" title="门户权限" width="720px" :close-on-click-modal="false" destroy-on-close>
    <el-form label-position="left" label-width="108px">
      <el-form-item label="授权类型">
        <el-radio-group v-model="form.authType">
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
          >
            <el-option v-for="role in roleOptions" :key="role.id" :label="role.name" :value="role.id" />
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
          >
            <el-option v-for="role in roleOptions" :key="role.id" :label="role.name" :value="role.id" />
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
          >
            <el-option v-for="role in roleOptions" :key="role.id" :label="role.name" :value="role.id" />
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
          >
            <template #append>
              <el-button :icon="UserFilled" :loading="pickingField === 'white'" @click="pickUsers('white')" />
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="不可访问人员">
          <el-input
            :model-value="personDisplay.black"
            readonly
            placeholder="请选择"
            @click="pickUsers('black')"
          >
            <template #append>
              <el-button :icon="UserFilled" :loading="pickingField === 'black'" @click="pickUsers('black')" />
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="可维护人员">
          <el-input
            :model-value="personDisplay.edit"
            readonly
            placeholder="请选择"
            @click="pickUsers('edit')"
          >
            <template #append>
              <el-button :icon="UserFilled" :loading="pickingField === 'edit'" @click="pickUsers('edit')" />
            </template>
          </el-input>
        </el-form-item>
      </template>
    </el-form>

    <template #footer>
      <div class="footer">
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" :loading="props.loading" @click="onSubmit">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
  .footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
</style>
