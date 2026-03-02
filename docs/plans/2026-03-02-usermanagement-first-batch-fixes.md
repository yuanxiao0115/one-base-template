# UserManagement 第一批高优修复 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 修复 UserManagement 当前最高优先级的正确性与交互问题，降低回归风险并统一行为。

**Architecture:** 采用“小步快跑 + 最小侵入”策略，先修共享归一化函数与组织管理员弹窗关键逻辑，再消除首屏重复查询与伪排序交互。仅改动必要文件，不引入新抽象层。

**Tech Stack:** Vue 3 + TypeScript + Element Plus + @one-base-template/core hooks + Vitest（packages/core）

---

### Task 1: 修复共享归一化正确性

**Files:**
- Modify: `apps/admin/src/shared/api/normalize.ts`
- Modify: `apps/admin/src/modules/UserManagement/org/api.ts`
- Test: `packages/core/src/hooks/__tests__/admin-normalize-compat.test.ts`

**Step 1: 写失败测试（RED）**
- 覆盖 `toNullableNumber('abc') === null`
- 覆盖 `toBooleanValue('0') === false`

**Step 2: 运行测试确认失败**
- Run: `pnpm -C packages/core test:run src/hooks/__tests__/admin-normalize-compat.test.ts`

**Step 3: 最小实现（GREEN）**
- 修正 `toNullableNumber`：对字符串先显式 `Number(value)`，非法值返回 `null`
- `org/api.ts` 将 `isExternal: Boolean(row.isExternal)` 改为 `toBooleanValue(row.isExternal)`

**Step 4: 再跑测试确认通过**
- Run: `pnpm -C packages/core test:run src/hooks/__tests__/admin-normalize-compat.test.ts`

### Task 2: 修复组织管理员弹窗交互死路与初始化竞态

**Files:**
- Modify: `apps/admin/src/modules/UserManagement/org/components/OrgManagerDialog.vue`

**Step 1:** 允许“清空后保存”路径：`selectedUsers` 为空时跳过 add，仅执行 remove 分支。

**Step 2:** 合并 `modelValue` + `orgId` 双监听为单一监听，避免重复 `initDialog()`。

**Step 3:** 增加初始化令牌，避免旧请求回写新状态。

**Step 4:** 定向 lint 验证。

### Task 3: 消除首屏重复查询与伪排序

**Files:**
- Modify: `apps/admin/src/modules/UserManagement/user/page.vue`
- Modify: `apps/admin/src/modules/UserManagement/org/page.vue`
- Modify: `apps/admin/src/modules/UserManagement/org/columns.tsx`

**Step 1:** 在 user/org 的 `tableOpt.query` 设置 `immediate: false`，保留 `onMounted` 的显式查询触发。

**Step 2:** 移除 `org/columns.tsx` 中未接入实现的 `sortable: 'custom'`。

**Step 3:** 跑 admin 侧定向 lint + typecheck。

### Task 4: 文档与验证记录同步

**Files:**
- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

**Step 1:** 记录本批次改动、命令与结果。

**Step 2:** 标注风险与后续第二批建议（大文件拆分、唯一性校验收敛）。
