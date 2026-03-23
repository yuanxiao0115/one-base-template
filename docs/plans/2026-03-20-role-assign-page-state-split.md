# RoleAssign 页面状态继续拆分 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 继续收敛 `role-assign` 页的页面状态，让 `useRoleAssignPageState` 只保留页面编排职责。

**Architecture:** 保持现有页面契约不变，把仍滞留在 `useRoleAssignPageState.ts` 中的“角色侧栏状态”和“成员列表状态/移除动作”拆到独立 composable。页面 `list.vue` 继续只消费场景对象，成员弹窗仍由 `useRoleAssignMemberDialog` 负责。

**Tech Stack:** Vue 3 Composition API + TypeScript + `@one-base-template/core/useTable` + Vitest

---

### Task 1: 补结构性回归测试

**Files:**

- Create: `apps/admin/src/modules/UserManagement/role-assign/composables/useRoleAssignRoleSidebar.unit.test.ts`
- Create: `apps/admin/src/modules/UserManagement/role-assign/composables/useRoleAssignMemberTable.unit.test.ts`

- [x] **Step 1: 写失败测试**
- [x] **Step 2: 运行定向测试确认失败**
- [x] **Step 3: 以最小实现通过测试**
- [x] **Step 4: 回归 `useRoleAssignPageState.unit.test.ts`**

### Task 2: 拆出角色侧栏与成员列表 composable

**Files:**

- Create: `apps/admin/src/modules/UserManagement/role-assign/composables/useRoleAssignRoleSidebar.ts`
- Create: `apps/admin/src/modules/UserManagement/role-assign/composables/useRoleAssignMemberTable.ts`
- Modify: `apps/admin/src/modules/UserManagement/role-assign/composables/useRoleAssignPageState.ts`

- [x] **Step 1: 角色侧栏只负责角色列表、关键字、当前角色切换**
- [x] **Step 2: 成员列表只负责表格查询、关键字、批量选择与移除动作**
- [x] **Step 3: `useRoleAssignPageState` 改成组合层，只做组装与启动加载**

### Task 3: 全量回归与提交

**Files:**

- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

- [x] **Step 1: 跑 `role-assign` 定向测试**
- [x] **Step 2: 跑 `src/modules/UserManagement` 回归**
- [x] **Step 3: 跑 `typecheck/lint/lint:arch/apps/docs lint/apps/docs build`**
- [x] **Step 4: 记录验证结果并提交中文 commit**

## 执行结果（2026-03-23 补记）

- 已完成 `useRoleAssignRoleSidebar.ts`、`useRoleAssignMemberTable.ts` 的职责拆分，`useRoleAssignPageState.ts` 仅保留组合层与启动加载。
- 页面消费层 `role-assign/list.vue` 保持场景对象编排契约稳定，本次拆分没有把复杂度重新推回页面。
- 对应验证与提交结论已落到 `.codex/testing.md`、`.codex/verification.md`，该计划可视为已执行完成。
