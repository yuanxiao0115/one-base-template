# 门户设计器（PC）

本模块用于在后台管理端完成「门户页面」的拖拽布局、配置与预览渲染。

当前实现遵循仓库的边界约定：

- 业务模块落在 `apps/admin/src/modules/PortalManagement`（不侵入 `packages/core`/`packages/ui`）。
- 物料库改为 **前端维护**，不依赖后端返回物料分类/配置。
- 预览页允许 **匿名访问**（`meta.public=true`），用于同页渲染与新窗口预览。
- **不移植**「页面模板」能力：创建时选择页面模板 / 存为模板 / 从历史模板加载等逻辑都不做。

## 目录收敛（2026-03-12）

为减少跨目录切换与平铺组件膨胀，目录统一收敛为 `designPage`：

- `apps/admin/src/modules/PortalManagement/designPage`
  - `pages/PortalTemplateSettingPage.vue`（门户设计主工作台）
  - `pages/PortalPageEditPage.vue`（页面设计器）
  - `pages/PortalPreviewRenderPage.vue`（预览渲染页）
  - `components/portal-template/**`（门户配置主工作台边界内组件）
  - `components/preview-render/**`（预览渲染边界内组件）
  - `composables/portal-template/**`（门户设计页专属组合逻辑）

路由文件 `routes/standalone.ts` 已同步改为从 `designPage/pages` 懒加载。

## 引擎抽包进度（2026-03-06）

为后续 `apps/portal` 独立消费者应用做准备，已完成第一批基础能力下沉到 `packages/portal-engine`：

- `src/schema/types.ts`：`BizResponse`、`PageResult`、`PortalTemplate`、`PortalTab`
- `src/composables/useSchemaConfig.ts`
- `src/utils/deep.ts`：`deepClone`、`deepEqual`
- `src/stores/pageLayout.ts`
- `src/editor/{GridLayoutEditor,PropertyPanel,MaterialLibrary}.vue`
- `src/renderer/PortalGridRenderer.vue`
- `src/renderer/PortalPreviewPanel.vue`（预览页渲染面板，下沉为引擎组件）
- `src/materials/cms/**`（由 `party-building` 迁移并重命名目录）
- `src/materials/useMaterials.ts`（扫描 `cms` 物料，内置 `pb-* <-> cms-*` 组件名别名）
- `src/registry/materials-registry.ts`（默认注册 `cms-*`，并导出 `pb-* -> cms-*` 类型别名映射）
- `src/shell/template-details.ts` + `src/utils/preview.ts`（页眉页脚 details 协议与预览视口工具）
- `src/renderer/shell/**` + `src/renderer/layouts/**`（预览壳层与布局组件）
- `src/editor/PortalPageEditorWorkbench.vue`（页面编辑工作台壳组件）
- `src/editor/PortalDesignerPreviewFrame.vue`（设计器预览舞台组件）
- `src/editor/preview-bridge/**`（预览通信协议与发送器）
- `src/editor/current-tab-actions.ts`（当前页动作编排）
- `src/editor/page-settings-session.ts`（页面设置会话状态机）
- `src/domain/tab-tree.ts`（tab 树领域算法）
- `src/services/page-settings.ts`（页面设置 load/save 服务，支持 API 注入）

当前 admin 侧已改为直接引用 `@one-base-template/portal-engine` 导出，不再维护 `hooks/useSchemaConfig.ts`、`utils/deep.ts`、`stores/pageLayout.ts`、`materials/registry/materials-registry.ts` 这类中转 re-export 层。
另外 `MaterialLibrary` 已改为由页面注入 `categories`，不再直接依赖 admin 内的 registry 路径，便于 `apps/admin` 与后续 `apps/portal` 复用同一编辑器组件。

2026-03-13 继续收敛结果：

- `PortalTemplateSettingPage.vue` 已直接消费引擎导出的 `PortalDesignerPreviewFrame`、`usePortalCurrentTabActions`、`createPortalPageSettingsSession`。
- admin 侧本地实现 `components/portal-template/PortalDesignerPreviewFrame.vue` 与 `composables/portal-template/usePortalCurrentTabActions.ts` 已删除。
- 页面设置会话的锁定/回滚逻辑统一走引擎状态机，页面层仅保留 API 调用和编排。

## 路由说明

管理侧（挂在 `AdminLayout` 内，需要登录/菜单权限）：

- `/portal`：父节点兜底，重定向到列表页
- `/portal/setting`：门户模板列表（表格版，后端概念为 template）
- `/portal/design?id=<id>`：门户配置 IDE（tab 树 + 同页预览 + 新建页面）
- `/resource/portal/setting?id=<id>`：兼容别名（自动映射到 `/portal/design`）
- `/portal/page/edit?id=<id>&tabId=<id>`：页面编辑器（深度编辑模式，保留拖拽布局 + 保存 + 预览）

预览渲染（顶层路由，不挂 `AdminLayout`，允许匿名）：

- `/portal/preview?templateId=<id>&tabId=<id>`：渲染指定 tab 的 pageLayout（通常给新窗口使用；同页预览复用同一渲染组件）

页面编辑实时预览（2026-03-12）：

- `PortalPageEditPage` 打开预览后，会通过 `preview-bridge` 持续向预览窗口发送 `preview-page-runtime` 消息（包含 `tabId/templateId/settings/component`）。
- `PortalPreviewPanel` 新增 `preview-page-runtime` 消息处理，收到后立即更新 `pageSettingData/layoutItems`，无需手动刷新预览页。
- 页面设置字段覆盖范围：`basic/layout/layoutContainer/spacing/background/banner/headerFooterBehavior/responsive/access/publishGuard`。

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
  - `权限配置`：打开统一权限入口弹窗（可切换“门户权限 / 页面权限”）
  - `配置`：进入 `/portal/design?id=<id>`
  - `预览`：打开 `/portal/preview?templateId=<id>&tabId=<id>`
  - `发布/取消发布`：调用 `template.publish`
  - `删除`：调用 `template.delete`（带确认弹窗）

统一权限入口弹窗：

- 默认进入“门户权限”页签，弹窗内直接内嵌门户权限编辑表单（无二次弹窗）。
- 切到“页面权限”时，左侧展示该模板下可编辑页面树（按 tab 树层级），右侧直接内嵌当前页面权限表单（无二次弹窗）。
- 设计器页内不再提供权限入口，权限统一从模板列表进入。

门户权限编辑器（对齐老项目 `portal-authority-form.vue`）：

- 授权类型支持 `person`（人员）与 `role`（角色）。
- 人员模式：配置 `whiteDTOS`（可访问人员）、`blackDTOS`（不可访问人员）、`userIds`（可维护人员）。
- 角色模式：配置 `allowRole.roleIds`、`forbiddenRole.roleIds`、`configRole.roleIds`。
- 保存前先请求 `GET /cmict/portal/template/detail?id=<id>`，回填 `templateName/templateType/isOpen/id` 等历史必填字段，再调用 `POST /cmict/portal/template/update`。

页面权限编辑器：

- 授权类型支持 `person` 与 `role`。
- `person`：保存为 `allowPerms.userIds`、`forbiddenPerms.userIds`、`configPerms.userIds`。
- `role`：保存为 `allowPerms.roleIds`、`forbiddenPerms.roleIds`、`configPerms.roleIds`。
- 保存前先调用 `GET /cmict/portal/tab/detail` 拉取页签详情，并回填 `id/tabName/templateId/sort` 等必填字段。
- 保存统一调用 `POST /cmict/portal/tab/update`。
- 选人左侧树严格对齐老项目：固定调用 `GET /cmict/admin/org/detail/children-and-user`，根节点入参优先使用当前登录用户 `companyId`（缺失再回退 `parentId=\"0\"`），并兼容 `orgDetailList/userStructureQueryVOS` 返回结构，避免“左树无数据”。

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
- `tabType=3`：链接
- 左侧树默认不展示统计条，节点操作区使用图标按钮（编辑/新建/更多），并支持关键字搜索。

当前工作台（2026-03-11）布局口径：

- 页面采用「左侧结构树 + 右侧编辑工作台」双栏模型。
- 顶部为窄条信息头（返回 / 模板名 / 页眉页脚配置 / 刷新），不再使用厚头部或多层卡片。
- 右侧首行是“当前页面动作条”，承载页面级操作：页面设置、进入编辑、隐藏、预览、删除；预览模式/视口与舞台交互（自动/手动、缩放、重置）都放在工具栏同一行。
- 右侧预览区使用“设备画框 + iframe”结构，支持按目标视口等比缩放预览（先完成框架，不改数据链路）。
- `preview-host-frame` 尺寸变化（拖动窗口、打开/收起 DevTools）会触发重新计算缩放，预览区会随容器自适应。
- `preview-host-frame` 舞台底层使用轻网格背景（仅视觉辅助，不参与业务渲染）。
- 预览内增加双边界辅助线：`preview-shell` 表示“门户区域”、`content-container` 表示“页面区域”，用于快速辨认壳层与页面内容边界。
- `tree-header` 与 `preview-head` 均已移除，整体保持白底、低边框、直角风格。
- 预览舞台新增手动增强：支持 `50%~200%` 手动缩放、按住拖拽平移、重置视图（默认仍是自动缩放）。
- 视口分辨率切换改为 `postMessage` 下发，不再通过切换 iframe URL 触发整页重载，避免重复接口请求。

### 2) 新建空白页并直接进入编辑

你可以从两个入口新建页面：

- 顶部按钮：`新建页面`（创建根节点）
- 树节点右侧：`新建` → `新建同级 / 新建子级`（子级仅允许导航组 tabType=1）

创建步骤：

1. 弹出对话框输入 `页面名称(tabName)`
2. 选择类型（在老项目枚举基础上新增门户列表便捷项）：
   - `tabType=1`：导航组
   - `tabType=2`：空白页（可拖拽编辑）
   - `tabType=3`：链接（需填写地址/打开方式/单点方式）
   - `tabType=4`：门户列表（从门户下拉中选择，自动生成 `/portal/index?templateId=...` 链接）
3. 调用 `POST /cmict/portal/tab/add` 创建 tab
4. 若创建的是空白页（`tabType=2`），创建成功后 **直接跳转** `/portal/page/edit?id=<id>&tabId=<newTabId>` 进入拖拽编辑器
5. 若创建的是导航组/链接/门户列表，则停留在 designer 并刷新页面树

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

权限入口约定：

- 设计器不再承载权限配置能力。
- 门户权限与页面权限统一收口到 `/portal/setting` 列表页“权限配置”入口。

## 页眉页脚壳层配置（details）

当前 Designer 继续使用 `template.update`，不新增后端接口；页眉页脚配置统一维护在 `template.details` JSON（字符串）中。

入口层级约定：

- **门户级** 页眉页脚配置入口放在 Designer 顶部栏（HeaderBar）。
- **页面级** 壳层覆盖入口收敛到“页面设置”抽屉（`页眉设置 / 页脚设置` 标签），不再额外提供独立按钮入口。
- **容器约束**：门户级配置与页面级配置均使用 `ObCrudContainer(container="drawer")`，抽屉宽度统一 `400`，确保两套面板交互与密度一致。

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
  version: '2.0';
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
  layoutMode:
    | 'global-scroll'
    | 'header-fixed-content-scroll'
    | 'header-fixed-footer-fixed-content-scroll';
  layoutContainer: {
    widthMode: 'full-width' | 'fixed' | 'custom';
    fixedWidth: number;
    customWidth: number;
    contentAlign: 'left' | 'center';
    contentMinHeight: number;
    overflowMode: 'auto' | 'scroll' | 'hidden';
  };
  spacing: {
    marginTop: number;
    marginRight: number;
    marginBottom: number;
    marginLeft: number;
    paddingTop: number;
    paddingRight: number;
    paddingBottom: number;
    paddingLeft: number;
  };
  background: {
    backgroundColor: string;
    backgroundImage: string;
    backgroundRepeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
    backgroundSizeMode: 'cover' | 'contain' | 'custom';
    backgroundSizeCustom: string;
    backgroundPosition: string;
    backgroundAttachment: 'scroll' | 'fixed';
    scope: 'page' | 'content' | 'banner';
    overlayColor: string;
    overlayOpacity: number;
  };
  banner: {
    enabled: boolean;
    image: string;
    height: number;
    fullWidth: boolean;
    linkUrl: string;
    overlayColor: string;
    overlayOpacity: number;
  };
  headerFooterBehavior: {
    headerSticky: boolean;
    headerOffsetTop: number;
    footerMode: 'normal' | 'fixed';
    footerFixedHeight: number;
  };
  responsive: {
    pad: {
      enabled: boolean;
      maxWidth: number;
      colNum: number;
      colSpace: number;
      rowSpace: number;
      marginTop: number;
      marginRight: number;
      marginBottom: number;
      marginLeft: number;
      paddingTop: number;
      paddingRight: number;
      paddingBottom: number;
      paddingLeft: number;
      bannerHeight: number;
    };
    mobile: {
      enabled: boolean;
      maxWidth: number;
      colNum: number;
      colSpace: number;
      rowSpace: number;
      marginTop: number;
      marginRight: number;
      marginBottom: number;
      marginLeft: number;
      paddingTop: number;
      paddingRight: number;
      paddingBottom: number;
      paddingLeft: number;
      bannerHeight: number;
    };
  };
  access: {
    mode: 'public' | 'login' | 'role'; // 访问方式
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

- **读旧**：渲染与编辑统一通过 `normalizePortalPageSettingsV2` 读取 `settings`，兼容旧结构 `gridData/marginData/backgroundData/headerFooterData`。
- **写新**：编辑器保存统一通过 `buildPortalPageLayoutForSave` 写回 `version=2.0` 的 `settings`。
- **断点运行时解析统一**：渲染器和编辑器通过 `resolvePortalPageRuntimeSettings` / `getPortalGridSettings` 解析当前视口下的栅格与间距。
- **入口收敛（2026-03-12）**：`/portal/design` 已支持页面设置抽屉（动作条“页面设置”），可在设计页内直接修改并保存 `pageLayout.settings`；`/portal/page/edit` 继续作为深度编辑入口。
- **容器统一（2026-03-12）**：`PortalPageSettingsDrawer` 与 `PortalShellSettingsDialog` 均使用 `ObCrudContainer`（`container="drawer"`），抽屉宽度统一 `400`，不再直接使用 `el-drawer` / `el-dialog` 组装。
- **抽屉结构（2026-03-12）**：页面设置抽屉收敛为单层四标签：`基础设置 / 高级设置 / 页眉设置 / 页脚设置`。页眉/页脚启用开关内嵌在对应标签页顶部，减少抽屉顶部额外占位。
- **切换约束（2026-03-12）**：页面设置抽屉打开后会锁定当前 `tabId`，禁止在左侧树切换页面；保存和预览消息均使用该锁定 `tabId`，避免慢网场景出现跨页串写。
- **预览滚动语义修复（2026-03-13）**：`header-fixed-content-scroll` 模式下，`overflowMode(auto/scroll/hidden)` 现已作用于真实内容滚动容器，不再被外层固定布局的默认滚动行为短路；`header-fixed-footer-fixed-content-scroll` 继续强制内容区滚动。
- **卡片规范（2026-03-12）**：页面设置相关分组统一改为 `@one-base-template/ui` 的 `ObCard`，样式基线为白底、`1px solid #e2e8f0` 边框、`4px` 圆角、`16px` 内边距、标题 `14px #333` + 主题色前缀块，保证配置区视觉一致。
- **紧凑化统一（2026-03-12）**：页面设置与页眉/页脚设置统一采用 `label-position=top` + `#f5f7fa` 面板背景 + `#fff` 卡片分组；单行常规输入控件统一收敛为 `320px`，复杂区域保持全宽。
- **颜色字段统一（2026-03-12）**：颜色配置统一为“色块 + HEX 输入”复合控件（`ObColorField`），提升可读性与可编辑性，避免只保留小色块导致的大面积留白。
- **导航与折叠（2026-03-12）**：页面设置表单已移除锚点导航与高级折叠，改为通过 `基础设置 / 高级设置` 标签分段编辑，减少滚动干扰与视觉噪音。
- **模式控件统一（2026-03-12）**：页面“布局模式”、页眉“页眉模式”、页脚“布局模式”与壳层“内容宽度模式”统一改为 `el-select`，避免混用 `radio` 导致的视觉松散。
- **输入约束（2026-03-12）**：所有文本输入统一补齐 `maxlength`；超过 20 字预期的字段（URL/描述/公告/版权等）统一改为多行输入并展示字数统计。
- **字段裁剪（2026-03-12）**：`/portal/design` 的布局设置已移除 `访问控制`、`发布校验` 两组，仅保留布局与样式相关项；`/portal/page/edit` 仍保留完整页面设置字段。
- **配置边界**：页面设置不包含“默认/营销/政务”等预设模板入口，按当前页面真实配置直接编辑。

保存/发布前校验：

- 统一使用 `validatePortalPageSettingsV2`。
- `访问控制/发布校验` 字段仅在 `/portal/page/edit` 深度编辑场景生效，`/portal/design` 抽屉不再暴露这两组配置。
- 默认校验项：
  - `publishGuard.requireTitle=true` 时，`basic.pageTitle` 必填；
  - `access.mode=role` 时，`access.roleIds` 不能为空；
  - `publishGuard.requireContent=true` 时，页面至少存在一个组件。
  - `banner.enabled=true` 时，`banner.image` 为建议项（为空不阻断保存）；
  - 同时启用 `pad/mobile` 断点时，`mobile.maxWidth < pad.maxWidth`。

## 编辑态滚动与层级模型（2026-03-11）

页面编辑器采用“外层固定高度，三栏内部滚动”：

- 左侧物料库：头部固定，分类列表内部滚动。
- 中间画布：画布区域内部滚动（超出后滚动，不再推动整页）。
- 右侧设置：tabs 内容区内部滚动。

编辑器建议保持 **5 层结构**：

1. 工作台壳层：`page/topbar/content`（只负责占满可视区，不承载业务滚动）。
2. 三栏容器层：`MaterialLibrary + canvas + right-panel`（负责三栏分配与高度传递）。
3. 画布视口层：`canvas-inner`（隔离滚动边界，避免滚动冒泡到外层）。
4. 页面框架层：`page-frame/page-canvas/banner`（承载边距、背景、Banner 独立区域）。
5. 栅格渲染层：`grid-container/grid-layout/grid-item`（承载拖拽布局与组件渲染）。

预览渲染建议保持 **4 层结构**：

1. 预览壳层：`preview-page/preview-shell`（是否内容区滚动、是否固定壳层）。
2. 内容滚动层：`content`（根据 `layoutMode + overflowMode` 决定滚动策略）。
3. 页面框架层：`content-frame/content-container/banner`（边距、背景、Banner）。
4. 组件栅格层：`PortalGridRenderer`（仅负责组件网格渲染，不参与壳层滚动决策）。

补充（2026-03-12）：

- 设计器外层设备舞台（`preview-host-frame`）默认隐藏自身滚动条，避免与 iframe 内部滚动策略叠加。
- 目标视口缩放计算按“容器内容区尺寸（扣除 padding）”执行，避免边界 1px 误差触发外层滚动条。

## 匿名预览与消息刷新

预览页 `PortalPreviewRenderPage`：

- 路由 `meta.public=true`，允许未登录直接访问
- 设计器右侧使用 iframe 加载 `/portal/preview`，独立页面与 iframe 内部都复用 `@one-base-template/portal-engine` 导出的 `PortalPreviewPanel`（不再维护 admin 本地副本）
- 加载数据优先走匿名接口：
  - `GET /cmict/portal/public/portal/tab/detail?id=<tabId>`
- 失败兜底走鉴权接口（用户已登录时可用）：
  - `GET /cmict/portal/tab/detail?id=<tabId>`
- 预留 query 协议（当前为骨架阶段）：
  - `previewMode=safe|live`（模式参数已透传，后续再接入真实数据隔离逻辑）
- 监听 `postMessage`（同源校验 `e.origin === window.location.origin`）：
  - 接收 `{ type: 'refresh-portal', data: { tabId } }` 后刷新渲染
  - 接收 `{ type: 'preview-shell-details', data: { details, templateId, tabId } }` 后仅覆盖预览壳层配置，不触发接口请求
  - 接收 `{ type: 'preview-viewport', data: { width, height, templateId, tabId } }` 后仅更新预览视口，不触发接口请求

## 物料注册与动态加载

当前主实现在引擎包：

- 物料目录：`packages/portal-engine/src/materials/cms/**`
- 物料注册表：`packages/portal-engine/src/registry/materials-registry.ts`
- 动态加载：`packages/portal-engine/src/materials/useMaterials.ts`
- 上下文化目录读取：
  - `usePortalMaterialCatalog(context, { scene })`
  - `scene='editor'` 返回编辑态 `categories + materialsMap`
  - `scene='renderer'` 返回渲染态 `materialsMap`

admin 端扩展入口（正式）：

- `apps/admin/src/modules/PortalManagement/engine/register.ts`
- `apps/admin/src/modules/PortalManagement/materials/extensions/index.ts`
- `setupPortalEngineForAdmin()` 会统一完成三件事：
  - 绑定 admin 的 `cmsApi + pageSettingsApi`
  - 注入 `PORTAL_ADMIN_MATERIAL_EXTENSIONS`
  - 合并调用方传入的 `materialExtensions`

动态加载策略：

- `useEditorMaterials()` 负责编辑态，加载 `index/content/style` 三类组件
- `useRendererMaterials()` 负责预览态/渲染态，只加载 `index` 运行态组件
- `useMaterials()` 仅保留历史兼容，默认等同于 `useEditorMaterials()`
- 组件 key 以 `defineOptions({ name })` 为准，必须与 `cmptConfig.index/content/style.name` 一致
- 路径推导名与 config 名存在历史 `base-` 前缀差异时，必须在 `static-fallbacks/*.ts` 中显式声明 alias
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

## 设计器导出语义（推荐）

推荐业务页面优先从语义化入口导入：

```ts
import {
  PortalTemplateDesignerLayout,
  PortalTemplateDesignerHeader,
  PortalTemplateDesignerSidebar,
  PortalTemplateDesignerToolbar,
  PortalTemplateDesignerPreview,
  PortalTemplateDesignerPageAttributesDialog,
  PortalTemplateDesignerShellSettingsDrawer,
  PortalPageDesignerLayout,
  PortalPageDesignerSettingsDrawer,
  PortalMaterialPalette,
  PortalPropertyInspector,
  usePortalTemplateDesignerRoute,
  usePortalPageDesignerRoute
} from '@one-base-template/portal-engine/designer';
```

实现语义入口（`Workbench / Controller / ByRoute`）保留在：

```ts
import { PortalTemplateWorkbenchShell } from '@one-base-template/portal-engine/internal';
```

边界约束：

- `designer`：默认给业务同学使用，名称一眼可读。
- `designer` 会继续把“页面设置抽屉 / 门户壳层设置抽屉 / 页面属性弹窗”这类辅助设计器组件补成语义化名字，页面层优先使用这些 alias。
- `internal`：用于框架封装与高级接入，避免页面层直接绑定实现细节名词。
