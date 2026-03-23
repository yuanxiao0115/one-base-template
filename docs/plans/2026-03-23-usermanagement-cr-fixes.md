# UserManagement CR 修复 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复 UserManagement 本轮 code review 暴露的稳定性、标准一致性、首屏加载与测试覆盖问题。

**Architecture:** 以最小改动修复真实风险，优先收敛 `role-assign` 的差量保存、过期请求保护、展示语义与错误处理；同时收敛 `user` 页首屏加载和下载路径，并补齐更接近真实交互的测试。保持既有目录与 composable 边界，不引入新抽象层。

**Tech Stack:** Vue 3 + TypeScript + Vitest + Vue Test Utils + pnpm Monorepo

---

## Chunk 1: 测试先行

### Task 1: 为 role-assign 关键风险补失败测试

**Files:**

- Modify: `apps/admin/src/modules/UserManagement/role-assign/components/RoleAssignMemberSelectForm.unit.test.ts`
- Modify: `apps/admin/src/modules/UserManagement/role-assign/composables/useRoleAssignRoleSidebar.unit.test.ts`
- Modify: `apps/admin/src/modules/UserManagement/role-assign/composables/useRoleAssignPageState.unit.test.ts`
- Create/Modify: `apps/admin/src/modules/UserManagement/role-assign/composables/useRoleAssignMemberDialog.unit.test.ts`

- [x] 补“初始化已选信息显示手机号优先”的失败测试
- [x] 补“角色搜索慢响应不覆盖快响应”的失败测试
- [x] 补“添加人员弹层初始化失败不产生未处理异常”的失败测试
- [x] 补“删除成功但新增失败时执行补偿”的失败测试

### Task 2: 为 user 关键链路补失败测试

**Files:**

- Modify: `apps/admin/src/modules/UserManagement/user/components/UserBindAccountForm.unit.test.ts`
- Modify: `apps/admin/src/modules/UserManagement/user/composables/useUserCrudState.unit.test.ts`
- Create/Modify: `apps/admin/src/modules/UserManagement/user/composables/useUserDialogState.integration.unit.test.ts`

- [x] 补“父层初始账号 -> 子表单展示 -> 提交”的链路测试
- [x] 补“下载模板走 baseUrl”的失败测试
- [x] 补“首屏只阻塞组织树，不额外阻塞职位/角色选项”的失败测试

## Chunk 2: 实现修复

### Task 3: 修 role-assign 实现

**Files:**

- Modify: `apps/admin/src/modules/UserManagement/role-assign/composables/useRoleAssignMemberDialog.ts`
- Modify: `apps/admin/src/modules/UserManagement/role-assign/composables/useRoleAssignRoleSidebar.ts`
- Modify: `apps/admin/src/modules/UserManagement/role-assign/components/RoleAssignMemberSelectForm.vue`
- Modify: `apps/admin/src/modules/UserManagement/role-assign/types.ts`

- [ ] 已选成员展示改为“手机号优先，账号兜底”
- [ ] 角色列表请求增加过期响应保护
- [ ] 选择器根节点初始化改为可控错误处理
- [ ] 角色成员差量保存加入补偿逻辑，避免部分成功静默落库

### Task 4: 修 user 实现

**Files:**

- Modify: `apps/admin/src/modules/UserManagement/user/composables/useUserCrudState.ts`
- Modify: `apps/admin/src/modules/UserManagement/user/composables/useUserDialogState.ts`
- Modify: `apps/admin/src/modules/UserManagement/user/components/UserBindAccountForm.vue`

- [x] 下载模板改为尊重应用 `baseUrl`
- [x] 首屏只预加载组织树，职位/角色选项延后到编辑态
- [x] 低层表单组件不直接承担全局错误提示策略

## Chunk 3: 文档、验证与收尾

### Task 5: 同步文档与验证记录

**Files:**

- Modify: `apps/docs/docs/guide/admin-agent-redlines.md`
- Modify: `docs/plans/2026-03-20-role-assign-page-state-split.md`
- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

- [x] 修正文档中与实现冲突的参考口径
- [x] 为旧计划补执行结果/完成说明
- [x] 记录本轮修复与验证结论

### Task 6: 回归验证

**Files:**

- Verify only

- [x] `pnpm -C apps/admin test:run:file -- ...UserManagement...`
- [x] `pnpm -C apps/admin typecheck`
- [x] `pnpm -C apps/admin lint:arch`
- [x] `pnpm -C apps/admin lint`
- [x] `pnpm -C apps/admin build`
- [x] `pnpm check:admin:bundle`
- [x] `pnpm -C apps/docs build`

## 执行结果（2026-03-23）

- `role-assign` 已补齐本轮 CR 关注的稳定性问题：角色搜索过期响应保护、成员差量保存补偿回滚、已选成员手机号优先展示、根节点初始化异常兜底。
- `user` 已补齐本轮 CR 关注的性能与可维护性问题：首屏只阻塞组织树、模板下载尊重 `baseUrl`、关联账号搜索错误提示下沉到 `useUserDialogState`、页面保持场景对象编排但通过 `reactive(...)` 提供模板友好视图。
- 文档与记录已同步到 `apps/docs/docs/guide/admin-agent-redlines.md`、`docs/plans/2026-03-20-role-assign-page-state-split.md` 以及 `.codex/*.md`。
