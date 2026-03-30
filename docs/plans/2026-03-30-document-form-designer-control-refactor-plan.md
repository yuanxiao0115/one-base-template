# Document Form 设计器控制层重构实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将公文设计器从“页面/Workbench/Canvas 多处直接改模板”的耦合状态，重构为“控制层单点收口 + Canvas 纯 Univer 适配 + Inspector 纯表单编辑”，先恢复设计器稳定可用。

**Architecture:** 保留当前 `schema/template-service/preview` 主链，不推翻 `version: '3'` 协议。新增设计器控制层 composable 作为模板真源，所有设计态变更都通过显式 action 提交；Workbench 只做布局编排，Canvas 只处理 Univer 生命周期与结构化事件，Page 只处理草稿持久化、发布、回滚、预览。

**Tech Stack:** Vue 3 `<script setup>`、TypeScript、Univer Presets、vite-plus test、VitePress

---

## Chunk 1: 控制层与回归基线

### Task 1: 先补控制层红灯用例

**Files:**

- Create: `packages/document-form-engine/tests/designer-controller.test.ts`
- Modify: `packages/document-form-engine/tests/designer-state.test.ts`

- [ ] **Step 1: 写失败测试覆盖控制层职责**
  - 断言外部模板替换时会重置选区/选中项。
  - 断言 `syncUniverSnapshot()` 不会直接回写原对象，而是产出带 envelope 的新模板。
  - 断言 `updateSheetViewport()` 在值未变化时不产生新引用。
  - 断言删除当前 placement 后选区会落到下一个有效 placement 或默认网格。
- [ ] **Step 2: 运行测试确认 RED**
  - Run: `pnpm -C packages/document-form-engine test:run -- tests/designer-controller.test.ts tests/designer-state.test.ts`
  - Expected: FAIL（新控制层尚未存在，或现有状态层无法满足行为）

### Task 2: 新建设计器控制层 composable

**Files:**

- Create: `packages/document-form-engine/designer/useDocumentDesignerController.ts`
- Modify: `packages/document-form-engine/designer/index.ts`

- [ ] **Step 1: 实现最小控制层**
  - 统一维护 `template / activeRange / selectedPlacementId / selectedPlacement / selectedField`。
  - 暴露显式 action：`replaceTemplate`、`insertField`、`selectRange`、`selectPlacement`、`updateField`、`updatePlacement`、`updatePlacementRange`、`updateSheetViewport`、`removeSelectedPlacement`、`syncUniverSnapshot`。
  - 所有写操作都走不可变更新，避免 `deep watch` 递归回流。
- [ ] **Step 2: 运行测试确认 GREEN**
  - Run: `pnpm -C packages/document-form-engine test:run -- tests/designer-controller.test.ts tests/designer-state.test.ts`
  - Expected: PASS

## Chunk 2: Workbench / Canvas / Inspector 职责收口

### Task 3: 重构 Workbench 为纯布局壳

**Files:**

- Modify: `packages/document-form-engine/designer/DocumentDesignerWorkbench.vue`
- Modify: `packages/document-form-engine/designer/DocumentFormDesignerLayout.vue`

- [ ] **Step 1: 移除 Workbench 内部 `template` 深监听**
  - 不再维护 `syncingFromParent + watch(template, { deep: true })`。
  - 由控制层负责接收外部模板并仅在显式 action 后向父层发出 `update:modelValue`。
- [ ] **Step 2: 收敛 Workbench 接线**
  - 工具栏按钮只调用控制层 action。
  - 头部状态、Canvas、Inspector 只消费控制层暴露的只读状态与显式事件。
- [ ] **Step 3: 增加最小组件回归测试或定向源码约束**
  - 至少锁定“Workbench 不再出现 deep watch 回写 modelValue”的约束。

### Task 4: Canvas 收口为 Univer 适配层

**Files:**

- Modify: `packages/document-form-engine/designer/UniverDocumentCanvas.vue`
- Modify: `packages/document-form-engine/schema/template.ts`

- [ ] **Step 1: 清理 Canvas 输入输出边界**
  - 只接收 `template / activeRange / selectedPlacementId`。
  - 只向外发 `select-range / select-placement / update-placement-range / sync-univer-snapshot`。
- [ ] **Step 2: 收紧 Univer 渲染与快照同步**
  - 改为基于结构哈希和快照哈希驱动重绘，不依赖整模板 deep watch 的副作用。
  - 加载快照前过滤掉易导致 `getConfig/getSheetId` 的无效选区或无效 sheet 引用。
  - 当外部 `activeRange` 变化时，只在有效 worksheet 生命周期内同步画布选区。
- [ ] **Step 3: 运行画布相关测试**
  - Run: `pnpm -C packages/document-form-engine test:run -- tests/designer-controller.test.ts tests/designer-state.test.ts tests/schema-v3.test.ts`
  - Expected: PASS

### Task 5: Inspector 收口为纯表单编辑面板

**Files:**

- Modify: `packages/document-form-engine/designer/DocumentPropertyInspector.vue`

- [ ] **Step 1: 去除直接依赖模板写入的逻辑假设**
  - 面板只消费 props 和 emit，不直接持有或推导可变模板对象。
  - 面板分区固定为 `画布设置 / 组件设置 / 结构视图`。
- [ ] **Step 2: 保持 Univer 原生能力提示**
  - 表格线、边框、字体、底色、对齐等继续引导使用 Univer 内置工具栏，不再在 inspector 平行造轮子。

## Chunk 3: 页面持久化、文档与浏览器回归

### Task 6: 页面层只保留草稿生命周期

**Files:**

- Modify: `apps/admin/src/modules/DocumentFormManagement/designPage/DocumentFormDesignerPage.vue`
- Modify: `apps/admin/src/modules/DocumentFormManagement/services/template-service.ts`
- Modify: `apps/admin/src/modules/DocumentFormManagement/services/template-service.unit.test.ts`

- [ ] **Step 1: 收敛页面职责**
  - 页面只处理 `ensureDraft / updateDraft / publishDraft / rollbackToPublished / preview / back`。
  - 不再承担设计器内部选区、组件、快照状态管理。
- [ ] **Step 2: 加强持久化边界测试**
  - 增加历史脏快照恢复时的 normalize / 过滤断言，保证刷新后仍可进入设计页。
- [ ] **Step 3: 运行 admin 定向测试**
  - Run: `pnpm -C apps/admin test:run:file -- src/modules/DocumentFormManagement/services/template-service.unit.test.ts`
  - Expected: PASS

### Task 7: 文档与记录同步

**Files:**

- Modify: `apps/docs/docs/guide/document-form-designer.md`
- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`
- Modify or Create: `.codex/verification/2026-03-30.md`

- [ ] **Step 1: 更新文档口径**
  - 明确“控制层单点真源 + 双预览模式 + 持久化恢复 + Univer 内置样式工具”的现状。
- [ ] **Step 2: 同步操作日志与验证记录**
  - 记录本次重构范围、验证命令、浏览器证据与遗留风险。

### Task 8: 全量验证、浏览器回归与提交

**Files:**

- Modify: `packages/document-form-engine/**`（本次改动文件）
- Modify: `apps/admin/src/modules/DocumentFormManagement/**`（本次改动文件）
- Modify: `apps/docs/docs/guide/document-form-designer.md`
- Modify: `.codex/**`

- [ ] **Step 1: 运行代码验证**
  - `pnpm -C packages/document-form-engine test:run -- tests/designer-controller.test.ts tests/designer-state.test.ts tests/schema-v3.test.ts`
  - `pnpm -C packages/document-form-engine typecheck`
  - `pnpm -C apps/admin typecheck`
  - `pnpm -C apps/admin test:run:file -- src/modules/DocumentFormManagement/services/template-service.unit.test.ts`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- [ ] **Step 2: 浏览器回归（必须使用 `agent-browser --session codex`）**
  - 进入 `/document-form/design` 不报错。
  - 选中单元格后点击字段按钮能稳定插入。
  - 修改 Univer 样式后结构变更不回滚。
  - 刷新后草稿仍在，预览页仍可读取。
- [ ] **Step 3: 提交代码（中文提交信息）**
  - `git add` 本次改动文件
  - `git commit -m "refactor: 重构公文设计器控制层并稳定univer画布"`
