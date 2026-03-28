# Document Form Univer 画布替换实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `packages/document-form-engine` 设计器中间画布替换为 Univer，并在同一阶段完成节点选中联动与拖拽排版，保持“自定义物料层 + Vue 运行态”主线不变。

**Architecture:** 采用渐进替换方案，仅替换设计态画布实现。`DocumentTemplateSchema` 仍是布局真源，Univer 只负责网格交互与可视编辑，通过桥接函数把网格范围变化回写 `anchor`。运行态渲染器、物料注册与 admin 注入接口保持兼容。

**Tech Stack:** Vue 3 `<script setup>`、TypeScript、Univer Presets（`@univerjs/presets` + `@univerjs/preset-sheets-core`）、Vitest（vite-plus）

---

## Chunk 1: 画布桥接与组件替换

### Task 1: 建立锚点与网格范围桥接（TDD）

**Files:**

- Create: `packages/document-form-engine/designer/canvas-bridge.ts`
- Create: `packages/document-form-engine/tests/designer-canvas-bridge.test.ts`
- Modify: `packages/document-form-engine/designer/index.ts`

- [ ] **Step 1: 先写失败测试（锚点 -> 网格范围）**
  - 断言 `row/col/rowspan/colspan` 能转换为标准范围对象。
- [ ] **Step 2: 运行单测确认 RED**
  - Run: `pnpm -C packages/document-form-engine test:run -- tests/designer-canvas-bridge.test.ts`
  - Expected: FAIL（缺少桥接实现）
- [ ] **Step 3: 写最小实现通过测试**
  - 在 `canvas-bridge.ts` 提供纯函数：锚点转范围、范围转锚点、范围合法化。
- [ ] **Step 4: 运行单测确认 GREEN**
  - Run: `pnpm -C packages/document-form-engine test:run -- tests/designer-canvas-bridge.test.ts`
  - Expected: PASS

### Task 2: 新建 Univer 画布组件并替换旧画布

**Files:**

- Create: `packages/document-form-engine/designer/UniverDocumentCanvas.vue`
- Modify: `packages/document-form-engine/designer/DocumentDesignerWorkbench.vue`
- Modify: `packages/document-form-engine/designer/index.ts`

- [ ] **Step 1: 先写失败测试（拖拽范围回写 anchor）**
  - 在桥接测试里增加“模拟范围变化 -> 生成新 anchor”的断言。
- [ ] **Step 2: 运行单测确认 RED**
  - Run: `pnpm -C packages/document-form-engine test:run -- tests/designer-canvas-bridge.test.ts`
  - Expected: FAIL（尚未支持更新场景）
- [ ] **Step 3: 实现 Univer 组件最小可用版本**
  - 初始化/销毁 Univer 实例。
  - 根据 `template.materials` 在网格中渲染节点标签。
  - 选中单元格时发出 `select(nodeId)`。
  - 拖拽（范围变化）时发出 `update-anchor(nodeId, anchor)`。
- [ ] **Step 4: 替换 `DocumentDesignerWorkbench.vue` 画布引用**
  - 将 `DocumentCanvas` 替换为 `UniverDocumentCanvas`。
  - 透传 `update-anchor` 事件到状态层。
- [ ] **Step 5: 运行单测确认 GREEN**
  - Run: `pnpm -C packages/document-form-engine test:run -- tests/designer-canvas-bridge.test.ts`
  - Expected: PASS

### Task 3: 扩展设计态状态管理支持 anchor 更新

**Files:**

- Modify: `packages/document-form-engine/designer/useDocumentDesignerState.ts`
- Modify: `packages/document-form-engine/tests/runtime.test.ts`

- [ ] **Step 1: 先写失败测试（更新 anchor 后模板应变更）**
  - 通过状态层调用更新函数，断言目标节点 anchor 被替换。
- [ ] **Step 2: 运行测试确认 RED**
  - Run: `pnpm -C packages/document-form-engine test:run -- tests/runtime.test.ts`
  - Expected: FAIL（无更新函数）
- [ ] **Step 3: 写最小实现**
  - 在状态层新增 `updateNodeAnchor(nodeId, anchor)`。
- [ ] **Step 4: 回归确认 GREEN**
  - Run: `pnpm -C packages/document-form-engine test:run -- tests/runtime.test.ts`
  - Expected: PASS

## Chunk 2: 文档与验证收口

### Task 4: 文档同步（设计器切换 Univer）

**Files:**

- Modify: `apps/docs/docs/guide/document-form-designer.md`
- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`
- Create: `.codex/verification/2026-03-28.md`

- [ ] **Step 1: 更新文档口径**
  - 明确“设计态画布基于 Univer，运行态仍为 Vue 物料渲染”。
- [ ] **Step 2: 补充本次验证记录入口**
  - 在 `.codex` 三类记录中追加本次变更与验证结论。

### Task 5: 全量验证与提交

**Files:**

- Modify: `packages/document-form-engine/**`（已改文件）
- Modify: `apps/docs/**`（已改文件）
- Modify: `.codex/**`（已改文件）

- [ ] **Step 1: 执行验证**
  - `pnpm -C packages/document-form-engine test:run`
  - `pnpm -C packages/document-form-engine typecheck`
  - `pnpm -C packages/document-form-engine lint`
  - `pnpm -C apps/docs lint`
  - `pnpm -C apps/docs build`
- [ ] **Step 2: 提交代码（中文提交信息）**
  - `git add` 本次改动文件
  - `git commit -m "feat: document-form-engine 设计器画布切换 Univer 并支持拖拽排版"`
