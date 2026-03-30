# 公文表单设计引擎

> 适用范围：`packages/document-form-engine` 与 `apps/admin/src/modules/DocumentFormManagement/**`

## 当前阶段

当前只交付 **Phase 1：Univer 画布编辑 MVP**。

- 设计页只保留草稿加载、草稿自动保存和返回列表
- 画布编辑统一基于 `Univer`
- 右侧面板只保留 **画布设置 / 组件设置**
- 字体、边框、底色、对齐、表格线、合并等能力统一走 `Univer` 原生工具栏与右键菜单

本期**不交付**：

- 预览页
- 发布 / 回滚 / 历史版本
- 结构视图
- 打印态 / 填写态双模式
- 真实 Vue 业务组件运行态接入

## 架构分工

### `packages/document-form-engine`

负责：

- 模板协议：`schema/types.ts`、`schema/sheet.ts`、`schema/template.ts`
- 设计器：`designer/**`
- 设计态控制层：`designer/useDocumentDesignerController.ts`
- 画布运行时：`designer/UniverDocumentCanvas.vue`

禁止：

- 直接依赖 `apps/*`
- 写死 admin 私有服务、页面跳转和消息提示

### `apps/admin`

负责：

- 设计页薄壳与路由承接
- 草稿生命周期服务
- admin 侧注册与注入

当前 Phase 1 页面只依赖：

- `ensureDraft`
- `updateDraft`
- 返回列表

即使模板服务仍保留 `publishDraft`、`rollbackToPublished` 等接口，当前设计页也**不再暴露这些能力**。

## 模板协议

当前模板主结构分为四块：

### 1. `template.sheet`

负责表格结构与静态样式：

- `rows / columns`
- `cells`
- `merges`
- `styles`
- `rowHeights / columnWidths`
- `viewport`

### 2. `template.fields`

负责字段语义定义：

- `type`
- `label`
- `required`
- `widgetProps`
- `dataSource`
- `binding`

### 3. `template.placements`

负责字段放置位置：

- `fieldId`
- `range`
- `displayMode`
- `section`
- `readonly`

### 4. `designer.univerSnapshot`

负责持久化 `Univer` 画布编辑结果。

约束：

- 只用于恢复画布编辑状态
- 不参与字段语义判断
- 只接收清洗后的 `ob-univer-snapshot@v1` 封装数据
- 会过滤临时 `selection` 状态，避免脏选区回放导致 `getConfig/getSheetId`

## Phase 1 页面结构

设计页由三层组成：

### `DocumentFormDesignerPage.vue`

页面层已经降级为草稿壳：

- 进入页面时执行 `ensureDraft(createMockDocumentTemplate())`
- 设计器变更时执行 `updateDraft(nextTemplate, '设计器实时保存草稿')`
- 顶部只显示草稿版本与保存提示

### `DocumentDesignerWorkbench.vue`

只做编排，不再持有额外模板真源。

所有模板写入统一通过 `useDocumentDesignerController.ts` 收口，避免页面、Workbench、Canvas 多处同时改模板。

### `DocumentPropertyInspector.vue`

当前只保留两个面板：

- 画布设置：网格线、缩放、当前网格信息、原生操作提示
- 组件设置：字段清单、字段标签、必填、占位提示、行数、静态选项、placement 属性、删除字段

### `UniverDocumentCanvas.vue`

当前只负责四件事：

- 初始化 / 销毁 `Univer`
- 渲染 sheet 与 placement 标签
- 向外抛出选区与拖拽事件
- 输出清洗后的 snapshot

## Phase 1 关键修复

当前稳定性依赖以下约束：

- 初始化时若草稿已带 snapshot，直接 `createWorkbook(templateSnapshot)`，不再先建空 workbook 再二次加载
- 结构变更重绘与外部选区同步拆开处理，`activeRange` 变化只走 `syncCanvasSelection()`
- 访问 worksheet / workbook 前先做有效性判断，已销毁对象直接短路
- 快照保存统一走清洗与哈希去重，避免样式修改后再次插入字段时被旧快照回滚
- 组件卸载时先断开本地 runtime 与事件，再整体销毁 `Univer`

## 草稿持久化

当前草稿仍持久化到浏览器 `localStorage`：

- key：`ob_document_form_template_store_v1`

Phase 1 验收口径：

1. 能进入 `/document-form/design`
2. 选区后点击顶部字段按钮，可插入并在画布上可见
3. 使用 `Univer` 修改样式后，再插入字段、切换选区、刷新页面，样式不回滚
4. placement 可移动、可删除
5. 刷新后草稿仍能恢复

## 验证命令

```bash
pnpm -C packages/document-form-engine test:run -- tests/designer-canvas-source.test.ts tests/designer-controller.test.ts tests/designer-state.test.ts tests/designer-workbench-source.test.ts tests/schema-v3.test.ts
pnpm -C packages/document-form-engine typecheck
pnpm -C apps/admin test:run:file -- src/modules/DocumentFormManagement/designPage/DocumentFormDesignerPage.source.test.ts src/modules/DocumentFormManagement/services/template-service.unit.test.ts
pnpm -C apps/admin typecheck
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

## 下一阶段

Phase 1 收口后，后续再单独推进：

- 打印态 / 填写态双预览
- 真实 Vue 运行态字段组件
- 发布 / 回滚 / 历史版本
- 模板结构视图
