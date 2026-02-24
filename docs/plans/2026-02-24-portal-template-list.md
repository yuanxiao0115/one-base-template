# PC 门户模板列表（表格版）Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把 `/portal/templates` 从占位页升级为表格列表，提供搜索/筛选/分页与最小管理操作（配置/预览/发布/删除）。

**Architecture:**
- 列表页本地管理查询条件与分页状态（方案 A），通过 `portalApi.template.list/detail/publish/delete` 完成数据拉取与操作。
- 预览复用顶层匿名路由 `/portal/preview/:tabId?templateId=<id>`，tabId 来自 `template.detail` 的 `tabList/tabIds`。
- 兼容后端分页字段差异：`total`/`totalCount`。

**Tech Stack:** Vue 3 + Element Plus + Vue Router + ObHttp（`portalApi`）+ Tailwind CSS utilities

---

### Task 1: 替换占位页为“筛选 + 表格 + 分页”骨架

**Files:**
- Modify: `apps/admin/src/modules/portal/pages/PortalTemplateListPage.vue`

**Step 1: 写最小页面结构（先不接 API）**

实现以下内容：
- 顶部筛选区：`el-input(searchKey)` + `el-select(publishStatus)` + 查询/重置按钮
- 表格：`el-table` + 4 列（名称/描述/状态/操作）
- 分页：`el-pagination`

参考代码（完整替换文件内容）：

```vue
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';

import { portalApi } from '../api/portal';
import type { BizResponse, PageResult, PortalTemplate } from '../types';
import { findFirstPageTabId } from '../utils/portalTree';

defineOptions({ name: 'PortalTemplateList' });

type BizResLike = Pick<BizResponse<unknown>, 'code' | 'success' | 'message'>;

const router = useRouter();

const loading = ref(false);
const searchKey = ref('');
const publishStatus = ref<number | undefined>(undefined); // undefined 表示全部

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const rows = ref<PortalTemplate[]>([]);

const publishStatusText = computed(() => ({
  0: '草稿',
  1: '已发布',
}));

function normalizeBizOk(res: BizResLike | null | undefined): boolean {
  const code = res?.code;
  return res?.success === true || code === 0 || code === 200 || String(code) === '0' || String(code) === '200';
}

function normalizePageTotal(data: PageResult<unknown> | null | undefined): number {
  const raw = (data as Record<string, unknown> | null)?.total ?? (data as Record<string, unknown> | null)?.totalCount ?? 0;
  const val = Number(raw);
  return Number.isFinite(val) ? val : 0;
}

function normalizeRecords(data: PageResult<PortalTemplate> | null | undefined): PortalTemplate[] {
  const raw = (data as PageResult<PortalTemplate> | null)?.records;
  return Array.isArray(raw) ? raw : [];
}

async function queryList(page = currentPage.value) {
  loading.value = true;
  try {
    currentPage.value = page;
    const res = await portalApi.template.list({
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      searchKey: searchKey.value || undefined,
      publishStatus: publishStatus.value,
    });

    if (!normalizeBizOk(res)) {
      ElMessage.error(res?.message || '加载失败');
      rows.value = [];
      total.value = 0;
      return;
    }

    rows.value = normalizeRecords(res?.data);
    total.value = normalizePageTotal(res?.data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '加载失败';
    ElMessage.error(msg);
    rows.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

function onSearch() {
  queryList(1).catch(() => {});
}

function onReset() {
  searchKey.value = '';
  publishStatus.value = undefined;
  queryList(1).catch(() => {});
}

function goDesigner(row: PortalTemplate) {
  const id = row.id;
  if (!id) return;
  router.push({ path: '/portal/designer', query: { templateId: id } }).catch(() => {});
}

async function openPreview(row: PortalTemplate) {
  const id = row.id;
  if (!id) return;

  try {
    const res = await portalApi.template.detail({ id });
    if (!normalizeBizOk(res)) {
      ElMessage.error(res?.message || '获取模板详情失败');
      return;
    }

    const tpl = res.data;
    const tabIdFromTree = findFirstPageTabId(tpl?.tabList);
    const tabId = tabIdFromTree || (Array.isArray(tpl?.tabIds) ? (tpl?.tabIds?.[0] || '') : '');
    if (!tabId) {
      ElMessage.warning('该模板暂无可预览页面');
      return;
    }

    window.open(`/portal/preview/${tabId}?templateId=${id}`, '_blank');
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '预览失败';
    ElMessage.error(msg);
  }
}

async function togglePublish(row: PortalTemplate) {
  const id = row.id;
  if (!id) return;
  const current = Number(row.publishStatus) || 0;
  const nextStatus = current === 1 ? 0 : 1;
  const text = nextStatus === 1 ? '发布' : '取消发布';

  const res = await portalApi.template.publish({ id, status: nextStatus });
  if (!normalizeBizOk(res)) {
    ElMessage.error(res?.message || `${text}失败`);
    return;
  }

  ElMessage.success(`${text}成功`);
  await queryList();
}

async function deleteTemplate(row: PortalTemplate) {
  const id = row.id;
  if (!id) return;

  try {
    await ElMessageBox.confirm('确定要删除该门户模板吗？', '删除确认', { type: 'warning' });
  } catch {
    return;
  }

  const res = await portalApi.template.delete({ id });
  if (!normalizeBizOk(res)) {
    ElMessage.error(res?.message || '删除失败');
    return;
  }

  ElMessage.success('删除成功');

  // 若当前页删空，自动回退上一页（避免出现空白页体验差）
  const nextPage = rows.value.length <= 1 && currentPage.value > 1 ? currentPage.value - 1 : currentPage.value;
  await queryList(nextPage);
}

onMounted(() => {
  queryList(1).catch(() => {});
});
</script>

<template>
  <div class="space-y-3">
    <el-card>
      <template #header>
        <div class="font-medium">门户模板</div>
      </template>

      <div class="flex flex-wrap gap-2 items-center">
        <el-input
          v-model.trim="searchKey"
          class="w-[260px]"
          placeholder="输入门户名称"
          clearable
          @keydown.enter="onSearch"
          @clear="onSearch"
        />

        <el-select v-model="publishStatus" class="w-[140px]" placeholder="发布状态" clearable @clear="onSearch">
          <el-option :value="undefined" label="全部" />
          <el-option :value="0" label="草稿" />
          <el-option :value="1" label="已发布" />
        </el-select>

        <el-button type="primary" @click="onSearch">查询</el-button>
        <el-button @click="onReset">重置</el-button>
      </div>
    </el-card>

    <el-card>
      <el-table v-loading="loading" :data="rows" row-key="id" style="width: 100%">
        <el-table-column prop="templateName" label="门户名称" min-width="220" />
        <el-table-column label="描述" min-width="280">
          <template #default="{ row }">
            <span class="text-[var(--el-text-color-regular)]">{{ row.description || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.publishStatus === 1 ? 'success' : 'info'">
              {{ publishStatusText[row.publishStatus ?? 0] || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-2 flex-wrap">
              <el-button link type="primary" @click="goDesigner(row)">配置</el-button>
              <el-button link @click="openPreview(row)">预览</el-button>
              <el-button link @click="togglePublish(row)">{{ row.publishStatus === 1 ? '取消发布' : '发布' }}</el-button>
              <el-button link type="danger" @click="deleteTemplate(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-3 flex justify-end">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="queryList"
          @size-change="() => queryList(1)"
        />
      </div>
    </el-card>
  </div>
</template>
```

**Step 2: 验证（确保编译通过）**

Run: `pnpm -C apps/admin typecheck`  
Expected: PASS

**Step 3: Commit**

```bash
git add apps/admin/src/modules/portal/pages/PortalTemplateListPage.vue
git commit -m "feat(portal): implement template list table"
```

---

### Task 2: 文档补齐列表页说明

**Files:**
- Modify: `apps/docs/docs/guide/portal-designer.md`

**Step 1: 更新“/portal/templates”能力说明**
- 标注“表格列表（非卡片）”
- 列出支持的最小操作：配置/预览/发布/删除 + 搜索/筛选/分页

**Step 2: 验证**

Run: `pnpm -C apps/docs build`  
Expected: PASS

**Step 3: Commit**

```bash
git add apps/docs/docs/guide/portal-designer.md
git commit -m "docs(portal): document template list table"
```

---

### Task 3: 全链路验证（typecheck/lint/build）

**Step 1: 运行全仓验证**

Run:
```bash
pnpm -w typecheck
pnpm -w lint
pnpm -w build
pnpm -C apps/docs build
```

Expected: 全部 PASS（允许存在非 portal 相关 warning，但不得新增 portal 相关 error）。

**Step 2: 记录验证结果**
- 更新项目工作文档（主仓库）：`.codex/testing.md`、`.codex/verification.md`、`.codex/operations-log.md`

