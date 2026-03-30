# Document Form Phase 1 Univer 画布 MVP Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将公文设计器收敛为稳定可用的 `Univer` 画布编辑 MVP，只保留设计态草稿编辑主链。

**Architecture:** 页面层退化为草稿壳，Workbench 继续做编排，Inspector 只保留 Phase 1 必要面板，所有模板写操作统一通过 controller。`UniverDocumentCanvas` 只负责实例生命周期、结构渲染、选区/拖拽事件和快照保存，并补足外部 `activeRange` 到画布选区的安全同步。

**Tech Stack:** Vue 3 `<script setup>`、TypeScript、Univer Presets、vite-plus test、VitePress

---

## Chunk 1: Phase 1 边界与红灯用例

### Task 1: 补 Phase 1 计划与设计文档

**Files:**

- Create: `docs/plans/2026-03-30-document-form-phase1-univer-design.md`
- Create: `docs/plans/2026-03-30-document-form-phase1-univer-plan.md`

- [ ] **Step 1: 写设计文档**
  - 明确 Phase 1 目标、暂停范围、主链职责和验收标准。
- [ ] **Step 2: 写实施计划**
  - 将实现拆成页面壳、Inspector、Controller、Canvas、验证五个子块。

### Task 2: 先补红灯测试锁定主链

**Files:**

- Modify: `packages/document-form-engine/tests/designer-controller.test.ts`
- Modify: `packages/document-form-engine/tests/designer-state.test.ts`
- Create or Modify: `apps/admin/src/modules/DocumentFormManagement/services/template-service.unit.test.ts`

- [ ] **Step 1: 增加失败测试**
  - 断言 `selectPlacement()` 与外部选区同步的行为稳定。
  - 断言删除 placement 后选区会回退到有效区域。
  - 断言设计页草稿链路不依赖发布 / 回滚 / 预览控件。
- [ ] **Step 2: 跑 RED**
  - `pnpm -C packages/document-form-engine test:run -- tests/designer-controller.test.ts tests/designer-state.test.ts`
  - `pnpm -C apps/admin test:run:file -- src/modules/DocumentFormManagement/services/template-service.unit.test.ts`

## Chunk 2: 页面与 Inspector 降级收口

### Task 3: 设计页改成草稿编辑壳

**Files:**

- Modify: `apps/admin/src/modules/DocumentFormManagement/designPage/DocumentFormDesignerPage.vue`

- [ ] **Step 1: 移除 Phase 1 外能力**
  - 去掉预览、发布、回滚、历史版本 UI 和对应状态。
- [ ] **Step 2: 只保留草稿主链**
  - 页面只处理 `ensureDraft`、`updateDraft`、返回列表。

### Task 4: Inspector 只保留 Phase 1 必要面板

**Files:**

- Modify: `packages/document-form-engine/designer/DocumentPropertyInspector.vue`

- [ ] **Step 1: 收缩面板**
  - 保留 `画布设置 / 组件设置`。
  - 移除结构视图入口，避免继续暴露本期不维护的能力。
- [ ] **Step 2: 保持 Univer 原生能力提示**
  - 表格线、边框、字体、底色、合并继续走 `Univer` 原生能力。

## Chunk 3: Controller / State / Canvas 稳定化

### Task 5: Controller 和 State 收紧为单主链

**Files:**

- Modify: `packages/document-form-engine/designer/useDocumentDesignerController.ts`
- Modify: `packages/document-form-engine/designer/useDocumentDesignerState.ts`
- Modify: `packages/document-form-engine/designer/DocumentDesignerWorkbench.vue`

- [ ] **Step 1: 保持显式 action 写入**
  - 所有模板变更继续走 controller。
- [ ] **Step 2: 补选区同步约束**
  - `activeRange`、`selectedPlacementId`、`selectedPlacement` 三者保持一致。
- [ ] **Step 3: 控制 Workbench 只接线不持状态**
  - 不在 Workbench 新增深监听或额外副作用。

### Task 6: 修正 Univer 画布选区 / 拖拽 / 快照链路

**Files:**

- Modify: `packages/document-form-engine/designer/UniverDocumentCanvas.vue`

- [ ] **Step 1: 先写失败测试**
  - 锁定 placement 删除 / 选中 / 选区回退的边界行为。
- [ ] **Step 2: 实现最小修复**
  - 增加外部 `activeRange` 到 `Univer` 的安全同步。
  - 区分结构重绘和选区同步，避免每次选区变化都触发全量重绘。
  - 在 worksheet / workbook 已失效时短路，避免 `getConfig/getSheetId`。
  - 保持快照清洗与去重，避免样式回滚。
- [ ] **Step 3: 跑 GREEN**
  - `pnpm -C packages/document-form-engine test:run -- tests/designer-controller.test.ts tests/designer-state.test.ts`
  - `pnpm -C packages/document-form-engine typecheck`

## Chunk 4: 文档、浏览器验证与提交

### Task 7: 同步文档与 `.codex` 记录

**Files:**

- Modify: `apps/docs/docs/guide/document-form-designer.md`
- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`
- Create or Modify: `.codex/verification/2026-03-30.md`

- [ ] **Step 1: 更新文档口径**
  - 标注当前只交付 Phase 1：设计态草稿编辑 MVP。
- [ ] **Step 2: 同步操作与验证记录**
  - 记录本期删减范围、验证命令和遗留风险。

### Task 8: 验证并提交

**Files:**

- Modify: `packages/document-form-engine/**`
- Modify: `apps/admin/src/modules/DocumentFormManagement/**`
- Modify: `apps/docs/docs/guide/document-form-designer.md`
- Modify: `.codex/**`

- [ ] **Step 1: 运行验证**
  - `pnpm -C packages/document-form-engine test:run -- tests/designer-controller.test.ts tests/designer-state.test.ts`
  - `pnpm -C packages/document-form-engine typecheck`
  - `pnpm -C apps/admin test:run:file -- src/modules/DocumentFormManagement/services/template-service.unit.test.ts`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- [ ] **Step 2: 浏览器回归**
  - 进入 `/document-form/design`
  - 插入字段可见
  - 修改样式不回滚
  - 刷新后草稿仍在
- [ ] **Step 3: 提交**
  - `git add` 本次改动文件
  - `git commit -m "refactor: 收敛公文设计器 phase1 univer 画布主链"`
