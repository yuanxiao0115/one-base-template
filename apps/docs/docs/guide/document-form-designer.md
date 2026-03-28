# 公文表单设计引擎

> 适用范围：`packages/document-form-engine` 与 `apps/admin/src/modules/DocumentFormManagement/**`

## TL;DR

- 公文表单能力以独立包 `@one-base-template/document-form-engine` 形态沉淀到 `packages/`，不在 `apps/admin` 内复制画布、物料、schema 与设置面板实现。
- `apps/admin` 只做消费层：路由挂载、接口注入、权限接入、页面薄壳与业务适配器注入。
- MVP 先覆盖**发文单**，统一交付“左物料 / 中画布 / 右设置”的三栏设计器与运行态渲染能力。
- 设计态画布已切换为 **Univer Sheet**，通过 `anchor(row/col/rowspan/colspan)` 与网格范围桥接实现选中与拖拽排版；运行态继续挂真实 Vue 组件，保证版式稳定、打印一致、边界清晰。

## 包化边界

### `packages/document-form-engine`

负责：

- 模板协议：页面尺寸、网格、锚点、节点、绑定、打印配置
- 物料注册：物料定义、默认配置、属性面板 schema、设计态预览、运行态渲染
- 设计器：物料面板、画布、属性面板、设计态路由 helper
- 设计器画布桥接：Univer 选区事件与 `DocumentTemplateSchema` 锚点双向映射（`canvas-bridge.ts`）
- 运行态：模板渲染器、组件映射、打印渲染入口
- 上下文与注册：`createDocumentFormEngineContext()`、`registerDocumentMaterials()` 等公共入口

禁止：

- 直接依赖 `apps/*`
- 写死 admin 的接口路径、人员组件、上传组件、富文本组件
- 在包内散落 app 级消息提示、路由跳转与菜单逻辑

### `apps/admin`

负责：

- `DocumentFormManagement` 模块路由与页面装配
- `setupDocumentFormEngineForAdmin()` 注入 API、通知与业务适配器
- 菜单权限、模块开关与页面壳样式

禁止：

- 在 admin 内定义公文物料本体
- 复制一套平行的 schema、画布协议或属性面板
- 页面层直接 import 包内部未公开的实现文件

## MVP 物料清单

首批物料固定为以下 7 类：

| 物料                  | 作用                         | 设计态表现             | 运行态职责            |
| --------------------- | ---------------------------- | ---------------------- | --------------------- |
| `DocumentHeaderBlock` | 文头、标题、文号、签发信息   | 红头区块与标题预览壳   | 渲染发文核心元数据    |
| `RecipientBlock`      | 主送、抄送、报送范围         | 收件对象表格式壳子     | 渲染多行收件对象      |
| `BodyBlock`           | 正文区                       | 正文占位与模拟文本     | 接富文本/正文组件     |
| `OpinionBlock`        | 拟稿/核稿/会签/领导意见      | 意见区壳 + 签名位 Mock | 按配置渲染意见流      |
| `AttachmentBlock`     | 附件说明与附件列表           | 附件表格壳             | 接上传/附件列表适配器 |
| `StampBlock`          | 签章位、签名位、落款位       | 图片章/签字占位壳      | 渲染签章图片或签字图  |
| `MetaInfoBlock`       | 拟稿人、部门、日期、流程信息 | 元信息卡片壳           | 渲染流程/基础字段     |

其中 `OpinionBlock` 统一承载拟稿、核稿、会签、领导意见，通过配置切换 `label`、`roleCode`、`showSigner`、`showTime` 等行为；`RecipientBlock` 统一承载主送与抄送，避免拆成重复组件。

## admin 接入方式

### 模块职责

`apps/admin/src/modules/DocumentFormManagement` 只保留三类文件：

- 模块声明：`manifest.ts + module.ts + routes/**`
- 页面薄壳：设计页、运行页、预览页
- 引擎注入：`engine/register.ts`

### 注入入口

`setupDocumentFormEngineForAdmin()` 是 admin 侧唯一引擎注入入口，负责把以下差异注入共享包：

- 模板增删改查 API
- 人员选择器适配器
- 附件上传适配器
- 富文本正文适配器
- `message/confirm` 等通知能力

页面层只消费公开导出：

```ts
import {
  createDocumentFormEngineContext,
  registerDocumentMaterials
} from '@one-base-template/document-form-engine';
import {
  DocumentFormDesignerLayout,
  useDocumentFormDesignerRoute
} from '@one-base-template/document-form-engine/designer';
```

## SheetSchema v2（Excel 能力配置入口）

`packages/document-form-engine/schema/sheet.ts` 已定义统一的 `sheet` 协议，模板侧统一通过 `template.sheet` 配置表格行为：

- `sheet.merges`：单元格合并区域（`row/col/rowspan/colspan`）。
- `sheet.styles`：区域样式（边框、线色、填充、字体、对齐）。
- `sheet.rowHeights / sheet.columnWidths`：行高与列宽覆盖。
- `sheet.viewport`：网格线显示、缩放、冻结区。

示例：

```json
{
  "version": "2",
  "sheet": {
    "rows": 40,
    "columns": 24,
    "merges": [{ "row": 2, "col": 2, "rowspan": 2, "colspan": 3 }],
    "styles": [
      {
        "row": 2,
        "col": 2,
        "rowspan": 2,
        "colspan": 3,
        "backgroundColor": "#f8fafc",
        "border": {
          "top": { "color": "#1e293b", "style": "solid", "width": 1 },
          "right": { "color": "#1e293b", "style": "solid", "width": 1 },
          "bottom": { "color": "#1e293b", "style": "solid", "width": 1 },
          "left": { "color": "#1e293b", "style": "solid", "width": 1 }
        }
      }
    ],
    "viewport": {
      "showGrid": true,
      "zoom": 100,
      "frozenRows": 0,
      "frozenColumns": 0
    }
  }
}
```

`schema/template.ts` 在解析模板时会自动执行 `v1 -> v2` 迁移并补齐 `sheet` 默认值，admin 持久化层无需先做历史数据回写。

## 设计器右侧配置面（当前能力）

`DocumentPropertyInspector` 已接入两个表格编辑面板：

- `MergeEditor`：按当前选中物料区域新增合并，或删除已有合并区域。
- `SheetStyleEditor`：编辑边框线色、填充色、字体、对齐、换行，并应用到当前选中物料区域。

配置回写路径：

- 合并区域：`template.sheet.merges`
- 样式区域：`template.sheet.styles`

当前版本的样式应用粒度是“当前选中物料区域”，后续如需“任意选区样式刷”可在 Univer 选区事件上继续扩展。

## 物料样式协议（Material Sheet Style）

`materials/types.ts` 中的物料定义已新增：

- `sheetLayout`：定义物料在 sheet 中的区域布局（默认主区域）。
- `stylePreset`：定义物料默认样式预设。

默认实现：

- 样式常量位于 `materials/sheet-style.ts`
- 默认物料预设位于 `materials/default-materials.ts`

## 运行态与打印态一致性（Sheet Render Parity）

`runtime` 侧已新增：

- `runtime/sheet-renderer.ts`：构建运行态 sheet 渲染模型。
- `runtime/print-renderer.ts`：打印态复用同一份 sheet 渲染模型。

当前约束：

- 节点组件 props：`defaultProps + node.props`。
- 区域样式优先级：`template.sheet.styles` 覆盖 `material.stylePreset.style`。
- 打印态输出：与运行态 `sheet-renderer` 保持同构输出，减少版式偏差。

可直接使用：

```ts
import {
  createDocumentPrintRenderer,
  createDocumentSheetRenderer
} from '@one-base-template/document-form-engine';
```

## 验证命令

最小验证口径如下：

```bash
pnpm -C packages/document-form-engine typecheck
pnpm -C packages/document-form-engine lint
pnpm -C packages/document-form-engine test:run
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

收口前建议再执行：

```bash
pnpm verify
```

## 当前阶段约束

- 第一阶段采用**单包先行**，不拆 `runtime/ui` 子包。
- MVP 只做发文单，不含正式电子签、Excel 导入导出、收文单与签报单。
- 文档允许先行沉淀边界与接口，但验证结论必须以 `.codex/testing.md` 与 `.codex/verification.md` 的实际记录为准。
- 设计态拖拽排版当前以 `SelectionMoveStart/SelectionMoveEnd` 事件回写 anchor，后续复杂碰撞策略（自动避让、吸附）再增量补齐。
