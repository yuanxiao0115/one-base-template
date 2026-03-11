# 门户设计器（PC）

本模块用于在后台管理端完成「门户页面」的拖拽布局、配置与预览渲染。

当前实现遵循仓库的边界约定：
- 业务模块落在 `apps/admin/src/modules/PortalManagement`（不侵入 `packages/core`/`packages/ui`）。
- 物料库改为 **前端维护**，不依赖后端返回物料分类/配置。
- 预览页允许 **匿名访问**（`meta.public=true`），用于 iframe/新窗口预览。
- **不移植**「页面模板」能力：创建时选择页面模板 / 存为模板 / 从历史模板加载等逻辑都不做。

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
- `/resource/portal/setting?id=<id>`：门户配置 IDE（tab 树 + iframe 预览 + 新建页面）
- `/portal/page/edit?id=<id>&tabId=<id>`：页面编辑器（拖拽布局 + 保存 + 预览）

预览渲染（顶层路由，不挂 `AdminLayout`，允许匿名）：
- `/portal/preview?templateId=<id>&tabId=<id>`：渲染指定 tab 的 pageLayout（通常给 iframe / 新窗口使用）

独立消费者应用（`apps/portal`）：
- `/portal/index/:tabId?templateId=<id>`：门户前台渲染入口（匿名可访问，`meta.public=true`）
- `/portal/preview/:tabId?templateId=<id>`：匿名预览入口（与 admin 预览协议一致）
- 启动命令：`pnpm dev:portal`（等价 `pnpm -C apps/portal dev`）

标签栏约定（基于 core tabs 规则）：
- `/resource/portal/setting`、`/portal/page/edit`、`/portal/preview` 均通过 `meta.hiddenTab=true` 处理为“不进入顶部标签栏”
- 这样可保持门户编辑/预览页为全屏工作区，不与常规业务页签混排

## 门户模板列表（表格版）

入口：`/portal/setting`

当前最小能力（不改后端接口）：
- 新增：点击右上角 `新增门户` → 填写门户名称/模板布局/门户类型/描述 → 创建成功后进入 `/resource/portal/setting?id=<id>`
- 编辑：行内 `编辑`，复用同一表单弹窗回写 `template.update`
- 复制：行内 `复制`，复用同一表单弹窗调用 `template.copy`
- 搜索：门户名称关键字（`searchKey`）
- 筛选：发布状态（全部/草稿/已发布）
- 分页：`currentPage/pageSize`
- 行内操作：
  - `配置`：进入 `/resource/portal/setting?id=<id>`
  - `预览`：打开 `/portal/preview?templateId=<id>&tabId=<id>`
  - `发布/取消发布`：调用 `template.publish`
  - `删除`：调用 `template.delete`（带确认弹窗）

列表交互基线（对齐 admin）：
- 表格渲染统一使用 `ObVxeTable`（不使用 `el-table`）
- 消息提示统一使用 `@one-base-template/ui`（不直接使用 `ElMessage`）

新增门户模板字段说明（对齐老项目，避免部分环境后端校验失败）：
- `templateType`：模板布局（0=左侧导航、1=顶部导航、2=全屏左导航），默认 0
- `isOpen`：门户类型（0=普通门户、1=匿名门户），默认 0

## 新建页面（按老项目裁剪后的逻辑）

> 仅保留“直接新建页面并编辑”的流程；不做“页面模板/历史模板/存为模板”。

入口：`/resource/portal/setting?id=<id>`

### 1) 页面树导航（tabList）

Designer 左侧的页面树来自后端 `template.detail` 返回的 `tabList`（树结构）。

- `tabType=1`：导航组（不可选中预览，但可以作为“新建子级”的父节点）
- `tabType=2`：空白页（可预览/可编辑）
- `tabType=3`：链接（当前 Designer 不做配置入口，后续如需要再补）

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

## pageLayout JSON 结构

后端 `tab.pageLayout` 存的是 JSON 字符串，结构约定如下：

```ts
type PortalPageSettings = {
  gridData: {
    colNum: number;     // 列数（默认 12）
    colSpace: number;   // 列间距（默认 16）
    rowSpace: number;   // 行间距（默认 16）
  };
  // 后续可扩展：背景色、最大宽、边距等
  [k: string]: unknown;
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
  settings?: PortalPageSettings;
  component?: PortalLayoutItem[];
};
```

编辑器保存时会写回：
- `settings = pageSettingData`
- `component = layoutItems`

## 匿名预览与 iframe 刷新

预览页 `PortalPreviewRenderPage`：
- 路由 `meta.public=true`，允许未登录直接访问
- 加载数据优先走匿名接口：
  - `GET /cmict/portal/public/portal/tab/detail?id=<tabId>`
- 失败兜底走鉴权接口（用户已登录时可用）：
  - `GET /cmict/portal/tab/detail?id=<tabId>`
- 监听 `postMessage`（同源校验 `e.origin === window.location.origin`）：
  - 接收 `{ type: 'refresh-portal', data: { tabId } }` 后刷新渲染

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
