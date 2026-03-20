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

- [ ] **Step 1: 写失败测试**
- [ ] **Step 2: 运行定向测试确认失败**
- [ ] **Step 3: 以最小实现通过测试**
- [ ] **Step 4: 回归 `useRoleAssignPageState.unit.test.ts`**

### Task 2: 拆出角色侧栏与成员列表 composable

**Files:**

- Create: `apps/admin/src/modules/UserManagement/role-assign/composables/useRoleAssignRoleSidebar.ts`
- Create: `apps/admin/src/modules/UserManagement/role-assign/composables/useRoleAssignMemberTable.ts`
- Modify: `apps/admin/src/modules/UserManagement/role-assign/composables/useRoleAssignPageState.ts`

- [ ] **Step 1: 角色侧栏只负责角色列表、关键字、当前角色切换**
- [ ] **Step 2: 成员列表只负责表格查询、关键字、批量选择与移除动作**
- [ ] **Step 3: `useRoleAssignPageState` 改成组合层，只做组装与启动加载**

### Task 3: 全量回归与提交

**Files:**

- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

- [ ] **Step 1: 跑 `role-assign` 定向测试**
- [ ] **Step 2: 跑 `src/modules/UserManagement` 回归**
- [ ] **Step 3: 跑 `typecheck/lint/lint:arch/apps/docs lint/apps/docs build`**
- [ ] **Step 4: 记录验证结果并提交中文 commit**
