# UserManagement 用户管理迁移实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在当前仓库完整迁移 `/system/user` 功能，并沉淀可配置导入上传组件 `ObImportUpload`。

**Architecture:** 采用 Position/Org 一致的 feature-first 结构；页面层仅负责编排，数据映射与接口契约下沉到 `api.ts` / `form.ts` / `utils`，上传能力沉淀到 `packages/ui` 并通过插件统一注册。

**Tech Stack:** Vue 3 + TypeScript + Element Plus + useTable + useCrudContainer + VxeTable。

---

### Task 1: 新增 UI 上传组件 `ObImportUpload`

**Files:**
- Create: `packages/ui/src/components/upload/ImportUpload.vue`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/plugin.ts`

**Step 1:** 定义 `ImportUpload` props/emit（request、limit、maxSizeMb、accept、extensions、successCode、resolveSuccess）。

**Step 2:** 实现上传前校验（文件数量、扩展名、大小）和错误提示。

**Step 3:** 实现自定义上传请求回调，支持成功判定策略与 `uploaded/failed` 事件。

**Step 4:** 接入默认按钮与插槽，保持“点击按钮上传”交互。

**Step 5:** 在 `index.ts` 与 `plugin.ts` 中导出并注册组件。

### Task 2: 搭建 User 模块骨架与接口契约

**Files:**
- Create: `apps/admin/src/modules/UserManagement/user/api.ts`
- Create: `apps/admin/src/modules/UserManagement/user/form.ts`
- Create: `apps/admin/src/modules/UserManagement/user/const.ts`
- Create: `apps/admin/src/modules/UserManagement/user/columns.tsx`
- Create: `apps/admin/src/modules/UserManagement/user/utils/buildUserListParams.ts`
- Create: `apps/admin/src/modules/UserManagement/user/utils/dragSort.ts`

**Step 1:** 定义用户列表、详情、新增/编辑、状态、重置密码、修改账号、关联账号、导入等 API。

**Step 2:** 实现响应字段 normalize 与 payload builder（老项目字段兼容到当前模型）。

**Step 3:** 在 `form.ts` 定义默认表单、校验规则、`toUserForm`、`toUserPayload`。

**Step 4:** 在 `columns.tsx` 定义列表列与 slot 列（含操作列、拖拽列插槽）。

**Step 5:** 在 `utils` 实现列表参数构建和拖拽排序 payload/数组位移能力。

### Task 3: 实现用户管理页面与子组件

**Files:**
- Create: `apps/admin/src/modules/UserManagement/user/page.vue`
- Create: `apps/admin/src/modules/UserManagement/user/components/UserSearchForm.vue`
- Create: `apps/admin/src/modules/UserManagement/user/components/UserEditForm.vue`
- Create: `apps/admin/src/modules/UserManagement/user/components/UserAccountForm.vue`
- Create: `apps/admin/src/modules/UserManagement/user/components/UserBindAccountForm.vue`
- Modify: `apps/admin/src/modules/UserManagement/routes.ts`
- Copy: `/Users/haoqiuzhi/code/sczfw/standard-oa-web-sczfw/public/组织用户导入模板.xlsx -> apps/admin/public/组织用户导入模板.xlsx`

**Step 1:** 实现左侧组织树 + 右侧列表编排（OneTableBar + ObVxeTable），接入 `useTable`。

**Step 2:** 实现批量启停、重置密码、删除确认（二次输入姓名）及消息反馈。

**Step 3:** 实现 `useCrudContainer` 用户新增/编辑/查看弹层（`UserEditForm`）。

**Step 4:** 实现修改账号弹层（`UserAccountForm`）与关联账号弹层（`UserBindAccountForm`）。

**Step 5:** 接入 `ObImportUpload`（不含模板下载）+ 页面模板下载按钮 + 组织内拖拽排序。

**Step 6:** 注册 `/system/user` 路由。

### Task 4: 文档与验证

**Files:**
- Modify: `apps/docs/docs/guide/crud-module-best-practice.md`
- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

**Step 1:** 补充“用户管理完整迁移 + 上传组件沉淀”章节（实现要点与文件路径）。

**Step 2:** 执行验证命令并记录结果：
- `pnpm -C packages/ui typecheck`
- `pnpm -C apps/admin typecheck`
- `pnpm -C apps/admin lint`
- `pnpm -C apps/admin build`
- `pnpm -C apps/docs build`

**Step 3:** 将关键操作、测试、验证结论同步写入 `.codex` 三个日志文件。

