# UserManagement 全模块横向推广 Standardization Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `apps/admin/src/modules/UserManagement/**` 下全部子模块按当前 admin CRUD/可读性基线完成横向收口，统一页面编排与场景对象语义。

**Architecture:** 保持既有业务行为不变，仅收敛页面编排层。对已达标模块不重复改造；对仍存在“平铺解构过多 ref/action”模块统一改为 `table/editor/dialogs/options + reactive(...)` 投影模式。

**Tech Stack:** Vue 3 + TypeScript + `@one-base-template/core` + `@one-base-template/ui` + VitePress。

---

## Chunk 1: 差异冻结

### Task 1: 全量扫描 UserManagement 子模块并确认范围

**Files:**

- Verify only: `apps/admin/src/modules/UserManagement/**`

- [x] 扫描 `org / position / role / role-assign / user` 的 `list.vue + api.ts + routes.ts`
- [x] 确认红线项无回退：`page.vue`、`ElMessage/ElMessageBox`、`api.ts` 类型中转/HTTP 包装、`list.vue` 中 `el-table/el-dialog/el-upload`
- [x] 冻结本轮范围为“页面编排层可读性横向收口”，不扩展到跨包改造

## Chunk 2: 代码收口

### Task 2: 统一 `position/role/org` 列表页场景对象编排

**Files:**

- Modify: `apps/admin/src/modules/UserManagement/position/list.vue`
- Modify: `apps/admin/src/modules/UserManagement/role/list.vue`
- Modify: `apps/admin/src/modules/UserManagement/org/list.vue`

- [x] `list.vue` 脚本统一为 `const { refs, actions } = pageState` + `reactive(pageState.table/editor/dialogs/options)`
- [x] 模板统一通过场景对象消费状态，不再平铺大量变量
- [x] 保持 CRUD 流程、按钮行为、路由与接口调用语义不变

## Chunk 3: 文档与验证

### Task 3: 同步文档与执行门禁

**Files:**

- Modify: `apps/docs/docs/guide/admin-agent-redlines.md`
- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

- [x] 补充 UserManagement 横向推广落地说明（作用域与参考实现）
- [x] 执行 `pnpm -C apps/admin lint:arch`
- [x] 执行 `pnpm -C apps/admin typecheck`
- [x] 执行 `pnpm -C apps/admin lint`
- [x] 执行 `pnpm -C apps/admin build`
- [x] 执行 `pnpm -C apps/docs lint`
- [x] 执行 `pnpm -C apps/docs build`

## 执行结果（2026-03-23）

- 已完成 UserManagement 全模块扫描，红线类结构问题无新增回退。
- 已将 `position/role/org` 列表页统一为与 `user/role-assign` 一致的场景对象编排模式。
- 本轮不涉及业务接口、字段契约、弹窗流程改动，属于结构化可读性横向推广。
