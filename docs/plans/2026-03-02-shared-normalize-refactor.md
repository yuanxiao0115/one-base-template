# Shared Normalize 沉淀实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 UserManagement 内部 `normalize.ts` 下沉到 admin 共享层，并在至少一个其他模块复用，减少重复映射工具。

**Architecture:** 采用“应用共享层沉淀 + 业务模块按需导入”方案：统一维护 `apps/admin/src/shared/api/normalize.ts`，UserManagement 与 demo 模块共同复用，保证字段归一化行为一致。

**Tech Stack:** Vue 3 + TypeScript + Vite + Monorepo（apps/admin + apps/docs）。

---

### Task 1: 下沉共享 normalize 工具

**Files:**
- Create: `apps/admin/src/shared/api/normalize.ts`
- Delete: `apps/admin/src/modules/UserManagement/shared/normalize.ts`
- Modify: `apps/admin/src/modules/UserManagement/user/api.ts`
- Modify: `apps/admin/src/modules/UserManagement/org/api.ts`

**Step 1:** 在 `apps/admin/src/shared/api/normalize.ts` 复制并整理 `toRecord`、`toStringValue`、`toNumberValue`、`toBooleanValue`、`toNullableNumber`、`extractList`。

**Step 2:** 修改 UserManagement 的 `user/api.ts`、`org/api.ts` 引用路径为 `@/shared/api/normalize`。

**Step 3:** 删除模块内旧文件 `apps/admin/src/modules/UserManagement/shared/normalize.ts`，避免重复维护。

### Task 2: 验证跨模块复用

**Files:**
- Modify: `apps/admin/src/modules/demo/org-management/api.ts`

**Step 1:** 复用共享的 `toStringValue` / `toNumberValue`，删除本地重复实现。

**Step 2:** 确认 `org-management` 的树节点映射逻辑不变，确保行为兼容。

### Task 3: 文档与验证

**Files:**
- Modify: `apps/docs/docs/guide/module-system.md`
- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

**Step 1:** 在模块系统文档补充“跨模块可复用 API normalize 工具”的约定与路径。

**Step 2:** 执行验证命令并记录结果：
- `pnpm -C apps/admin typecheck`
- `pnpm -C apps/docs build`

**Step 3:** 将本次沉淀动作、验证过程与结论同步写入 `.codex` 三个日志文件。
