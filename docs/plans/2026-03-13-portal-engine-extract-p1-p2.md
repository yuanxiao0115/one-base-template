# Portal Engine P1/P2 并行下沉 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 PortalManagement 设计工作台剩余编排逻辑继续下沉到 `packages/portal-engine`，让 admin 进一步收敛为消费者。

**Architecture:** 以“组件下沉 + 编排下沉 + 会话状态机下沉”三段推进：先迁移预览舞台组件并补可测交互函数，再沉淀当前页动作编排，最后抽离页面设置会话状态机并接入 admin 页面。每段独立验证并单独提交。

**Tech Stack:** Vue 3 + TypeScript + Vitest + pnpm monorepo

---

## Chunk 1: 预览舞台组件下沉

### Task 1: 下沉 PortalDesignerPreviewFrame 与交互纯函数

**Files:**
- Create: `packages/portal-engine/src/editor/PortalDesignerPreviewFrame.vue`
- Create: `packages/portal-engine/src/editor/preview-stage-utils.ts`
- Test: `packages/portal-engine/src/editor/preview-stage-utils.test.ts`
- Modify: `packages/portal-engine/src/index.ts`
- Modify: `apps/admin/src/modules/PortalManagement/designPage/pages/PortalTemplateSettingPage.vue`
- Delete: `apps/admin/src/modules/PortalManagement/designPage/components/portal-template/PortalDesignerPreviewFrame.vue`

- [x] 写交互纯函数失败测试并运行
- [x] 实现预览舞台纯函数与组件下沉
- [x] admin 替换为引擎导出组件
- [x] 运行 `packages/portal-engine` 单测 + `portal-engine/admin` typecheck
- [x] 模块提交

## Chunk 2: 当前页动作编排下沉

### Task 2: 下沉 usePortalCurrentTabActions

**Files:**
- Create: `packages/portal-engine/src/editor/current-tab-actions.ts`
- Test: `packages/portal-engine/src/editor/current-tab-actions.test.ts`
- Modify: `packages/portal-engine/src/index.ts`
- Modify: `apps/admin/src/modules/PortalManagement/designPage/pages/PortalTemplateSettingPage.vue`
- Delete: `apps/admin/src/modules/PortalManagement/designPage/composables/portal-template/usePortalCurrentTabActions.ts`

- [x] 写动作分支失败测试并运行
- [x] 实现引擎版动作编排
- [x] admin 改为直接消费引擎 composable
- [x] 运行 `packages/portal-engine` 单测 + `portal-engine/admin` typecheck
- [x] 模块提交

## Chunk 3: 页面设置会话状态机下沉

### Task 3: 抽离页面设置会话状态机

**Files:**
- Create: `packages/portal-engine/src/editor/page-settings-session.ts`
- Test: `packages/portal-engine/src/editor/page-settings-session.test.ts`
- Modify: `packages/portal-engine/src/index.ts`
- Modify: `apps/admin/src/modules/PortalManagement/designPage/pages/PortalTemplateSettingPage.vue`

- [x] 写会话状态机失败测试并运行
- [x] 实现锁定/保存/回滚状态机
- [x] admin 页面接入会话状态机
- [x] 运行 `packages/portal-engine` 单测 + `portal-engine/admin` typecheck
- [x] 模块提交

## Chunk 4: 文档与回归

### Task 4: 文档同步与全量验证

**Files:**
- Modify: `apps/docs/docs/guide/portal-engine.md`
- Modify: `apps/docs/docs/guide/portal-designer.md`
- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

- [x] 文档补充 P1/P2 下沉与 admin 消费方式
- [x] 全量执行 `typecheck/lint/build` 回归
- [x] 更新 `.codex` 三份执行记录
- [x] 模块提交
