<script setup lang="ts">
  import { computed, reactive, ref } from "vue";
  import { useRouter } from "vue-router";
  import type { TableColumnList } from "@one-base-template/ui";
  import { confirm } from "@/infra/confirm";
  import { message } from "@/utils/message";

  import { portalApiClient } from "../api/client";
  import type { BizResponse, PageResult, PortalTemplate } from "../types";
  import { findFirstPageTabId } from "../utils/portalTree";
  import PortalTemplateCreateDialog from "../components/template/PortalTemplateCreateDialog.vue";

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
      label: "描述",
      prop: "description",
      minWidth: 280,
      slot: "description",
    },
    {
      label: "状态",
      prop: "publishStatus",
      width: 120,
      slot: "publishStatus",
    },
    {
      label: "操作",
      width: 420,
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

      const res = await portalApiClient.template.list({
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
      const res = await portalApiClient.template.detail({ id });
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
        const res = await portalApiClient.template.add({
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
              path: "/resource/portal/setting",
              query: { id: newId },
            })
            .catch((error) => {
              console.warn("[PortalTemplateListPage] 跳转设计页失败", error);
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

        const res = await portalApiClient.template.update({
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

      const res = await portalApiClient.template.copy({
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
        path: "/resource/portal/setting",
        query: { id },
      })
      .catch((error) => {
        console.warn("[PortalTemplateListPage] 跳转设计页失败", error);
      });
  }

  async function openPreview(row: PortalTemplate) {
    const { id } = row;
    if (!id) {
      return;
    }

    try {
      const res = await portalApiClient.template.detail({ id });
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

      window.open(`/portal/preview?templateId=${id}&tabId=${tabId}`, "_blank");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "预览失败";
      message.error(msg);
    }
  }

  async function togglePublish(row: PortalTemplate) {
    const { id } = row;
    if (!id) {
      return;
    }

    const nextStatus = isPublished(row) ? 0 : 1;
    const text = nextStatus === 1 ? "发布" : "取消发布";

    const res = await portalApiClient.template.publish({
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

    const res = await portalApiClient.template.delete({ id });
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
              <el-button link :size="actionSize" @click="() => openCopy(row)">复制</el-button>
              <el-button link type="primary" :size="actionSize" @click="() => goDesigner(row)">配置</el-button>
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
