# TanStack Table 封装（UI 先行）Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 在 `packages/ui` 新增 `ObTanStackTable`，保持与现有 `ObVxeTable` 的交互与视觉一致，并支持主题 token 配置。

**Architecture:** 采用“并存而非替换”策略：保留 `ObVxeTable`，新增 `ObTanStackTable`，对外 API 对齐，分页继续复用现有分页呈现规范。主题通过共享 `table-theme.css` 收口，避免两套表格样式分叉。

**Tech Stack:** Vue 3、TypeScript、Element Plus、TanStack Table、TanStack Virtual、现有 `@one-base-template/ui` 插件体系。

---

## Chunk 1: 兼容契约与测试基线

### Task 1: 冻结兼容矩阵并补充源码契约测试

**Files:**

- Create: `.codex/context-table-tanstack-compat.md`
- Create: `packages/ui/src/tanstack-table-source.test.ts`
- Modify: `packages/ui/src/index.test.ts`
- Modify: `packages/ui/src/plugin.test.ts`

- [x] **Step 1: 先写失败测试（RED）**
- [x] **Step 2: 运行测试确认失败**
- [x] **Step 3: 按契约补齐最小实现**
- [x] **Step 4: 运行测试确认通过（GREEN）**
- [x] **Step 5: 自检并记录风险**

## Chunk 2: 组件实现与主题收口

### Task 2: 新增 TanStack 表格组件与内部引擎

**Files:**

- Create: `packages/ui/src/components/table/TanStackTable.vue`
- Create: `packages/ui/src/components/table/internal/tanstack-engine.ts`
- Create: `packages/ui/src/components/table/internal/tanstack-pagination.ts`
- Modify: `packages/ui/src/components/table/types.ts`

- [x] **Step 1: 先写失败测试（RED）**
- [x] **Step 2: 最小实现 props/emits/expose**
- [x] **Step 3: 完成列适配、选择、排序、分页、树形展开**
- [x] **Step 4: 运行类型检查与测试**
- [x] **Step 5: 自检并记录风险**

### Task 3: 表格主题 token 收口

**Files:**

- Create: `packages/ui/src/styles/table-theme.css`
- Modify: `packages/ui/src/styles/vxe-theme.css`
- Modify: `packages/ui/src/components/table/VxeTable.vue`
- Modify: `packages/ui/src/components/table/TanStackTable.vue`

- [x] **Step 1: 抽取共享 token（颜色/间距/滚动条/分页）**
- [x] **Step 2: 接入 TanStack 与 VXE 两端**
- [x] **Step 3: 运行 lint/typecheck**
- [x] **Step 4: 自检样式一致性**

## Chunk 3: 导出接线、构建验证与文档

### Task 4: 插件注册与导出能力

**Files:**

- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/plugin.ts`

- [x] **Step 1: 新增导出 `TanStackTable` 与类型导出**
- [x] **Step 2: 新增 `ObTanStackTable` 全局注册**
- [x] **Step 3: 运行相关测试与 typecheck**

### Task 5: 验证与文档同步

**Files:**

- Modify: `apps/docs/docs/guide/table-vxe-migration.md`
- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

- [x] **Step 1: 运行验证命令并记录证据**
  - `pnpm -C packages/ui typecheck`
  - `pnpm -C packages/ui lint`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin build`
  - `pnpm check:admin:bundle`
- [x] **Step 2: 文档补充 TanStack 封装章节与迁移建议**
- [x] **Step 3: `.codex` 记录更新**
