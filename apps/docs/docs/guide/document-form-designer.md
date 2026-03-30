# 公文表单设计引擎

> 适用范围：`packages/document-form-engine` 与 `apps/admin/src/modules/DocumentFormManagement/**`

## TL;DR

- 当前主线已经明确为 **Sheet-first**：
  - 设计态使用 `Univer`
  - 模板协议使用 `version: '3'`
  - 运行态与预览态使用 Vue 组件渲染
- 首发模板固定为 **发文单**，默认种子来自 `createDispatchDocumentTemplate()`。
- 设计页提供 **预览** 按钮，打开独立全屏预览页，默认读取当前草稿。
- admin 侧只做页面组装与业务服务注入，不再维护平行的物料协议。

## 架构分工

### `packages/document-form-engine`

负责：

- 模板协议：`schema/types.ts`、`schema/sheet.ts`、`schema/template.ts`
- 设计器：`designer/**`
- 字段组件注册：`register/field-widgets.ts`
- 运行态渲染：`runtime/renderer.ts`、`runtime/DocumentRuntimePreview.vue`

禁止：

- 直接依赖 `apps/*`
- 写死 admin 私有组件或接口
- 在共享包内处理页面跳转、菜单或消息提示

### `apps/admin`

负责：

- 路由与页面薄壳
- 模板草稿/发布/回滚生命周期服务
- admin 专属适配器契约与后续真实业务组件接入

禁止：

- 复制一套旧 `materials`/绝对定位画布
- 页面层直接引用共享包内部未导出的实现文件

## 模板协议（v3）

当前模板结构收敛为三块：

### 1. `template.sheet`

负责 Excel/表格层能力：

- `rows / columns`
- `cells`
- `merges`
- `styles`
- `rowHeights / columnWidths`
- `viewport`

合并单元格、边框颜色、底色、字号、对齐方式都在这里配置。

### 2. `template.fields`

负责字段定义：

- `type`
- `label`
- `required`
- `widgetProps`
- `dataSource`
- `binding`

### 3. `template.placements`

负责字段放置到 sheet 的位置：

- `fieldId`
- `range`
- `displayMode`
- `section`
- `readonly`

## 设计态实现

设计器页面由三部分组成：

- 顶部工具条：插入字段、恢复发文单预设
- 中央画布：`UniverDocumentCanvas`
- 右侧面板：`DocumentPropertyInspector`

当前 `Univer` 画布职责：

- 展示 `sheet.cells`
- 展示字段放置区 `placements`
- 响应选区变化
- 支持拖拽移动字段区域
- 把合并、边框、底色等配置回写到模板
- 合并区域发生重叠冲突时，自动跳过冲突项，避免整张画布渲染中断

当前右侧面板职责：

- 字段列表切换
- 字段标签、必填、占位提示、行数、静态选项编辑
- placement 的展示模式、区域归属、只读开关
- 合并区域编辑
- 单元格样式编辑

## 运行态与预览态

运行态不再直接运行一个 `Univer` 表单，而是走 Vue 渲染：

- `runtime/renderer.ts` 把 `sheet + fields + placements` 转成运行态表格模型
- `runtime/DocumentRuntimePreview.vue` 用 HTML `table` 渲染真实版式
- `apps/admin` 的预览页直接复用 `DocumentRuntimePreview`

预览页规则：

- 路由：`/document-form/preview`
- 默认优先读取当前草稿
- 无草稿时回退发布版本
- 再无数据时回退 `createDispatchDocumentTemplate()`

## admin 接入

admin 模块主要文件：

- `designPage/DocumentFormDesignerPage.vue`
- `designPage/DocumentFormPreviewPage.vue`
- `engine/register.ts`
- `services/template-service.ts`
- `mock/template.ts`

### 模板生命周期

`template-service.ts` 当前提供：

- `ensureDraft`
- `updateDraft`
- `publishDraft`
- `rollbackToPublished`
- `getSnapshot`

### 适配器契约

`setupDocumentFormEngineForAdmin()` 当前暴露的是 **可选适配器契约**，不是强制运行态绑定：

- `personnelSelector?`
- `departmentSelector?`
- `attachmentUpload?`
- `richTextEditor?`
- `stampPicker?`

当前版本里，运行态预览默认继续使用共享包内置字段组件；admin 真实业务组件后续按需渐进接入。

## Univer 组件扩展说明

当前设计器优先使用 `Univer` 自身表格能力完成 MVP 到产品主链：

- 表格
- 合并
- 边框
- 单元格选区
- 拖拽移动

如果后续要在画布上叠加 Vue 自定义组件，应优先走官方扩展方式：

- `univerAPI.registerComponent(...)`
- `worksheet.addFloatDomToRange(...)`
- `@univerjs/ui-adapter-vue3`

并遵守两个约束：

- 只在 `LifeCycleChanged -> Rendered/Steady` 之后挂载
- 组件与 Univer 实例都必须在卸载时 `dispose`

## 默认模板

默认发文单模板统一使用：

```ts
import { createDispatchDocumentTemplate } from '@one-base-template/document-form-engine';

const template = createDispatchDocumentTemplate();
```

不要再在 admin 侧手写旧 `materials` 结构。

## 验证命令

```bash
pnpm -C packages/document-form-engine test:run
pnpm -C packages/document-form-engine typecheck
pnpm -C packages/document-form-engine build
pnpm -C apps/admin test:run:file -- src/modules/DocumentFormManagement/engine/register.unit.test.ts
pnpm -C apps/admin typecheck
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

## 当前范围

- 当前只覆盖 **发文单**
- 设计态优先收敛到 sheet 能力，不再围绕左侧旧物料栏设计
- 运行态预览优先保证版式还原与字段链路可用
- 真实选人、附件、签章业务组件后续按契约渐进接入
