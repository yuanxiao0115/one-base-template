# 门户设计器（PC）

本模块用于在后台管理端完成「门户页面」的拖拽布局、配置与预览渲染。

当前实现遵循仓库的边界约定：
- 业务模块落在 `apps/admin/src/modules/portal`（不侵入 `packages/core`/`packages/ui`）。
- 物料库改为 **前端维护**，不依赖后端返回物料分类/配置。
- 预览页允许 **匿名访问**（`meta.public=true`），用于 iframe/新窗口预览。
- **不移植**「页面模板」能力：创建时选择页面模板 / 存为模板 / 从历史模板加载等逻辑都不做。

## 路由说明

管理侧（挂在 `AdminLayout` 内，需要登录/菜单权限）：
- `/portal`：父节点兜底，重定向到列表页
- `/portal/templates`：门户列表（后端概念为 template）
- `/portal/designer?templateId=<id>`：门户配置 IDE（tab 树 + iframe 预览 + 新建页面）
- `/portal/layout?tabId=<id>&templateId=<id>`：页面编辑器（拖拽布局 + 保存 + 预览）

预览渲染（顶层路由，不挂 `AdminLayout`，允许匿名）：
- `/portal/preview/:tabId?templateId=<id>`：渲染指定 tab 的 pageLayout（通常给 iframe / 新窗口使用）

## 新建页面（按老项目裁剪后的逻辑）

> 仅保留“新建空白页(tabType=2)”并直接进入编辑器；不做“页面模板/历史模板/存为模板”。

入口：`/portal/designer?templateId=<id>`

### 1) 页面树导航（tabList）

Designer 左侧的页面树来自后端 `template.detail` 返回的 `tabList`（树结构）。

- `tabType=1`：导航组（不可选中预览，但可以作为“新建子级”的父节点）
- `tabType=2`：空白页（可预览/可编辑）
- `tabType=3`：链接（当前 Designer 不做配置入口，后续如需要再补）

### 2) 新建空白页并直接进入编辑

你可以从两个入口新建空白页：
- 顶部按钮：`新建空白页`（创建根页面）
- 树节点右侧：`新建` → `新建同级 / 新建子级`（子级仅允许导航组 tabType=1）

创建步骤：
1. 弹出对话框输入 `页面名称(tabName)`
2. 调用 `POST /cmict/portal/tab/add` 创建 tab（默认 `tabType=2`，`pageLayout={"component":[]}`）
3. 创建成功后 **直接跳转** `/portal/layout?templateId=<id>&tabId=<newTabId>` 进入拖拽编辑器

兼容性兜底（无需后端改动）：
- 若某些环境 `tab.add` 后没有自动挂到 `template.tabList/tabIds`，前端会：
  - 复拉一次 `template.detail` 确认是否已挂载
  - 若未挂载则把新 tabId 追加到 `template.tabIds` 并 `template.update`，再复拉确认

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

物料注册表（前端维护）：
- `apps/admin/src/modules/portal/materials/registry/materials-registry.ts`

动态加载物料组件映射：
- `apps/admin/src/modules/portal/materials/useMaterials.ts`
- 通过 `import.meta.glob('./**/index.vue' | './**/content.vue' | './**/style.vue', { eager: true })` 扫描物料目录
- 以组件的 `defineOptions({ name })` 作为 key，要求与 `cmptConfig.index/content/style.name` **一致**

新增一个物料的最小目录结构：

```
apps/admin/src/modules/portal/materials/<group>/<material>/
  index.vue
  content.vue
  style.vue
  config.json
```

并在 `materials-registry.ts` 中注册到对应分类（并提供 icon、默认 config）。
