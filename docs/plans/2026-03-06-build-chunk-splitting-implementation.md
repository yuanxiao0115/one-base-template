# Build Chunk Splitting Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 通过低风险 `manualChunks` 拆分 `admin` / `portal` / `template` 的构建产物，降低大 chunk warning。

**Architecture:** 保持现有路由与启动链路不变，只在各应用的 `vite.config.ts` 中增加一致的拆包策略；优先拆 vendor、workspace shell 和 admin 重模块，不改运行时业务行为。

**Tech Stack:** Vite 8、Rolldown/Rollup manualChunks、Vue 3、pnpm、Turborepo

---

### Task 1: 固化共享拆包策略

**Files:**
- Create: `scripts/vite/manual-chunks.ts`

**Step 1: 写最小实现**

新增共享 helper，导出：

- `createOneAppManualChunks(options)`
- 负责标准化路径并基于 `id` 返回 chunk 名称

覆盖：
- `vue-vendor`
- `element-plus`
- `vxe`
- `iconify`
- `crypto`
- `sortable-grid`
- `one-core`
- `one-ui`
- `one-tag`
- `portal-engine`
- app 内 feature chunk（admin/portal/template）

**Step 2: 类型检查思路**

通过后续 app build 验证，不单独新增脚本命令。

### Task 2: 接入 admin 的 build 拆包

**Files:**
- Modify: `apps/admin/vite.config.ts`

**Step 1: 接入 helper**

在 `build.rollupOptions.output.manualChunks` 中使用共享 helper。

**Step 2: admin feature chunk**

至少拆出：
- `admin-portal`
- `admin-user-management`
- `admin-system-management`
- `admin-log-management`

### Task 3: 接入 portal / template 的 build 拆包

**Files:**
- Modify: `apps/portal/vite.config.ts`
- Modify: `apps/template/vite.config.ts`

**Step 1: 接入 helper**

portal/template 复用同一 helper，仅拆 vendor + workspace shell + app pages。

### Task 4: 更新文档

**Files:**
- Modify: `apps/docs/docs/guide/development.md`

**Step 1: 记录构建拆包约定**

补充：
- 共享 `manualChunks` helper 的位置
- 为什么当前不直接改异步路由
- 构建 warning 的排查优先级

### Task 5: 验证与记录

**Files:**
- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

**Step 1: 运行验证**

Run:
- `pnpm build`
- `pnpm -C apps/docs lint`

**Step 2: 验证点**

- 构建通过
- 观察 chunk 输出是否已拆分
- 记录 remaining warnings（若还有）
