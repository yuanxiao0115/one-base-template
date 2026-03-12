<script setup lang="ts">
  import { computed, reactive, ref } from "vue";
  import { useRouter } from "vue-router";
  import type { TableColumnList } from "@one-base-template/ui";
  import { confirm } from "@one-base-template/ui";
  import { message } from "@one-base-template/ui";

  import { portalApi } from "../api";
  import type { PortalTab } from "../types";
  import {
    buildPortalTabPermissionUpdatePayload,
    buildTemplatePagePermissionTree,
    collectTemplatePagePermissionTabs,
    type PagePermissionSubmitPayload,
    type TemplatePagePermissionTreeNode,
  } from "../utils/pagePermission";
  import { templateApi } from "./api";
  import PagePermissionDialog from "./components/PagePermissionDialog.vue";
  import type { BizResponse, PageResult, PortalTemplate } from "./types";
  import { findFirstPageTabId } from "../utils/portalTree";
  import PortalAuthorityDialog from "./components/PortalAuthorityDialog.vue";
  import PortalPermissionSwitchDialog from "./components/PortalPermissionSwitchDialog.vue";
  import PortalTemplateCreateDialog from "./components/PortalTemplateCreateDialog.vue";

  defineOptions({ name: "PortalTemplateList" });

  type BizResLike = Pick<BizResponse<unknown>, "code" | "message" | "success">;

  const tableColumns: TableColumnList = [
    {
      label: "序号",
      type: "index",
      width: 80,
      align: "left",
    },
    {
      label: "门户名称",
      prop: "templateName",
      minWidth: 220,
    },
    {
      label: "状态",
      prop: "publishStatus",
      width: 120,
      slot: "publishStatus",
    },
    {
      label: "操作",
      width: 360,
      fixed: "right",
      align: "right",
      slot: "operation",
    },
  ];

  const router = useRouter();

  const loading = ref(false);
  const rows = ref<PortalTemplate[]>([]);

  const currentPage = ref(1);
  const pageSize = ref(10);
  const total = ref(0);

  const searchForm = reactive<{
    searchKey: string;
    publishStatus: number | "";
  }>({
    searchKey: "",
    publishStatus: "",
  });

  const tablePagination = computed(() => ({
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    total: total.value,
  }));

  const dialogVisible = ref(false);
  const dialogSubmitting = ref(false);
  const dialogMode = ref<"create" | "edit" | "copy">("create");
  const dialogTitle = ref("新增门户模板");
  const dialogSubmitText = ref("创建并配置");
  const dialogInitialValue = ref({
    templateName: "",
    description: "",
    templateType: 0,
    isOpen: 0,
  });
  const activeTemplateId = ref("");

  interface PortalAuthorityPayload {
    authType: "person" | "role";
    whiteDTOS: Array<{ typeId: string; type: number; typeName: string }>;
    blackDTOS: Array<{ typeId: string; type: number; typeName: string }>;
    userIds: string[];
    whiteList: Array<{ typeId: string; type: number; typeName: string }>;
    blackList: Array<{ typeId: string; type: number; typeName: string }>;
    editUsers: Array<{ typeId: string; type: number; typeName: string }>;
    allowRole: { roleIds: string[] };
    forbiddenRole: { roleIds: string[] };
    configRole: { roleIds: string[] };
  }

  interface PortalAuthorityUpdatePayload extends PortalAuthorityPayload {
    id: string;
    templateName: string;
    templateType: number;
    isOpen: number;
  }

  const authoritySubmitting = ref(false);
  const authorityInitial = ref<Partial<PortalTemplate>>({});
  const authorityTemplateId = ref("");
  const permissionCenterVisible = ref(false);
  const permissionTemplateId = ref("");
  const permissionTemplateName = ref("");
  const permissionPageTree = ref<TemplatePagePermissionTreeNode[]>([]);
  const pagePermissionLoading = ref(false);
  const pagePermissionTemplateId = ref("");
  const pagePermissionInitial = ref<Partial<PortalTab>>({});
  const pagePermissionCurrentTabId = ref("");

  function normalizeBizOk(res: BizResLike | null | undefined): boolean {
    const code = res?.code;
    return res?.success === true || code === 0 || code === 200 || String(code) === "0" || String(code) === "200";
  }

  function normalizePageTotal(data: PageResult<unknown> | null | undefined): number {
    const raw =
      (data as Record<string, unknown> | null)?.total ?? (data as Record<string, unknown> | null)?.totalCount ?? 0;
    const val = Number(raw);
    return Number.isFinite(val) ? val : 0;
  }

  function normalizeRecords(data: PageResult<PortalTemplate> | null | undefined): PortalTemplate[] {
    const raw = (data as PageResult<PortalTemplate> | null)?.records;
    return Array.isArray(raw) ? raw : [];
  }

  function isPublished(row: PortalTemplate): boolean {
    return Number(row.publishStatus) === 1;
  }

  function getPublishStatusText(row: PortalTemplate): string {
    const val = Number(row.publishStatus);
    if (val === 1) {
      return "已发布";
    }
    if (val === 0) {
      return "草稿";
    }
    return "未知";
  }

  function normalizeIdLike(value: unknown): string {
    if (typeof value === "string") {
      return value;
    }
    if (typeof value === "number") {
      return String(value);
    }
    return "";
  }

  function normalizeIntegerLike(value: unknown, fallback = 0): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function normalizeTemplateName(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
  }

  function extractTemplateId(value: unknown): string {
    const direct = normalizeIdLike(value);
    if (direct) {
      return direct;
    }

    if (value && typeof value === "object") {
      const obj = value as Record<string, unknown>;
      return normalizeIdLike(obj.id) || normalizeIdLike(obj.templateId) || "";
    }

    return "";
  }

  async function queryList(page = currentPage.value) {
    loading.value = true;
    try {
      currentPage.value = page;

      const res = await templateApi.list({
        currentPage: currentPage.value,
        pageSize: pageSize.value,
        searchKey: searchForm.searchKey || undefined,
        publishStatus: searchForm.publishStatus === "" ? undefined : Number(searchForm.publishStatus),
      });

      if (!normalizeBizOk(res)) {
        message.error(res?.message || "加载失败");
        rows.value = [];
        total.value = 0;
        return;
      }

      rows.value = normalizeRecords(res?.data);
      total.value = normalizePageTotal(res?.data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "加载失败";
      message.error(msg);
      rows.value = [];
      total.value = 0;
    } finally {
      loading.value = false;
    }
  }

  function tableSearch(keyword: string) {
    searchForm.searchKey = keyword;
    void queryList(1);
  }

  function onKeywordUpdate(keyword: string) {
    searchForm.searchKey = keyword;
  }

  function onResetSearch() {
    searchForm.publishStatus = "";
    void queryList(1);
  }

  function handlePageSizeChange(size: number) {
    pageSize.value = size;
    void queryList(1);
  }

  function handlePageCurrentChange(page: number) {
    void queryList(page);
  }

  function fillDialogInitialValue(source?: Partial<PortalTemplate> | null) {
    dialogInitialValue.value = {
      templateName: source?.templateName?.trim() || "",
      description: source?.description || "",
      templateType: Number(source?.templateType) || 0,
      isOpen: Number(source?.isOpen) || 0,
    };
  }

  function openCreate() {
    activeTemplateId.value = "";
    dialogMode.value = "create";
    dialogTitle.value = "新增门户模板";
    dialogSubmitText.value = "创建并配置";
    fillDialogInitialValue();
    dialogVisible.value = true;
  }

  async function loadTemplateForDialog(id: string, fallback?: Partial<PortalTemplate>) {
    try {
      const res = await templateApi.detail({ id });
      if (!normalizeBizOk(res)) {
        message.error(res?.message || "加载门户详情失败");
        return null;
      }

      return { ...fallback, ...(res?.data ?? {}) };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "加载门户详情失败";
      message.error(msg);
      return null;
    }
  }

  async function openEdit(row: PortalTemplate) {
    if (!row.id) {
      return;
    }

    const detail = await loadTemplateForDialog(row.id, row);
    if (!detail) {
      return;
    }

    activeTemplateId.value = row.id;
    dialogMode.value = "edit";
    dialogTitle.value = "编辑门户模板";
    dialogSubmitText.value = "保存";
    fillDialogInitialValue(detail);
    dialogVisible.value = true;
  }

  async function openCopy(row: PortalTemplate) {
    if (!row.id) {
      return;
    }

    const detail = await loadTemplateForDialog(row.id, row);
    if (!detail) {
      return;
    }

    activeTemplateId.value = row.id;
    dialogMode.value = "copy";
    dialogTitle.value = "复制门户模板";
    dialogSubmitText.value = "复制";
    fillDialogInitialValue({
      ...detail,
      templateName: `${detail.templateName || "门户模板"}-副本`,
    });
    dialogVisible.value = true;
  }

  async function onSubmitTemplate(payload: {
    templateName: string;
    description: string;
    templateType: number;
    isOpen: number;
  }) {
    if (dialogSubmitting.value) {
      return;
    }

    dialogSubmitting.value = true;
    try {
      if (dialogMode.value === "create") {
        const res = await templateApi.add({
          templateName: payload.templateName,
          description: payload.description || "",
          // 对齐老项目的必填字段，避免后端校验失败
          templateType: payload.templateType,
          isOpen: payload.isOpen,
          // 这些字段在部分环境可能存在默认值，显式传递更稳妥（后端可忽略）
          widthSize: 1280,
          widthType: 1,
          autoWidthSize: 100,
        });

        if (!normalizeBizOk(res)) {
          message.error(res?.message || "创建失败");
          return;
        }

        const newId = extractTemplateId((res as BizResponse<unknown> | null)?.data);
        message.success("创建成功");
        dialogVisible.value = false;

        if (newId) {
          router
            .push({
              path: "/portal/design",
              query: { id: newId },
            })
            .catch((error) => {
              console.warn("[PortalTemplateList] 跳转设计页失败", error);
            });
          return;
        }

        await queryList(1);
        return;
      }

      if (dialogMode.value === "edit") {
        const id = activeTemplateId.value;
        if (!id) {
          message.error("缺少模板 ID，无法编辑");
          return;
        }

        const res = await templateApi.update({
          id,
          templateName: payload.templateName,
          description: payload.description || "",
          templateType: payload.templateType,
          isOpen: payload.isOpen,
        });

        if (!normalizeBizOk(res)) {
          message.error(res?.message || "编辑失败");
          return;
        }

        message.success("编辑成功");
        dialogVisible.value = false;
        await queryList();
        return;
      }

      const id = activeTemplateId.value;
      if (!id) {
        message.error("缺少模板 ID，无法复制");
        return;
      }

      const res = await templateApi.copy({
        id,
        templateName: payload.templateName,
      });

      if (!normalizeBizOk(res)) {
        message.error(res?.message || "复制失败");
        return;
      }

      message.success("复制成功");
      dialogVisible.value = false;
      await queryList(1);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "提交失败";
      message.error(msg);
    } finally {
      dialogSubmitting.value = false;
    }
  }

  function goDesigner(row: PortalTemplate) {
    const { id } = row;
    if (!id) {
      return;
    }
    router
      .push({
        path: "/portal/design",
        query: { id },
      })
      .catch((error) => {
        console.warn("[PortalTemplateList] 跳转设计页失败", error);
      });
  }

  async function openPreview(row: PortalTemplate) {
    const { id } = row;
    if (!id) {
      return;
    }

    try {
      const res = await templateApi.detail({ id });
      if (!normalizeBizOk(res)) {
        message.error(res?.message || "获取模板详情失败");
        return;
      }

      const tpl = res.data;
      const tabIdFromTree = findFirstPageTabId(tpl?.tabList);
      const tabId = tabIdFromTree || (Array.isArray(tpl?.tabIds) ? tpl?.tabIds?.[0] || "" : "");
      if (!tabId) {
        message.warning("该模板暂无可预览页面");
        return;
      }

      window.open(`/portal/preview?templateId=${id}&tabId=${tabId}&previewMode=live`, "_blank");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "预览失败";
      message.error(msg);
    }
  }

  async function openPermissionCenter(row: PortalTemplate) {
    const id = normalizeIdLike(row.id);
    if (!id) {
      return;
    }

    const detail = await loadTemplateForDialog(id, row);
    if (!detail) {
      return;
    }

    authorityTemplateId.value = id;
    authorityInitial.value = detail;
    permissionTemplateId.value = id;
    permissionTemplateName.value = normalizeTemplateName(detail.templateName) || normalizeTemplateName(row.templateName);
    permissionPageTree.value = buildTemplatePagePermissionTree(
      Array.isArray(detail.tabList) ? (detail.tabList as PortalTab[]) : []
    );

    const tabOptions = collectTemplatePagePermissionTabs(
      Array.isArray(detail.tabList) ? (detail.tabList as PortalTab[]) : []
    );

    pagePermissionTemplateId.value = id;
    pagePermissionCurrentTabId.value = tabOptions[0]?.tabId || "";
    pagePermissionInitial.value = {};
    permissionCenterVisible.value = true;

    if (pagePermissionCurrentTabId.value) {
      void loadPagePermissionDetail(pagePermissionCurrentTabId.value);
    }
  }

  async function loadPagePermissionDetail(tabId: string): Promise<boolean> {
    if (!tabId) {
      return false;
    }

    if (pagePermissionLoading.value) {
      return false;
    }

    pagePermissionLoading.value = true;
    try {
      const res = await portalApi.tab.detail({
        id: tabId,
        templateId: pagePermissionTemplateId.value || undefined,
      });
      if (!normalizeBizOk(res)) {
        message.error(res?.message || "加载页面权限失败");
        return false;
      }

      pagePermissionInitial.value = (res?.data ?? {}) as PortalTab;
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "加载页面权限失败";
      message.error(msg);
      return false;
    } finally {
      pagePermissionLoading.value = false;
    }
  }

  function onSelectPermissionPage(tabId: string) {
    if (!tabId || tabId === pagePermissionCurrentTabId.value) {
      return;
    }
    pagePermissionCurrentTabId.value = tabId;
    void loadPagePermissionDetail(tabId);
  }

  async function onSubmitPagePermission(payload: PagePermissionSubmitPayload) {
    const tabId = pagePermissionCurrentTabId.value;
    if (!(tabId && pagePermissionTemplateId.value) || pagePermissionLoading.value) {
      return;
    }

    pagePermissionLoading.value = true;
    try {
      const detailRes = await portalApi.tab.detail({
        id: tabId,
        templateId: pagePermissionTemplateId.value,
      });
      if (!normalizeBizOk(detailRes)) {
        message.error(detailRes?.message || "加载页面详情失败，无法保存权限");
        return;
      }

      const detail = (detailRes?.data ?? {}) as PortalTab;
      const res = await portalApi.tab.update(buildPortalTabPermissionUpdatePayload(detail, payload));
      if (!normalizeBizOk(res)) {
        message.error(res?.message || "页面权限保存失败");
        return;
      }

      message.success("页面权限保存成功");
      pagePermissionInitial.value = {
        ...detail,
        authType: payload.authType,
        allowPerms: payload.allowPerms,
        forbiddenPerms: payload.forbiddenPerms,
        configPerms: payload.configPerms,
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "页面权限保存失败";
      message.error(msg);
    } finally {
      pagePermissionLoading.value = false;
    }
  }

  async function onSubmitAuthority(payload: PortalAuthorityPayload) {
    const id = authorityTemplateId.value;
    if (!id || authoritySubmitting.value) {
      return;
    }

    authoritySubmitting.value = true;
    try {
      const updatePayload = await buildAuthorityUpdatePayload(id, payload);
      if (!updatePayload) {
        return;
      }

      const res = await templateApi.update(updatePayload as unknown as Partial<PortalTemplate>);
      if (!normalizeBizOk(res)) {
        message.error(res?.message || "门户权限保存失败");
        return;
      }

      message.success("门户权限保存成功");
      await queryList(currentPage.value);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "门户权限保存失败";
      message.error(msg);
    } finally {
      authoritySubmitting.value = false;
    }
  }

  async function buildAuthorityUpdatePayload(
    id: string,
    payload: PortalAuthorityPayload
  ): Promise<PortalAuthorityUpdatePayload | null> {
    const detail = await loadTemplateForDialog(id, authorityInitial.value);
    if (!detail) {
      return null;
    }

    authorityInitial.value = detail;

    const templateName = normalizeTemplateName(detail.templateName);
    if (!templateName) {
      message.error("门户名称为空，无法保存权限");
      return null;
    }

    return {
      id: normalizeIdLike(detail.id) || id,
      templateName,
      templateType: normalizeIntegerLike(detail.templateType, 0),
      isOpen: normalizeIntegerLike(detail.isOpen, 0),
      ...payload,
    };
  }

  async function togglePublish(row: PortalTemplate) {
    const { id } = row;
    if (!id) {
      return;
    }

    const nextStatus = isPublished(row) ? 0 : 1;
    const text = nextStatus === 1 ? "发布" : "取消发布";

    const res = await templateApi.publish({
      id,
      status: nextStatus,
    });
    if (!normalizeBizOk(res)) {
      message.error(res?.message || `${text}失败`);
      return;
    }

    message.success(`${text}成功`);
    await queryList();
  }

  async function deleteTemplate(row: PortalTemplate) {
    const { id } = row;
    if (!id) {
      return;
    }

    try {
      await confirm.warn("确定要删除该门户模板吗？", "删除确认");
    } catch {
      return;
    }

    const res = await templateApi.delete({ id });
    if (!normalizeBizOk(res)) {
      message.error(res?.message || "删除失败");
      return;
    }

    message.success("删除成功");

    const nextPage = rows.value.length <= 1 && currentPage.value > 1 ? currentPage.value - 1 : currentPage.value;
    await queryList(nextPage);
  }

  void queryList(1);
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
        <el-select v-model="searchForm.publishStatus" class="status-filter" clearable placeholder="全部状态">
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
            <span>{{ row.description || "-" }}</span>
          </template>

          <template #publishStatus="{ row }">
            <el-tag :type="isPublished(row) ? 'success' : 'info'">{{ getPublishStatusText(row) }}</el-tag>
          </template>

          <template #operation="{ row, size: actionSize }">
            <ObActionButtons>
              <el-button link type="primary" :size="actionSize" @click="() => openEdit(row)">编辑</el-button>
            <el-button link type="primary" :size="actionSize" @click="() => goDesigner(row)">配置</el-button>
              <el-button link :size="actionSize" @click="() => openCopy(row)">复制</el-button>
              <el-button link :size="actionSize" @click="() => openPermissionCenter(row)">权限配置</el-button>
              <el-button link :size="actionSize" @click="() => openPreview(row)">预览</el-button>
              <el-button link :size="actionSize" @click="() => togglePublish(row)">
                {{ isPublished(row) ? "取消发布" : "发布" }}
              </el-button>
              <el-button link type="danger" :size="actionSize" @click="() => deleteTemplate(row)">删除</el-button>
            </ObActionButtons>
          </template>
        </ObVxeTable>
      </template>

      <template #drawer>
        <el-form label-position="top" class="drawer-form">
          <el-form-item label="发布状态">
            <el-select v-model="searchForm.publishStatus" clearable placeholder="全部状态" class="drawer-select">
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
