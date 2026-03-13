# Portal Engine P0 并行下沉 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 PortalManagement 设计器中的预览通信、页面设置服务、Tab 树领域算法下沉到 `packages/portal-engine`，让 admin 更接近纯消费者。

**Architecture:** 在 `portal-engine` 新增 `editor/preview-bridge`、`services/page-settings`、`domain/tab-tree` 三个子域，先以纯函数/可注入 API 服务沉淀，再在 admin 页面层替换调用。所有跨应用差异通过注册注入解决，不在页面内散落协议与兼容代码。

**Tech Stack:** Vue 3 + TypeScript + Vitest + pnpm monorepo

---

## Chunk 1: Preview Bridge（消息协议桥接）

### Task 1: 新增预览消息协议与发送器

**Files:**
- Create: `packages/portal-engine/src/editor/preview-bridge/messages.ts`
- Create: `packages/portal-engine/src/editor/preview-bridge/sender.ts`
- Create: `packages/portal-engine/src/editor/preview-bridge/index.ts`
- Modify: `packages/portal-engine/src/index.ts`
- Test: `packages/portal-engine/src/editor/preview-bridge/sender.test.ts`

- [ ] **Step 1: 写失败测试（sender 能正确构建并发送 3 类消息）**
- [ ] **Step 2: 运行测试确认失败**
  Run: `pnpm -C packages/portal-engine exec vitest run src/editor/preview-bridge/sender.test.ts`
- [ ] **Step 3: 实现 messages/sender/index 导出**
- [ ] **Step 4: 运行测试确认通过**
  Run: `pnpm -C packages/portal-engine exec vitest run src/editor/preview-bridge/sender.test.ts`
- [ ] **Step 5: 提交（中文 commit）**

### Task 2: admin 页面接入 preview-bridge

**Files:**
- Modify: `apps/admin/src/modules/PortalManagement/designPage/pages/PortalTemplateSettingPage.vue`
- Modify: `apps/admin/src/modules/PortalManagement/designPage/pages/PortalPageEditPage.vue`

- [ ] **Step 1: 替换手写消息对象为 bridge helper**
- [ ] **Step 2: 本地类型校验**
  Run: `pnpm -C apps/admin typecheck`
- [ ] **Step 3: 提交（中文 commit）**

## Chunk 2: Tab Tree Domain（领域算法）

### Task 3: 下沉 tab-tree 领域工具并保持 admin 兼容

**Files:**
- Create: `packages/portal-engine/src/domain/tab-tree.ts`
- Create: `packages/portal-engine/src/domain/tab-tree.test.ts`
- Modify: `packages/portal-engine/src/index.ts`
- Modify: `apps/admin/src/modules/PortalManagement/utils/portalTree.ts`

- [ ] **Step 1: 先写失败测试（find/contains/nextSort/editable）**
- [ ] **Step 2: 跑测试确认失败**
  Run: `pnpm -C packages/portal-engine exec vitest run src/domain/tab-tree.test.ts`
- [ ] **Step 3: 实现 domain 工具并导出**
- [ ] **Step 4: admin 兼容层改为转发 portal-engine 实现**
- [ ] **Step 5: 跑测试与类型检查**
  Run: `pnpm -C packages/portal-engine exec vitest run src/domain/tab-tree.test.ts && pnpm -C apps/admin typecheck`
- [ ] **Step 6: 提交（中文 commit）**

## Chunk 3: Page Settings Service（可注入服务）

### Task 4: 下沉页面设置加载/保存服务

**Files:**
- Create: `packages/portal-engine/src/services/page-settings.ts`
- Create: `packages/portal-engine/src/services/page-settings.test.ts`
- Modify: `packages/portal-engine/src/index.ts`
- Modify: `apps/admin/src/modules/PortalManagement/engine/register.ts`
- Modify: `apps/admin/src/modules/PortalManagement/designPage/composables/portal-template/usePortalTabPageSettings.ts`

- [ ] **Step 1: 先写失败测试（load/save + merge + bizOk）**
- [ ] **Step 2: 跑测试确认失败**
  Run: `pnpm -C packages/portal-engine exec vitest run src/services/page-settings.test.ts`
- [ ] **Step 3: 实现可注入 API（set/get/create service）**
- [ ] **Step 4: admin register 注入 tab.detail/tab.update**
- [ ] **Step 5: admin composable 替换为 service 调用**
- [ ] **Step 6: 跑测试与类型检查**
  Run: `pnpm -C packages/portal-engine exec vitest run src/services/page-settings.test.ts && pnpm -C apps/admin typecheck`
- [ ] **Step 7: 提交（中文 commit）**

## Chunk 4: 回归与文档

### Task 5: 全量回归 + 文档同步

**Files:**
- Modify: `apps/docs/docs/guide/portal-engine.md`
- Modify: `apps/docs/docs/guide/portal-designer.md`
- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

- [ ] **Step 1: 文档补充新增下沉能力与 admin 注册方式**
- [ ] **Step 2: 执行回归命令**
  Run: `pnpm -C packages/portal-engine typecheck && pnpm -C packages/portal-engine lint && pnpm -C apps/admin typecheck && pnpm -C apps/admin exec vitest run src/modules/PortalManagement/designPage/components/preview-render/__tests__/PortalPreviewPanel.preview-runtime.test.ts && pnpm -C apps/portal typecheck && pnpm -C apps/docs build`
- [ ] **Step 3: 更新 .codex 三份记录**
- [ ] **Step 4: 提交（中文 commit）**
