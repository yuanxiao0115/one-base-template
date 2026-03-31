# Element Table 封装替换 TanStack Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:executing-plans to implement this plan. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 删除 TanStack 表格链路，并在 `packages/ui` 新增 `ObTable`，让当前 5 个灰度页面切换到基于 Element Plus 的统一表格封装。

**Architecture:** 先用源码测试锁定“导出/页面接线/TanStack 移除”边界，再实现 `ObTable` 最小兼容层与共享样式，最后回切 admin 页面、更新文档和验证记录。全程不触碰与本轮需求无关的脏文件。

**Tech Stack:** Vue 3 `<script setup>`、TypeScript、Element Plus、Vite Plus Test、VitePress、pnpm workspaces

---

## Chunk 1: 锁定回退边界与 RED 测试

### Task 1: 先改源码门禁，明确仓库不再以 TanStack 为现行方案

**Files:**

- Modify: `packages/ui/src/index.test.ts`
- Modify: `packages/ui/src/plugin.test.ts`
- Delete: `packages/ui/src/tanstack-table-source.test.ts`
- Create: `packages/ui/src/table-source.test.ts`
- Modify: `apps/admin/src/modules/LogManagement/login-log/list.source.test.ts`
- Modify: `apps/admin/src/modules/adminManagement/menu/list.source.test.ts`
- Modify: `apps/admin/src/modules/adminManagement/role/list.source.test.ts`
- Modify: `apps/admin/src/modules/adminManagement/role-assign/list.source.test.ts`
- Modify: `apps/admin/src/modules/adminManagement/org/list.source.test.ts`

- [x] **Step 1: 把 UI 入口测试改成断言 `Table` 导出与注册**
- [x] **Step 2: 新增 `table-source.test.ts`，锁定 `el-table + el-pagination + treeConfig + ellipsis/empty` 关键源码契约**
- [x] **Step 3: 把 5 个页面源码测试改成断言 `<ObTable>`**
- [x] **Step 4: 运行定向测试，确认当前实现 RED**

## Chunk 2: 删除 TanStack 资产并落地 `ObTable`

### Task 2: 清掉 TanStack 依赖、导出和实现文件

**Files:**

- Modify: `packages/ui/package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/plugin.ts`
- Modify: `packages/ui/src/env.d.ts`
- Delete: `packages/ui/src/components/table/TanStackTable.vue`
- Delete: `packages/ui/src/components/table/internal/tanstack-engine.ts`
- Delete: `packages/ui/src/components/table/internal/tanstack-pagination.ts`
- Delete: `packages/ui/src/components/table/assets/tree-toggle-collapsed.svg`
- Delete: `packages/ui/src/components/table/assets/tree-toggle-expanded.svg`
- Delete: `docs/superpowers/plans/2026-03-31-tanstack-table-wrapper.md`

- [x] **Step 1: 删除 TanStack 依赖与导出接线**
- [x] **Step 2: 删除 TanStack 组件、内部实现、源码测试与无用资产**
- [x] **Step 3: 更新 lockfile，确保仓库不再残留 TanStack 依赖引用**

### Task 3: 实现 `ObTable` 最小兼容层

**Files:**

- Create: `packages/ui/src/components/table/Table.vue`
- Modify: `packages/ui/src/components/table/types.ts`
- Modify: `packages/ui/src/components/table/VxeTable.vue`
- Modify: `packages/ui/src/styles/table-theme.css`
- Modify: `packages/ui/src/styles/vxe-theme.css`

- [x] **Step 1: 复用 `ObVxeTable` 契约，定义 `ObTable` props/emits/expose**
- [x] **Step 2: 实现列递归渲染，兼容 `slot/headerSlot/cellRenderer/headerRenderer/children/hide`**
- [x] **Step 3: 实现分页、排序、多选、空值占位、空态图片、中文分页、树表与懒加载桥接**
- [x] **Step 4: 对齐共享样式 token，确保与 `ObVxeTable` 视觉一致**
- [x] **Step 5: 回跑 `packages/ui` 定向源码测试，确认 GREEN**

## Chunk 3: admin 页面切换与规则文档更新

### Task 4: 将 5 个灰度页面切换到 `ObTable`

**Files:**

- Modify: `apps/admin/src/modules/LogManagement/login-log/list.vue`
- Modify: `apps/admin/src/modules/adminManagement/menu/list.vue`
- Modify: `apps/admin/src/modules/adminManagement/role/list.vue`
- Modify: `apps/admin/src/modules/adminManagement/role-assign/list.vue`
- Modify: `apps/admin/src/modules/adminManagement/org/list.vue`
- Modify: `apps/admin/src/modules/adminManagement/org/columns.tsx`

- [x] **Step 1: 按 TanStack 前页面结构回收模板，只把表格主体切到 `ObTable`**
- [x] **Step 2: 保留组织管理当前 `ellipsis/showOverflowTooltip/treeNode` 等业务配置**
- [x] **Step 3: 跑 5 个页面源码测试，确认页面接线正确**

### Task 5: 更新规则与文档口径

**Files:**

- Modify: `packages/ui/AGENTS.md`
- Modify: `apps/admin/AGENTS.md`
- Modify: `apps/docs/docs/guide/admin-agent-redlines.md`
- Modify: `apps/docs/docs/guide/table-vxe-migration.md`
- Modify: `docs/plans/2026-03-31-element-table-wrapper-design.md`
- Modify: `docs/plans/2026-03-31-element-table-wrapper-plan.md`

- [x] **Step 1: 把“只允许 `ObVxeTable`”收口为“统一使用 `ObVxeTable` 或 `ObTable`，禁止直接 `<el-table>`”**
- [x] **Step 2: 文档移除 TanStack 现行方案，补充 `ObTable` 接入说明**

## Chunk 4: 验证、记录与提交

### Task 6: 记录 `.codex` 证据并跑完整验证

**Files:**

- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`
- Modify: `.codex/verification/2026-03-31.md`

- [x] **Step 1: 记录本轮边界：保留 `dea7b24`、`9c359a5`，不处理 5 个无关脏文件**
- [x] **Step 2: 运行以下验证命令并记录结果**
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm exec vp test run packages/ui/src/table-source.test.ts packages/ui/src/index.test.ts packages/ui/src/plugin.test.ts`
  - `pnpm -C apps/admin test:run:file -- src/modules/LogManagement/login-log/list.source.test.ts src/modules/adminManagement/menu/list.source.test.ts src/modules/adminManagement/role/list.source.test.ts src/modules/adminManagement/role-assign/list.source.test.ts src/modules/adminManagement/org/list.source.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- [x] **Step 3: 按模块拆分中文提交**
