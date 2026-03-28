# Document Form Engine 完整产品化实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `packages/document-form-engine` 从“可演示 MVP”升级为“可交付产品”，实现稳定的物料画布渲染、Excel 级单元格能力（合并/边框/线色/行高列宽）、配置化 schema 与运行态一致性。

**Architecture:** 保持“自定义物料层 + Vue 运行态”主线不变，新增 `sheet-schema + style-schema + canvas adapter` 三层。设计态继续用 Univer，表格能力统一抽象到 schema，运行态和打印态消费同一份结构化配置。

**Tech Stack:** Vue 3、TypeScript、Univer、Vitest、VitePress

---

## 0. 问题定位结论（先回答你现在的疑问）

- 左侧物料“无法在画布渲染”：归属 `设计态数据流 + Univer 事件/渲染同步` 问题，不是物料协议本身。
- Excel 演示与合并单元格能力：归属 `SheetSchema`（模板层）与 `MaterialSheetLayout`（物料层）能力。
- 线条颜色、边框、填充色、行高列宽：归属 `SheetStyleSchema`（样式层），不应散落在组件内硬编码。

## 1. 产品目标范围（非 MVP）

- 设计态：左侧物料拖放/添加，画布稳定渲染，节点选中，拖拽改位，合并区域编辑，样式可视配置。
- 模板协议：支持网格、单元格区域、合并、边框、线色、背景、字体、对齐、行高列宽、冻结区、打印边距。
- 运行态：按同一份 schema 渲染 Vue 组件与表单行为，保证版式与设计态一致。
- 持久化：模板版本化、草稿/发布态、结构校验、兼容升级。
- 工程质量：单测、类型、文档、验收清单。

## 2. 分阶段实施

### Phase 1：画布渲染链路稳定化（先修现在“看不到”）

**Files:**

- Modify: `packages/document-form-engine/designer/UniverDocumentCanvas.vue`
- Modify: `packages/document-form-engine/designer/useDocumentDesignerState.ts`
- Modify: `packages/document-form-engine/tests/designer-state.test.ts`
- Create: `packages/document-form-engine/tests/designer-canvas-render-flow.test.ts`

- [x] 梳理“新增物料 -> template.materials -> Univer 渲染刷新”链路，消除丢帧/不刷新。
- [x] 统一 `SelectionChanged / SelectionMoveStart / SelectionMoveEnd` 触发条件，避免渲染期事件误回写。
- [x] 补充回归测试：新增物料后画布存在目标单元格值，删除后清理成功。

### Phase 2：引入可产品化的 SheetSchema（Excel 能力落盘）

**Files:**

- Create: `packages/document-form-engine/schema/sheet.ts`
- Modify: `packages/document-form-engine/schema/types.ts`
- Modify: `packages/document-form-engine/schema/template.ts`
- Create: `packages/document-form-engine/tests/sheet-schema.test.ts`

- [x] 新增 `sheet` 顶层配置：
- [x] `rows`、`columns`、`rowHeights`、`columnWidths`。
- [x] `merges`（合并区域数组）。
- [x] `styles`（区域样式定义，含边框线型/线色）。
- [x] `viewport`（冻结区、缩放、网格线显示）。
- [x] 增加 schema 版本迁移：`v1 -> v2`。

### Phase 3：物料布局与样式协议升级（配置在哪儿的问题）

**Files:**

- Modify: `packages/document-form-engine/materials/types.ts`
- Modify: `packages/document-form-engine/materials/default-materials.ts`
- Create: `packages/document-form-engine/materials/sheet-style.ts`
- Create: `packages/document-form-engine/tests/material-sheet-style.test.ts`

- [x] 物料定义新增 `sheetLayout` 与 `stylePreset`。
- [x] `stylePreset` 支持边框颜色、线宽、背景色、字体、对齐。
- [x] 默认值仍放 `default-materials.ts`，但样式常量抽到 `sheet-style.ts`。

### Phase 4：设计器能力补齐（完整产品操作面）

**Files:**

- Modify: `packages/document-form-engine/designer/DocumentPropertyInspector.vue`
- Create: `packages/document-form-engine/designer/panels/SheetStyleEditor.vue`
- Create: `packages/document-form-engine/designer/panels/MergeEditor.vue`
- Modify: `packages/document-form-engine/designer/DocumentDesignerWorkbench.vue`

- [x] 右侧新增“单元格样式”面板：边框线色、线型、填充、字体、对齐。
- [x] 右侧新增“合并区域”面板：添加/拆分合并区域。
- [x] 支持“当前选区应用样式”（当前实现为“当前选中物料区域应用样式”）。

### Phase 5：运行态与打印态对齐

**Files:**

- Modify: `packages/document-form-engine/runtime/renderer.ts`
- Create: `packages/document-form-engine/runtime/sheet-renderer.ts`
- Create: `packages/document-form-engine/runtime/print-renderer.ts`
- Create: `packages/document-form-engine/tests/runtime-sheet-parity.test.ts`

- [x] 运行态消费 `sheet` 配置，保证区域布局和样式一致。
- [x] 打印态复用同一套样式映射，减少设计/打印偏差。

### Phase 6：admin 集成与模板生命周期

**Files:**

- Modify: `apps/admin/src/modules/DocumentFormManagement/engine/register.ts`
- Modify: `apps/admin/src/modules/DocumentFormManagement/designPage/DocumentFormDesignerPage.vue`
- Create: `apps/admin/src/modules/DocumentFormManagement/services/template-service.ts`
- Create: `apps/admin/src/modules/DocumentFormManagement/tests/template-service.unit.test.ts`

- [x] 新增模板“草稿/发布/回滚”接口对接（当前通过 admin 本地服务先打通生命周期链路）。
- [x] 加入版本号与 schema 迁移执行（模板协议已是 v2，解析链路内置 `v1 -> v2` 迁移）。

### Phase 7：文档、验证、发布门禁

**Files:**

- Modify: `apps/docs/docs/guide/document-form-designer.md`
- Create: `apps/docs/docs/guide/document-form-sheet-schema.md`
- Modify: `.codex/operations-log.md`
- Modify: `.codex/testing.md`
- Modify: `.codex/verification.md`

- [x] 文档补齐“配置项索引 + 示例 JSON + 迁移策略”。
- [x] 验证命令固化到文档。

## 3. 你最关心的配置归属（最终口径）

- 物料在画布能否显示：`template.materials + designer/UniverDocumentCanvas.vue`。
- 合并单元格：`schema.sheet.merges`。
- 线条颜色/边框：`schema.sheet.styles[].border.color`。
- 填充色/字体/对齐：`schema.sheet.styles[]`。
- 默认样式来源：`materials/sheet-style.ts` + `default-materials.ts`。
- 单模板个性化：保存在模板 JSON（数据库字段）。

## 4. 验证口径（每阶段都执行）

- `pnpm -C packages/document-form-engine test:run`
- `pnpm -C packages/document-form-engine typecheck`
- `pnpm -C packages/document-form-engine build`
- `pnpm -C apps/admin typecheck`
- `pnpm -C apps/docs lint`
- `pnpm -C apps/docs build`

## 5. 里程碑交付

- M1（Phase 1-2）：画布稳定显示 + SheetSchema 能表达 Excel 能力。
- M2（Phase 3-4）：可视化配置样式与合并区域。
- M3（Phase 5-7）：运行态一致、admin 生命周期、文档与验证闭环。
