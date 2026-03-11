import { computed, onMounted, reactive, ref, watch } from "vue";
import type { CrudFormLike } from "@one-base-template/ui";
import { useCrudPage } from "@one-base-template/core";
import { message } from "@one-base-template/ui";
import buildUserColumns from "../columns";
import { userApi } from "../api";
import type {
  OrgTreeNode,
  PositionItem,
  RoleItem,
  UserDetailData,
  UserListRecord,
  UserSavePayload,
} from "../types";
import { createDefaultUserForm, toUserForm, toUserPayload, type UserForm } from "../form";
import { userTypeOptions } from "../const";
import {
  assertUniqueCheck,
  shouldCheckUserUnique,
  toUserUniqueSnapshot,
  type UserUniqueSnapshot,
} from "../../shared/unique";
import buildUserListParams from "../utils/buildUserListParams";
import { useUserStatusActions } from "./useUserStatusActions";
import { useUserDragSort } from "./useUserDragSort";
import { useUserRemoteOptions } from "./useUserRemoteOptions";

interface SearchRefExpose {
  resetFields?: () => void;
}

interface TreeRefExpose {
  setCurrentKey?: (key?: string | null) => void;
}

function getUserTypeLabelMap(options: ReadonlyArray<{ value: number; label: string }>): Record<number, string> {
  return Object.fromEntries(options.map((item) => [item.value, item.label]));
}

function getUserTypeLabel(value: number, labelMap: Record<number, string>): string {
  return labelMap[value] || "--";
}

function downloadUserTemplate(filename = "组织用户导入模板.xlsx") {
  const link = document.createElement("a");
  link.href = `/${filename}`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function useUserCrudState() {
  const tableRef = ref<unknown>(null);
  const searchRef = ref<SearchRefExpose>();
  const editFormRef = ref<CrudFormLike>();
  const treeRef = ref<TreeRefExpose>();
  const userUniqueSnapshot = ref<UserUniqueSnapshot | null>(null);

  const orgTreeData = ref<OrgTreeNode[]>([]);
  const positionOptions = ref<PositionItem[]>([]);
  const roleOptions = ref<RoleItem[]>([]);

  const searchForm = reactive({
    nickName: "",
    phone: "",
    userAccount: "",
    isEnable: null as boolean | null,
    mail: "",
    date: [] as string[],
    orgId: "",
  });

  const defaultTreeProps = {
    children: "children",
    label: "orgName",
  };

  const canDragSort = computed(() => Boolean(searchForm.orgId));
  const tableColumns = computed(() => buildUserColumns(canDragSort.value));

  const tableOpt = reactive({
    query: {
      api: async (params: Record<string, unknown>) => userApi.page(buildUserListParams(params)),
      params: searchForm,
      pagination: true,
      immediate: false,
    },
    remove: {
      api: async (payload: { id: string }) => userApi.remove(payload),
      deleteConfirm: {
        nameKey: "nickName",
        requireInput: true,
        title: "删除确认",
        message: "此操作不可逆，会删除即时消息相关记录，请输入确认删除的姓名「{name}」",
        inputPlaceholder: "请输入确认删除的姓名",
        confirmButtonText: "确认删除",
      },
      onSuccess: () => {
        message.success("删除用户成功");
      },
      onError: (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : "删除用户失败";
        message.error(errorMessage);
      },
    },
  });

  const crudPage = useCrudPage<UserForm, UserListRecord, UserDetailData, UserSavePayload>({
    table: tableOpt,
    tableRef,
    editor: {
      entity: {
        name: "用户",
      },
      form: {
        create: () => createDefaultUserForm(),
        ref: editFormRef,
      },
      detail: {
        async beforeOpen({ mode, form }) {
          await Promise.all([loadOrgTree(), loadPositionOptions(), loadRoleOptions()]);

          if (mode === "create") {
            userUniqueSnapshot.value = null;
            form.userOrgs = [
              {
                orgId: searchForm.orgId || "",
                orgRankType: null,
                ownSort: 1,
                sort: 1,
                status: 1,
                postVos: [
                  {
                    postId: "",
                    sort: 1,
                    status: 1,
                  },
                ],
              },
            ];
          }
        },
        async load({ row }) {
          const response = await userApi.detail({ id: row.id });
          if (response.code !== 200) {
            throw new Error(response.message || "加载用户详情失败");
          }
          return response.data;
        },
        mapToForm: ({ detail }) => {
          const mapped = toUserForm(detail);
          userUniqueSnapshot.value = toUserUniqueSnapshot(mapped);
          return mapped;
        },
      },
      save: {
        buildPayload: async ({ form }) => {
          const payload = toUserPayload(form);
          const currentUnique = toUserUniqueSnapshot(payload);

          if (shouldCheckUserUnique(currentUnique, userUniqueSnapshot.value)) {
            const uniqueResponse = await userApi.checkUnique({
              userId: payload.id,
              userAccount: payload.userAccount,
              phone: payload.phone,
              mail: payload.mail,
            });

            const isUnique = assertUniqueCheck(uniqueResponse, "用户唯一性校验失败");
            if (!isUnique) {
              throw new Error("登录账号、手机号或邮箱已存在");
            }
          }

          return payload;
        },
        request: async ({ mode, payload }) => {
          const response = mode === "create" ? await userApi.add(payload) : await userApi.update(payload);

          if (response.code !== 200) {
            throw new Error(response.message || "保存用户失败");
          }

          return response;
        },
        onSuccess: async ({ mode }) => {
          message.success(mode === "create" ? "新增用户成功" : "更新用户成功");
        },
      },
    },
  });

  const {
    loading,
    dataList,
    pagination,
    selectedList,
    onSearch,
    resetForm,
    handleSelectionChange,
    handleSizeChange,
    handleCurrentChange,
  } = crudPage.table;

  const crud = crudPage.editor;
  const { remove } = crudPage.actions;

  const tablePagination = computed(() => ({
    ...pagination,
  }));

  const crudVisible = crud.visible;
  const crudMode = crud.mode;
  const crudTitle = crud.title;
  const crudReadonly = crud.readonly;
  const crudSubmitting = crud.submitting;
  const crudForm = crud.form;

  const userTypeLabelMap = getUserTypeLabelMap(userTypeOptions);
  const currentOrgId = computed(() => searchForm.orgId);
  const safeDataList = ref<UserListRecord[]>([]);
  const safeSelectedList = ref<UserListRecord[]>([]);

  watch(
    () => dataList.value as unknown,
    (rows) => {
      safeDataList.value = Array.isArray(rows) ? (rows as UserListRecord[]) : [];
    },
    { immediate: true }
  );

  watch(
    () => selectedList.value as unknown,
    (rows) => {
      safeSelectedList.value = Array.isArray(rows) ? (rows as UserListRecord[]) : [];
    },
    { immediate: true }
  );

  const { loadOrgTree, loadPositionOptions, loadRoleOptions, checkFieldUnique, uploadAvatar } = useUserRemoteOptions({
    orgTreeData,
    positionOptions,
    roleOptions,
  });

  function tableSearch(keyword: string) {
    searchForm.nickName = keyword;
    void onSearch();
  }

  function onKeywordUpdate(keyword: string) {
    searchForm.nickName = keyword;
  }

  function onResetSearch() {
    searchForm.orgId = "";
    searchForm.date = [];
    treeRef.value?.setCurrentKey?.(null);
    resetForm(searchRef, "nickName");
  }

  function handleNodeClick(node: OrgTreeNode) {
    searchForm.orgId = Number(node.orgType) === 1 ? "" : node.id;
    void onSearch();
  }

  function getCurrentUserTypeLabel(value: number): string {
    return getUserTypeLabel(value, userTypeLabelMap);
  }

  async function handleDelete(row: UserListRecord) {
    await remove(row);
  }

  const { handleSingleStatus, handleBatchStatus, handleResetPassword } = useUserStatusActions({
    selectedList: safeSelectedList,
    onSearch,
  });

  function downloadTemplate() {
    downloadUserTemplate();
  }

  async function importRequest(file: File) {
    return userApi.importUser(file);
  }

  async function handleImportUploaded() {
    await onSearch(false);
  }

  useUserDragSort({
    tableRef,
    canDragSort,
    dataList: safeDataList,
    orgId: currentOrgId,
    pagination,
    onSearch,
  });

  onMounted(async () => {
    try {
      await Promise.all([loadOrgTree(), loadPositionOptions(), loadRoleOptions()]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "初始化用户管理失败";
      message.error(errorMessage);
    }

    await onSearch(false);
  });

  return {
    refs: {
      tableRef,
      searchRef,
      editFormRef,
      treeRef,
    },
    table: {
      loading,
      dataList,
      tablePagination,
      tableColumns,
      orgTreeData,
      searchForm,
      defaultTreeProps,
    },
    options: {
      positionOptions,
      roleOptions,
    },
    editor: {
      crud,
      crudVisible,
      crudMode,
      crudTitle,
      crudReadonly,
      crudSubmitting,
      crudForm,
      checkFieldUnique,
      uploadAvatar,
    },
    actions: {
      handleSelectionChange,
      handleSizeChange,
      handleCurrentChange,
      tableSearch,
      onKeywordUpdate,
      onResetSearch,
      handleNodeClick,
      getUserTypeLabel: getCurrentUserTypeLabel,
      handleDelete,
      handleSingleStatus,
      handleBatchStatus,
      handleResetPassword,
      downloadTemplate,
      importRequest,
      handleImportUploaded,
      onSearch,
    },
  };
}
