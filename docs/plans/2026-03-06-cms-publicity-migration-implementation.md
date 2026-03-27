# CmsManagement Publicity 迁移实施计划

> 历史命名说明：本文中的 `page.vue` 为迁移当时的编排页命名。当前 admin 现行 CRUD 基线已统一为 `list.vue`，阅读或复用本计划时请按 `list.vue` 对照理解。

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在 `apps/admin` 新增 `CmsManagement` 模块，迁移老项目 publicity 的栏目/内容/审核三页能力并统一 UI 风格。

**Architecture:** 采用模块化静态路由 + 模块内 API 映射 + 页面编排层拆分（`page.vue` 负责编排，`api.ts/form.ts/columns.ts` 负责契约与映射）。权限先使用 `skipMenuAuth` 确保可访问。

**Tech Stack:** Vue 3 `<script setup>` + TypeScript + Element Plus + `@one-base-template/core/ui`。

---

### Task 1: 模块骨架与路由启用

**Files:**

- Create: `apps/admin/src/modules/CmsManagement/module.ts`
- Create: `apps/admin/src/modules/CmsManagement/routes.ts`
- Modify: `apps/admin/public/platform-config.json`

**Steps:**

1. 新建模块 Manifest，id 固定 `cms-management`。
2. 注册 4 条路由：栏目/内容/审核/隐藏文章列表。
3. 在 `enabledModules` 加入 `cms-management`。

### Task 2: 栏目管理页迁移

**Files:**

- Create: `apps/admin/src/modules/CmsManagement/column/{api.ts,columns.ts,form.ts,page.vue}`
- Create: `apps/admin/src/modules/CmsManagement/column/components/{ColumnEditForm.vue,ColumnSearchForm.vue}`

**Steps:**

1. 对接栏目树与增改删 API。
2. 构建树表列与操作列。
3. 以 `ObCrudContainer` 完成新增/编辑/查看。
4. 增加“文章列表”跳转。

### Task 3: 内容管理页迁移

**Files:**

- Create: `apps/admin/src/modules/CmsManagement/content/{api.ts,columns.ts,form.ts,page.vue}`
- Create: `apps/admin/src/modules/CmsManagement/content/components/{ContentEditForm.vue,ContentSearchForm.vue}`

**Steps:**

1. 对接文章分页、详情、新增、更新、删除 API。
2. 构建列表筛选与状态展示。
3. 实现新增/编辑/查看抽屉表单。
4. 兼容 `article-list/:categoryId` 入口默认筛选。

### Task 4: 审核管理页迁移

**Files:**

- Create: `apps/admin/src/modules/CmsManagement/audit/{api.ts,columns.ts,page.vue}`
- Create: `apps/admin/src/modules/CmsManagement/audit/components/{AuditReviewDialog.vue,ArticleAuditPanel.vue,CommentAuditPanel.vue}`

**Steps:**

1. 对接文章审核与评论审核 API。
2. 实现“文章/评论”双页签列表。
3. 实现审核意见弹窗与通过/驳回动作。

### Task 5: 文档与回归

**Files:**

- Modify: `apps/docs/docs/guide/architecture.md`
- Modify: `.codex/{operations-log.md,testing.md,verification.md}`

**Steps:**

1. 同步文档说明 CmsManagement 与 publicity 迁移落点。
2. 运行验证命令并记录结果。
3. 在 `.codex` 三份记录写入本次迁移证据。
