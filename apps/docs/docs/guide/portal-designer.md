# 门户设计器（PC）

本模块用于在后台管理端完成「门户页面」的拖拽布局、配置与预览渲染。

当前实现遵循仓库的边界约定：
- 业务模块落在 `apps/admin/src/modules/PortalManagement`（不侵入 `packages/core`/`packages/ui`）。
- 物料库改为 **前端维护**，不依赖后端返回物料分类/配置。
- 预览页允许 **匿名访问**（`meta.public=true`），用于同页渲染与新窗口预览。
- **不移植**「页面模板」能力：创建时选择页面模板 / 存为模板 / 从历史模板加载等逻辑都不做。

## 目录收敛（2026-03-11）

为强化“门户设计 / 页面设计”边界，目录已拆分为两个业务域：
- `apps/admin/src/modules/PortalManagement/portal-design`
  - `pages/PortalTemplateSettingPage.vue`（门户设计主工作台）
  - `components/PortalTabTree.vue`
  - `components/TabAttributeDialog.vue`
  - `components/CreateBlankPageDialog.vue`
- `apps/admin/src/modules/PortalManagement/page-design`
  - `pages/PortalPageEditPage.vue`（页面设计器）
  - `pages/PortalPreviewRenderPage.vue`（预览渲染页）
  - `components/PortalPreviewPanel.vue`

路由文件 `routes/standalone.ts` 已同步改为从对应业务域页面懒加载。

## 引擎抽包进度（2026-03-06）

为后续 `apps/portal` 独立消费者应用做准备，已完成第一批基础能力下沉到 `packages/portal-engine`：
- `src/schema/types.ts`：`BizResponse`、`PageResult`、`PortalTemplate`、`PortalTab`
- `src/composables/useSchemaConfig.ts`
- `src/utils/deep.ts`：`deepClone`、`deepEqual`
- `src/stores/pageLayout.ts`
- `src/editor/{GridLayoutEditor,PropertyPanel,MaterialLibrary}.vue`
- `src/renderer/PortalGridRenderer.vue`
- `src/materials/cms/**`（由 `party-building` 迁移并重命名目录）
- `src/materials/useMaterials.ts`（扫描 `cms` 物料，内置 `pb-* <-> cms-*` 组件名别名）
- `src/registry/materials-registry.ts`（默认注册 `cms-*`，并导出 `pb-* -> cms-*` 类型别名映射）

当前 `apps/admin/src/modules/PortalManagement/types.ts`、`hooks/useSchemaConfig.ts`、`utils/deep.ts`、`stores/pageLayout.ts` 保留为兼容 re-export 层，确保历史调用点不需要一次性批量改路径。
另外 `MaterialLibrary` 已改为由页面注入 `categories`，不再直接依赖 admin 内的 registry 路径，便于 `apps/admin` 与后续 `apps/portal` 复用同一编辑器组件。

## 路由说明

管理侧（挂在 `AdminLayout` 内，需要登录/菜单权限）：
- `/portal`：父节点兜底，重定向到列表页
- `/portal/setting`：门户模板列表（表格版，后端概念为 template）
- `/portal/design?id=<id>`：门户配置 IDE（tab 树 + 同页预览 + 新建页面）
- `/resource/portal/setting?id=<id>`：兼容别名（自动映射到 `/portal/design`）
- `/portal/page/edit?id=<id>&tabId=<id>`：页面编辑器（拖拽布局 + 保存 + 预览）

预览渲染（顶层路由，不挂 `AdminLayout`，允许匿名）：
- `/portal/preview?templateId=<id>&tabId=<id>`：渲染指定 tab 的 pageLayout（通常给新窗口使用；同页预览复用同一渲染组件）

独立消费者应用（`apps/portal`）：
- `/portal/index/:tabId?templateId=<id>`：门户前台渲染入口（匿名可访问，`meta.public=true`）
- `/portal/preview/:tabId?templateId=<id>`：匿名预览入口（与 admin 预览协议一致）
- 启动命令：`pnpm dev:portal`（等价 `pnpm -C apps/portal dev`）

标签栏约定（基于 core tabs 规则）：
- `/portal/design`、`/portal/page/edit`、`/portal/preview` 均通过 `meta.hiddenTab=true` 处理为“不进入顶部标签栏”
- 这样可保持门户编辑/预览页为全屏工作区，不与常规业务页签混排

## 门户模板列表（表格版）

入口：`/portal/setting`

当前最小能力（不改后端接口）：
- 新增：点击右上角 `新增门户` → 填写门户名称/模板布局/门户类型/描述 → 创建成功后进入 `/portal/design?id=<id>`
- 编辑：行内 `编辑`，复用同一表单弹窗回写 `template.update`
- 复制：行内 `复制`，复用同一表单弹窗调用 `template.copy`
- 搜索：门户名称关键字（`searchKey`）
- 筛选：发布状态（全部/草稿/已发布）
- 分页：`currentPage/pageSize`
- 行内操作：
  - `门户权限`：打开门户权限弹窗（授权类型支持“人员 / 角色”）
  - `配置`：进入 `/portal/design?id=<id>`
  - `预览`：打开 `/portal/preview?templateId=<id>&tabId=<id>`
  - `发布/取消发布`：调用 `template.publish`
  - `删除`：调用 `template.delete`（带确认弹窗）

门户权限弹窗（对齐老项目 `portal-authority-form.vue`）：
- 授权类型支持 `person`（人员）与 `role`（角色）。
- 人员模式：配置 `whiteDTOS`（可访问人员）、`blackDTOS`（不可访问人员）、`userIds`（可维护人员）。
- 角色模式：配置 `allowRole.roleIds`、`forbiddenRole.roleIds`、`configRole.roleIds`。
- 保存前先请求 `GET /cmict/portal/template/detail?id=<id>`，回填 `templateName/templateType/isOpen/id` 等历史必填字段，再调用 `POST /cmict/portal/template/update`。

列表交互基线（对齐 admin）：
- 表格渲染统一使用 `ObVxeTable`（不使用 `el-table`）
- 消息提示统一使用 `@one-base-template/ui`（不直接使用 `ElMessage`）

新增门户模板字段说明（对齐老项目，避免部分环境后端校验失败）：
- `templateType`：模板布局（0=左侧导航、1=顶部导航、2=全屏左导航），默认 0
- `isOpen`：门户类型（0=普通门户、1=匿名门户），默认 0

## 新建页面（按老项目裁剪后的逻辑）

> 仅保留“直接新建页面并编辑”的流程；不做“页面模板/历史模板/存为模板”。

入口：`/portal/design?id=<id>`

### 1) 页面树导航（tabList）

Designer 左侧的页面树来自后端 `template.detail` 返回的 `tabList`（树结构）。

- `tabType=1`：导航组（不可选中预览，但可以作为“新建子级”的父节点）
- `tabType=2`：空白页（可预览/可编辑）
- `tabType=3`：链接（当前 Designer 不做配置入口，后续如需要再补）
- 左侧树默认不展示统计条，节点操作区使用图标按钮（编辑/新建/更多），并支持关键字搜索。

当前工作台（2026-03-11）布局口径：
- 页面采用「左侧结构树 + 右侧编辑工作台」双栏模型。
- 顶部为窄条信息头（返回 / 模板名 / 页眉页脚配置 / 刷新），不再使用厚头部或多层卡片。
- 右侧首行是“当前页面动作条”，仅承载页面级操作：进入编辑、页面属性、页面权限、隐藏、预览、删除；预览模式/视口/缩放控件与动作按钮同一行。
- 右侧预览区使用“设备画框 + iframe”结构，支持按目标视口等比缩放预览（先完成框架，不改数据链路）。
- `preview-host-frame` 尺寸变化（拖动窗口、打开/收起 DevTools）会触发重新计算缩放，预览区会随容器自适应。
- `tree-header` 与 `preview-head` 均已移除，整体保持白底、低边框、直角风格。

### 2) 新建空白页并直接进入编辑

你可以从两个入口新建页面：
- 顶部按钮：`新建页面`（创建根节点）
- 树节点右侧：`新建` → `新建同级 / 新建子级`（子级仅允许导航组 tabType=1）

创建步骤：
1. 弹出对话框输入 `页面名称(tabName)`
2. 选择类型（与老项目枚举保持一致）：
   - `tabType=1`：导航组
   - `tabType=2`：空白页（可拖拽编辑）
   - `tabType=3`：链接（需填写地址/打开方式/单点方式）
3. 调用 `POST /cmict/portal/tab/add` 创建 tab
4. 若创建的是空白页（`tabType=2`），创建成功后 **直接跳转** `/portal/page/edit?id=<id>&tabId=<newTabId>` 进入拖拽编辑器
5. 若创建的是导航组/链接，则停留在 designer 并刷新页面树

兼容性兜底（无需后端改动）：
- 若某些环境 `tab.add` 后没有自动挂到 `template.tabList/tabIds`，前端会：
  - 复拉一次 `template.detail` 确认是否已挂载
  - 若未挂载则把新 tabId 追加到 `template.tabIds` 并 `template.update`，再复拉确认

### 3) 页面管理：属性/隐藏/删除

在树节点右侧的 `更多` 菜单中，提供以下操作：
- `属性设置`：调用 `GET /cmict/portal/tab/detail` 拉取详情，提交时调用 `PUT /cmict/portal/tab/update`
- `隐藏页面/显示页面`：调用 `GET /cmict/portal/template/hide?id=<templateId>&tabId=<tabId>&isHide=0|1`
- `删除页面`：调用 `DELETE /cmict/portal/tab/delete`（会弹确认）
- 左侧树支持拖拽排序（前端实现，不新增后端接口）：拖拽后按新顺序重算同级 `sort`，并调用 `tab.detail + tab.update` 持久化；搜索状态下禁用拖拽，避免过滤树导致排序歧义。

页面权限（Designer 顶部动作条）：
- 点击“页面权限”后，先调用 `GET /cmict/portal/tab/detail?id=<tabId>` 回填权限信息。
- 授权类型支持 `person` 与 `role`：
  - `person`：保存为 `allowPerms.userIds`、`forbiddenPerms.userIds`、`configPerms.userIds`
  - `role`：保存为 `allowPerms.roleIds`、`forbiddenPerms.roleIds`、`configPerms.roleIds`
- 保存统一调用 `PUT /cmict/portal/tab/update`。

## 页眉页脚壳层配置（details）

当前 Designer 继续使用 `template.update`，不新增后端接口；页眉页脚配置统一维护在 `template.details` JSON（字符串）中。

入口层级约定：
- **门户级** 页眉页脚配置入口放在 Designer 顶部栏（HeaderBar）。
- 页面工具栏（ActionStrip）仅保留页面级动作，不再放置壳层配置入口。

配置方式约定（本次优化）：
- 配置以“可视化表单项”为主，不要求直接编辑 JSON 文本。
- 对话框提供「查看数据结构」功能：可只读查看“当前 details JSON”与“结构示例 JSON”，便于联调与排错。
- 对话框打开后，表单改动会实时同步到右侧预览（仅预览态，不落库）。
- 保存时前端会将表单配置规范化后再序列化为 `details`。
- 手工导航与友情链接均采用“行编辑”交互（新增/删除行 + 字段输入），不再通过 JSON 文本框录入。

数据结构（关键字段）：
- `pageHeader` / `pageFooter`：门户级开关（`1` 启用，`0` 关闭）
- `shell.header`：门户默认页眉
- `shell.footer`：门户默认页脚
- `pageOverrides[tabId]`：页面级覆盖（仅对指定页面生效）

页眉策略：
- `mode=configurable`：使用通用可配置页眉（颜色、Logo、高度、导航来源、顶部通知、用户中心等）
- `mode=customComponent`：使用独立页眉组件（通过 `customComponentKey` 从注册表渲染）
- 已内置示例：`news-government-v1`（新闻门户-政务红）

通用页眉增强字段（面向新项目）：
- 标题信息：`title`、`subTitle`
- 标题布局：`titleLayout=stack|divider`（支持“主标题 | 副标题”）
- 标题位置：`titlePosition=logoRight|leftEdge`
- 字号控制：`titleFontSize`、`subTitleFontSize`
- 内容宽度：支持“固定像素”与 `100%` 铺满两种模式（header/footer）
- 运营位：`showActionButton/actionButtonText/actionButtonUrl`
- 样式 token：`noticeBgColor/noticeTextColor`、`actionBgColor/actionTextColor/actionBorderColor`
- Logo 支持上传图片：上传接口 `POST /cmict/file/resource/upload`，值写入 `shell.header.tokens.logo`（资源 id 或 URL）
- 配置分组建议：`基础布局`、`品牌与标题`、`导航模块`、`顶部公告模块`、`行动按钮与用户区`（颜色跟随各模块就近配置）

页脚策略：
- 支持备案信息、版权、描述、多链接、固定页脚模式等参数

通用页脚增强字段（面向新项目）：
- 联系区：`servicePhone`、`serviceEmail`、`address`
- 分区开关：`showLinks`、`showRecord`、`showContact`
- 样式 token：`mutedTextColor`
- 配置分组建议：`基础布局`、`友情链接模块`、`备案与版权模块`、`联系模块`（颜色项跟随对应模块）

预览渲染策略：
- 预览面板先解析 `details` 为门户默认壳层；
- 再按当前 `tabId` 应用 `pageOverrides`；
- 最终得到当前页面的实际页眉/页脚渲染结果。
- `safe/live` 的差异收敛到**物料组件层**：壳层（页眉/页脚/容器）在两种模式保持一致。

## pageLayout JSON 结构

后端 `tab.pageLayout` 存的是 JSON 字符串，结构约定如下：

```ts
type PortalPageSettingsV2 = {
  version: "2.0";
  basic: {
    pageTitle: string; // 页面标题
    slug?: string; // 页面别名
    isVisible: boolean; // 页面可见性
  };
  layout: {
    colNum: number; // 列数（默认 12）
    colSpace: number; // 列间距（默认 16）
    rowSpace: number; // 行间距（默认 16）
  };
  access: {
    mode: "public" | "login" | "role"; // 访问方式
    roleIds: string[]; // mode=role 时生效
  };
  publishGuard: {
    requireContent: boolean; // 发布时要求有组件内容
    requireTitle: boolean; // 发布时要求有页面标题
  };
};

type PortalLayoutItem = {
  i: string; // 唯一 id
  x: number;
  y: number;
  w: number;
  h: number;
  component?: {
    cmptConfig?: {
      index?: { name: string };
      content?: { name: string };
      style?: { name: string };
      // 其余字段为该物料的业务配置
      [k: string]: unknown;
    };
  };
};

type PageLayoutJson = {
  settings?: PortalPageSettingsV2 | Record<string, unknown>; // 兼容历史 V1
  component?: PortalLayoutItem[];
};
```

页面设置 V2 的读写策略（2026-03-11）：
- **读旧**：渲染与编辑统一通过 `normalizePortalPageSettingsV2` 读取 `settings`，兼容旧结构 `settings.gridData`。
- **写新**：编辑器保存统一通过 `buildPortalPageLayoutForSave` 写回 `version=2.0` 的 `settings`。
- **网格读取统一**：渲染器和编辑器都通过 `getPortalGridSettings` 读取网格参数，避免新旧字段分叉。

保存/发布前校验：
- 统一使用 `validatePortalPageSettingsV2`。
- 默认校验项：
  - `publishGuard.requireTitle=true` 时，`basic.pageTitle` 必填；
  - `access.mode=role` 时，`access.roleIds` 不能为空；
  - `publishGuard.requireContent=true` 时，页面至少存在一个组件。

## 匿名预览与消息刷新

预览页 `PortalPreviewRenderPage`：
- 路由 `meta.public=true`，允许未登录直接访问
- 设计器右侧使用 iframe 加载 `/portal/preview`，独立页面与 iframe 内部都复用 `PortalPreviewPanel`
- 加载数据优先走匿名接口：
  - `GET /cmict/portal/public/portal/tab/detail?id=<tabId>`
- 失败兜底走鉴权接口（用户已登录时可用）：
  - `GET /cmict/portal/tab/detail?id=<tabId>`
- 预留 query 协议（当前为骨架阶段）：
  - `previewMode=safe|live`（模式参数已透传，后续再接入真实数据隔离逻辑）
  - `vw` / `vh`（预览目标视口，供设计器设备画框使用）
- 监听 `postMessage`（同源校验 `e.origin === window.location.origin`）：
  - 接收 `{ type: 'refresh-portal', data: { tabId } }` 后刷新渲染
  - 接收 `{ type: 'preview-shell-details', data: { details, templateId, tabId } }` 后仅覆盖预览壳层配置，不触发接口请求

## 物料注册与动态加载

当前主实现在引擎包：
- 物料目录：`packages/portal-engine/src/materials/cms/**`
- 物料注册表：`packages/portal-engine/src/registry/materials-registry.ts`
- 动态加载：`packages/portal-engine/src/materials/useMaterials.ts`
- 运行时扩展 API：
  - `registerPortalMaterial` / `unregisterPortalMaterial`（注册/移除物料元数据）
  - `registerPortalMaterialComponent` / `unregisterPortalMaterialComponent`（注册/移除运行时渲染组件）

admin 端保留兼容入口（壳层）：
- `apps/admin/src/modules/PortalManagement/materials/registry/materials-registry.ts`
- `apps/admin/src/modules/PortalManagement/materials/useMaterials.ts`
- 兼容入口会把 admin 的 `cmsApi` 绑定到引擎的 `setPortalCmsApi`，保证迁移后组件数据源行为不变。

动态加载策略：
- 通过 `import.meta.glob('./cms/**/index.vue' | './cms/**/content.vue' | './cms/**/style.vue', { eager: true })` 扫描物料目录
- 以组件的 `defineOptions({ name })` 作为 key，要求与 `cmptConfig.index/content/style.name` 一致
- 同时为组件名注入 `pb-*` 与 `cms-*` 双向别名，兼容历史 schema 与新命名
- `packages/portal-engine/src/materials/navigation.ts` 负责 CMS 物料点击导航注入：
  - 共享包不再硬编码 `portalPreviewCmsDetail` / `/frontPortal/cms/list`
  - 应用侧后续通过 `setPortalCmsNavigation()` 注入具体 target
  - 未注入时统一阻断执行并提示，避免直接跳到不存在的路由

新增一个物料的最小目录结构：

```
packages/portal-engine/src/materials/cms/<material>/
  index.vue
  content.vue
  style.vue
  config.json
```

并在 `materials-registry.ts` 中注册到对应分类（并提供 icon、默认 config）。
