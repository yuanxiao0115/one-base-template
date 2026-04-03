---
outline: [2, 3]
---

# PortalManagement 管理端接入

## TL;DR

- admin 侧门户能力统一由 `PortalManagement` 负责装配，页面层不散落引擎注入逻辑。
- 接入顺序固定：`路由入口 -> 引擎注册 -> 页面拼装 -> 验证命令`。
- 只要守住“唯一注入入口 + 页面层薄编排”，后续门户能力扩展会更稳。

## 适用范围

- 适用于：`apps/admin/src/modules/PortalManagement/**`。
- 适用于：门户模板列表、设计页、编辑页、预览页、素材管理页改造。
- 不适用于：引擎内部协议与渲染内核改造（请走 `portal-engine` 边界文档）。

## 前置条件

1. 已能本地启动 `apps/admin` 并访问门户相关路由。
2. 已阅读 [门户体系（Portal）总览](/guide/portal/) 明确管理端/引擎/渲染端分工。
3. 已确认本次改动只涉及管理端装配，而不是引擎内核实现。

## 页面入口与职责

| 页面           | 文件                                       | 主要职责                           |
| -------------- | ------------------------------------------ | ---------------------------------- |
| 门户设计工作台 | `designPage/PortalTemplateSettingPage.vue` | 树结构编排、页面动作、壳层配置入口 |
| 页面编辑器     | `designPage/PortalPageEditPage.vue`        | 深度拖拽编辑、保存、预览           |
| 预览渲染页     | `designPage/PortalPreviewRenderPage.vue`   | 预览数据装配、渲染态路由接入       |

## 路由边界与主路径

| 路由分组     | 主路径                                                   | 说明                         |
| ------------ | -------------------------------------------------------- | ---------------------------- |
| `layout`     | `/portal/setting`、`/material/index`                     | 保留 admin 顶栏与侧栏        |
| `standalone` | `/portal/design`、`/portal/page/edit`、`/portal/preview` | 全屏工作区，不进入顶部标签页 |

约束：

1. `PortalManagement` 不再保留旧路径 alias（含 `alias` 与 `compat.routeAliases`）。
2. 门户编辑链路统一 `meta.hiddenTab=true`，避免进入标签栏。

## 最短接入路径

### 1. 先确认路由入口文件

- `apps/admin/src/modules/PortalManagement/routes/layout.ts`
- `apps/admin/src/modules/PortalManagement/routes/standalone.ts`

确保新增页面先挂到正确路由分组，再做 UI 细节。

### 2. 引擎注入只走唯一入口

固定入口：`apps/admin/src/modules/PortalManagement/engine/register.ts`

该入口负责三件事：

1. 注入 CMS API（`setPortalCmsApi`）。
2. 注入页面设置 API（`setPortalPageSettingsApi`）。
3. 注册 admin 物料扩展（`registerMaterialExtensions`）。

禁止在页面组件内直接散落调用 `setPortal*` 注入函数。

### 3. 页面层接入基线

- 设计页优先使用 `usePortalTemplateDesignerRoute()`。
- 编辑页优先使用 `usePortalPageDesignerRoute()`。
- 预览页优先使用 `usePortalPreviewPageByRoute()` + `PortalPreviewPanel`。

页面层只保留：

1. 路由参数注入。
2. `message/confirm` 反馈接入。
3. 壳组件拼装。

### 4. 素材管理页接入基线

- 页面入口：`materialManagement/list.vue`
- 关键路径：`/material/index`
- 结构基线：`ObPageContainer` 左右结构 + 右侧 `ObCardTable`

推荐保留的性能策略：

1. 分类与列表 TTL 缓存。
2. 最新请求守卫（旧响应不回写）。
3. 搜索防抖（300ms）。
4. 图片懒加载与 SW 图片缓存。

## portal-engine 内置组件速查（管理端常用）

来源：`packages/portal-engine/src/public-designer.ts`

| 导出组件                                     | 作用           |
| -------------------------------------------- | -------------- |
| `PortalMaterialPalette`                      | 物料面板       |
| `PortalTemplateDesignerPreview`              | 设计态预览框   |
| `PortalPageDesignerLayout`                   | 页面编辑工作区 |
| `PortalPropertyInspector`                    | 属性面板       |
| `PortalTemplateDesignerToolbar`              | 页面级工具条   |
| `PortalTemplateDesignerHeader`               | 门户级顶部栏   |
| `PortalTemplateDesignerSidebar`              | 页面树面板     |
| `PortalPageDesignerSettingsDrawer`           | 页面设置抽屉   |
| `PortalTemplateDesignerShellSettingsDrawer`  | 门户壳设置抽屉 |
| `PortalTemplateDesignerPageAttributesDialog` | 页面属性弹窗   |

## 已落地收口（2026-03）

1. `PortalManagement/api.ts` 已收敛为兼容导出入口，领域实现拆分到 `api/portal.ts`、`api/cms.ts`、`api/portal-authority.ts`。
2. 权限与模板列表逻辑已从页面层拆到 `templatePage/composables/**` 与 `components/permission/**`。
3. 物料入口统一到 `usePortalMaterials(scene)`，删除并行 wrapper。
4. 模板兼容 `whiteList -> whiteDTOS` 已下沉 adapters，模块内不再保留重复 compat 映射。

## 验证与验收

在仓库根目录执行：

```bash
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
pnpm -C apps/admin build
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

通过标准：

1. 门户管理端路由可访问（模板/设计/编辑/预览/素材）。
2. `apps/admin` 构建与 lint/typecheck 通过。
3. docs 构建通过且入口可达。

## FAQ

### 为什么强调“先改路由，再改渲染细节”？

因为门户链路的失败通常先发生在路由归属与注入时机，先把路由与注入收稳能减少返工。

### 能否在页面里直接调用 `setPortal*` 做快速修复？

不建议。会破坏注入一致性，后续容易出现页面行为分叉。

### 我只改素材管理页，也要看这页吗？

建议看本页的“素材管理页接入基线”后，再进入具体实现文件，能避免结构与性能策略偏差。

## 相关阅读

- [门户体系（Portal）总览](/guide/portal/)
- [portal-engine 边界与导出层](/guide/portal/engine-boundary)
- [门户物料扩展与注册](/guide/portal/material-extension)
