# CMS 内容管理表单 UI 优化实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在不改变业务数据与提交流程的前提下，优化 `publicity/content` 新增/编辑/查看全屏弹窗的表单样式与布局可用性。

**Architecture:** 保持 `ContentEditForm` 现有字段、校验、上传函数和 `defineExpose` 不变，仅重构模板结构与 scoped 样式。采用“顶部双栏分区 + 下方正文/附件全宽分区”的布局，并增加响应式收敛到单栏。

**Tech Stack:** Vue 3 `<script setup>`、Element Plus、Vite、Ultracite lint、vue-tsc。

---

### Task 1: 增加布局约束测试（TDD-RED）

**Files:**

- Modify: `apps/admin/src/modules/CmsManagement/content/cover-upload.source.test.ts`

**Step 1: 写失败测试**

- 增加对 `ContentEditForm.vue` 源码结构断言：要求出现 `content-form-layout`、`content-form-top`、`content-form-panel` 等布局类。

**Step 2: 运行测试确认失败**

- Run: `pnpm -C apps/admin exec vitest run src/modules/CmsManagement/content/cover-upload.source.test.ts`
- Expected: FAIL（当前模板尚未包含新布局类）。

### Task 2: 实现最小布局改造（TDD-GREEN）

**Files:**

- Modify: `apps/admin/src/modules/CmsManagement/content/components/ContentEditForm.vue`

**Step 1: 重构模板分区**

- 新增顶部双栏区域：左侧“基础信息”，右侧“发布信息”。
- 新增下部全宽区域：正文内容、附件资源。
- 保持所有 `prop` 与 `v-model` 字段绑定不变。

**Step 2: 增加样式**

- 新增 panel 外观、间距、网格与响应式样式。
- 保持上传、预览、查看态行为不变，优化视觉层次。

**Step 3: 运行测试确认通过**

- Run: `pnpm -C apps/admin exec vitest run src/modules/CmsManagement/content/cover-upload.source.test.ts`
- Expected: PASS。

### Task 3: 全量校验与记录

**Files:**

- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

**Step 1: 运行校验命令**

- `pnpm -C apps/admin typecheck`
- `pnpm -C apps/admin lint`
- `pnpm -C apps/admin build`
- `pnpm -C apps/docs build`

**Step 2: 记录证据与风险**

- 在 `.codex` 三个文件中补充本次 UI 改造、验证结果与剩余风险（如仅样式改动，无接口风险）。
