# AdminManagement 第三轮收口 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 收口 adminManagement 四个已确认问题，并在此基础上继续做多维走查。

**Architecture:** 维持现有 adminManagement 结构，不做跨模块重构。优先用局部、可验证的小改动修复竞态、去重重复校验、清理过度防御映射，并统一页面编排基线。

**Tech Stack:** Vue 3、TypeScript、Vitest、Vite Plus Lint

---

### Task 1: tenant-info 权限弹窗竞态收口

**Files:**

- Modify: `apps/admin/src/modules/adminManagement/tenant-info/components/TenantInfoPermissionDialog.vue`
- Test: `apps/admin/src/modules/adminManagement/tenant-info/components/TenantInfoPermissionDialog.unit.test.ts`

- [x] 写回归测试，覆盖“切换租户忽略旧响应”“关闭弹窗忽略旧响应”。
- [x] 运行定向单测并确认当前实现失败。
- [x] 按 `role` 同类实现补齐 load/save token、appliedId、dialog session invalidation。
- [x] 回跑定向单测并确认通过。

### Task 2: OrgLevelManageDialog 收口

**Files:**

- Modify: `apps/admin/src/modules/adminManagement/org/components/OrgLevelManageDialog.vue`

- [x] 删除过度防御性映射。
- [x] 清掉模板内联箭头函数。
- [x] 运行最小必要验证。

### Task 3: role 页面重复校验删除

**Files:**

- Modify: `apps/admin/src/modules/adminManagement/role/composables/useRolePageState.ts`

- [x] 删除 `buildPayload` 与表单规则重复的空值校验。
- [x] 运行最小必要验证。

### Task 4: menu/list 编排对齐

**Files:**

- Modify: `apps/admin/src/modules/adminManagement/menu/list.vue`

- [x] 将页面脚本改为 `table/editor/options` 场景对象薄编排。
- [x] 模板同步切换到场景对象消费。
- [x] 运行最小必要验证。

### Task 5: 整体验证与继续走查

**Files:**

- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification/2026-03-24.md`

- [ ] 运行定向单测、`typecheck`、`lint`、`build`、`check:admin:bundle`。
- [ ] 继续对 `adminManagement` 做架构/性能/维护性/一致性走查。
- [ ] 记录新的 findings 或确认无新增高风险问题。
