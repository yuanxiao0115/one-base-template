# portal-engine 能力边界

> 适用范围：`packages/portal-engine`、`apps/admin/src/modules/PortalManagement`、`apps/portal/src/modules/portal`

`portal-engine` 是门户设计器与渲染能力的共享引擎包，目标是让 admin 与 portal 复用同一套编辑/渲染核心，而不是在应用层重复实现。

## 这页解决什么问题

- 这个包负责什么，**不负责**什么。
- admin 与 portal 应该怎样依赖它。
- 新增物料、扩展动作、接入 API 时，代码应该落在哪里。

## 目录与职责

```text
packages/portal-engine/src/
  actions/       # 页面动作解析与目标注册
  composables/   # 复用式组合能力（如 schema 配置读取）
  container/     # CMS 容器与通用渲染容器
  domain/        # 领域算法（tab-tree 等）
  editor/        # 设计器能力（布局编辑、属性面板、物料面板）
  services/      # 可注入服务（页面设置读写等）
  materials/     # 物料组件与动态加载
  registry/      # 物料注册表
  renderer/      # 门户渲染器
  schema/        # 共享协议类型
  stores/        # 设计器状态
```

## 应用分层约定

- `packages/portal-engine`
  - 负责编辑器/渲染器/物料注册等共享能力。
  - 允许依赖 Vue、Element Plus、grid-layout-plus。
  - 禁止依赖 `apps/*`。
- `apps/admin`
  - 负责后台管理端编排（路由、页面壳、接口注入）。
  - 通过 `apps/admin/src/modules/PortalManagement/engine/register.ts` 作为唯一注册入口，统一注入引擎能力（CMS API、导航扩展等）。
  - 页面层只消费引擎组件与 schema，不直接散落调用 `portal-engine` 底层注册 API。
- `apps/portal`
  - 负责消费者渲染入口与前台分流。
  - 复用 `portal-engine` 渲染器，不复制引擎内部逻辑。

## 常用接入点

1. 物料接入：`packages/portal-engine/src/materials/cms/<material>/`
2. 物料注册：`packages/portal-engine/src/registry/materials-registry.ts`
3. 行为扩展：`packages/portal-engine/src/materials/navigation.ts`
4. 页面渲染：`packages/portal-engine/src/renderer/PortalGridRenderer.vue`

## 2026-03-13 P0 下沉（admin 消费者化）

本轮把 admin 中高频重复的设计器域逻辑下沉到了 `portal-engine`：

- `editor/preview-bridge/*`
  - 统一预览通信协议常量与消息构建（`preview-shell-details` / `preview-viewport` / `preview-page-runtime` / `preview-page-ready`）。
  - 提供 `sendPreviewShellDetails/sendPreviewViewport/sendPreviewRuntime/sendPreviewPageRuntimeToWindow`，替换页面内手写 `postMessage`。
- `domain/tab-tree.ts`
  - 统一 tab 树领域算法：`find/contains/nextSort/editable/normalize`。
  - admin 的 `utils/portalTree.ts` 已收敛为兼容转发层。
- `services/page-settings.ts`
  - 下沉页面设置 load/save 逻辑（解析 pageLayout、合并 settings、构建保存 payload）。
  - 通过 API 注入实现跨应用复用，不在页面层散落 `tab.detail/tab.update` 细节。

## 2026-03-16 颜色字段统一

- `ObColorField` 作为颜色输入的唯一实现，维护位置：`packages/ui/src/components/field/ObColorField.vue`。
- `portal-engine` 内部样式配置面板统一使用 `ObColorField`。
- `PortalColorField` 已删除，不再保留兼容壳与兼容导出；新增代码必须使用 `ObColorField`。

## 2026-03-13 P1/P2 下沉（工作台编排继续收敛）

- `editor/PortalDesignerPreviewFrame.vue`
  - 设计器预览舞台组件下沉到引擎，admin 不再维护本地同构组件。
  - 暴露 `postMessageToFrame/setInteractionMode/zoomIn/zoomOut/resetView`，保持既有工作台调用不变。
- `editor/preview-stage-utils.ts`
  - 抽出预览舞台缩放/平移纯函数（边界计算、偏移钳制、缩放百分比钳制）。
  - 配套单测 `editor/preview-stage-utils.test.ts`，保障交互核心逻辑可回归。
- `editor/current-tab-actions.ts`
  - 下沉“当前页动作编排”逻辑（编辑、页面设置、隐藏、删除、预览）。
  - 通过 `resolvePreviewHref` 与回调注入保持 admin 消费者角色，不把路由细节写死在引擎。
- `editor/page-settings-session.ts`
  - 下沉页面设置会话状态机（tab 锁定、草稿状态、关闭回滚、保存收口）。
  - admin 页面仅负责 API 调用与消息提示，会话流转交由引擎维护。
- `workbench/template-workbench-controller.ts`
  - 下沉模板工作台的模板加载、属性弹窗、隐藏/删除、拖拽排序与“新建后直达编辑页”编排。
  - 通过 `api/notify/confirm/openEditor/syncRouteTabId` 注入应用依赖，保持 `apps/admin` 只做消费者。
- `workbench/useTemplateWorkbench.ts`
  - 提供页面层直接消费的组合式入口，admin 页面无需再维护同构树操作与属性提交逻辑。
- `workbench/template-workbench-page-controller.ts`
  - 继续下沉模板工作台页面级编排：预览舞台状态、页面设置抽屉、页眉页脚草稿预览与保存回滚。
  - 通过 `context/api/notify/confirm/openEditor/syncRouteTabId/resolvePreviewHref` 注入应用依赖，admin 页面只保留路由与壳组件拼装。
- `workbench/useTemplateWorkbenchPage.ts`
  - 提供模板工作台页面的消费者入口，统一组合 `template-workbench-controller + current-tab-actions + page-settings-session + preview-bridge`。
- `workbench/page-editor-controller.ts`
  - 下沉页面编辑工作台编排：tab 详情加载、页面保存、预览窗口同步与 `preview-page-ready` 回传处理。
  - `api/notify/resolvePreviewHref/openWindow` 均采用注入模式，避免把 admin 路由和消息实现写死在引擎。
- `workbench/usePageEditorWorkbench.ts`
  - 页面编辑消费者入口，自动接管预览窗口消息监听与销毁清理。
- `workbench/PortalTemplateWorkbenchShell.vue`
  - 下沉模板工作台壳层布局（header/tree/toolbar/preview/dialogs 五段插槽）。
  - admin 页面只保留业务组件拼装，不再维护重复布局样式。
- `workbench/useTemplateWorkbenchPageByRoute.ts`
  - 下沉模板工作台的路由编排（`templateId/tabId` 解析、`tabId` 路由同步、`openEditor` 与 `resolvePreviewHref` 组装）。
  - 页面层仅注入 `routeQuery/replace/push/resolve` 能力，不再重复写路由拼装细节。
- `workbench/template-workbench-route.ts`
  - 提供模板工作台路由辅助函数，统一 `query -> templateId/tabId` 解析与编辑页/预览页 location 构建。
- `workbench/usePortalPreviewPageByRoute.ts`
  - 下沉预览页路由编排（`tabId/templateId/previewMode/viewport` 解析与导航回写）。
  - admin 预览页仅注入 `routeQuery/routeParams/replaceRouteQuery`，不再在页面内重复处理 query 与外链跳转。
- `workbench/preview-data-source.ts`
  - 下沉预览数据源组装（公开接口优先 + 失败回退管理接口）。
  - admin 预览页改为注入 `tabPublic.detail/tab.detail/template.detail`，不再维护重复的 `BizResponse` 成功判定逻辑。
- `workbench/PortalDesignerHeaderBar.vue`
  - 下沉模板工作台顶部栏（返回、刷新、页眉页脚入口），admin 页面不再维护同构头部组件。
- `workbench/PortalDesignerTreePanel.vue`
  - 下沉左侧树面板壳（搜索、新建入口），并复用引擎内 `PortalTabTree`。
- `workbench/PortalTabTree.vue`
  - 下沉 tab 树交互组件（筛选、拖拽排序、节点动作菜单），统一依赖 `domain/tab-tree`。
- `workbench/PortalDesignerActionStrip.vue`
  - 下沉页面动作条（预览模式/视口、缩放、编辑/设置/隐藏/预览/删除），保持与工作台编排器事件契约一致。
- `workbench/PortalTabAttributeDialog.vue`
  - 下沉“页面属性弹窗”并移除 admin API 直连，改为 `loadTemplateList` 注入式加载门户模板选项，满足跨应用复用。

## admin 注册入口（必须）

`apps/admin` 作为消费者时，只允许在 `apps/admin/src/modules/PortalManagement/engine/register.ts` 注入扩展能力：

```ts
import {
  setPortalCmsApi,
  setPortalCmsNavigation,
  setPortalPageSettingsApi
} from '@one-base-template/portal-engine';

setPortalCmsApi({
  getCategoryTree: cmsApi.getCategoryTree,
  getUserArticlesByCategory: cmsApi.getUserArticlesByCategory,
  getUserCarouselsByCategory: cmsApi.getUserCarouselsByCategory
});

setPortalPageSettingsApi({
  getTabDetail: ({ id }) => portalApi.tab.detail({ id }),
  updateTab: (payload) => portalApi.tab.update(payload)
});

setPortalCmsNavigation(options.cmsNavigation ?? {});
```

规则：页面层禁止直接调用 `setPortal*`，统一走 register 入口，避免注入能力分散在业务页面。

## 模板工作台消费者接入

`PortalTemplateSettingPage.vue` 这类页面应优先消费 `useTemplateWorkbenchPage()`，而不是在页面层重新维护页面设置会话、预览桥与模板树状态：

```ts
import { useTemplateWorkbenchPage } from '@one-base-template/portal-engine';

const workbenchPage = useTemplateWorkbenchPage({
  context: setupPortalEngineForAdmin(),
  templateId,
  routeTabId,
  previewTarget: previewFrameRef,
  api: {
    template: {
      detail: portalApi.template.detail,
      update: portalApi.template.update,
      hideToggle: portalApi.template.hideToggle
    },
    tab: {
      detail: portalApi.tab.detail,
      add: portalApi.tab.add,
      update: portalApi.tab.update,
      delete: portalApi.tab.delete
    }
  },
  notify: {
    success: (text) => message.success(text),
    error: (text) => message.error(text),
    warning: (text) => message.warning(text)
  },
  confirm: async ({ message: text, title }) => {
    await confirm.warn(text, title);
  },
  syncRouteTabId: updateRouteTabId,
  openEditor: ({ templateId, tabId }) => {
    router.push({
      path: '/portal/page/edit',
      query: { id: templateId, tabId }
    });
  },
  resolvePreviewHref: ({ templateId, tabId, previewMode }) =>
    router.resolve({
      name: 'PortalPreview',
      query: { templateId, tabId, previewMode }
    }).href
});
```

页面层保留的职责应收敛为：

- 路由参数解析与 `router/message/confirm` 注入
- 预览舞台、树面板、抽屉/对话框等壳组件拼装
- 首次 `loadTemplate()` 触发与页面级返回动作

若希望进一步减少页面层路由样板代码，推荐直接使用 `useTemplateWorkbenchPageByRoute()`：

```ts
import { useTemplateWorkbenchPageByRoute } from '@one-base-template/portal-engine';

const { templateId, controller: workbenchPage } = useTemplateWorkbenchPageByRoute({
  context: setupPortalEngineForAdmin(),
  routeQuery: computed(() => route.query),
  previewTarget: previewFrameRef,
  api: {
    template: {
      detail: portalApi.template.detail,
      update: portalApi.template.update,
      hideToggle: portalApi.template.hideToggle
    },
    tab: {
      detail: portalApi.tab.detail,
      add: portalApi.tab.add,
      update: portalApi.tab.update,
      delete: portalApi.tab.delete
    }
  },
  notify: {
    success: (text) => message.success(text),
    error: (text) => message.error(text),
    warning: (text) => message.warning(text)
  },
  confirm: ({ message: text, title }) => confirm.warn(text, title),
  replaceRouteQuery: (nextQuery) => router.replace({ query: nextQuery }),
  pushRoute: ({ path, query }) => router.push({ path, query }),
  resolveRouteHref: ({ name, query }) => router.resolve({ name, query }).href
});
```

## 页面编辑消费者接入

`PortalPageEditPage.vue` 这类页面应优先消费 `usePageEditorWorkbench()`，让 admin 只保留路由与依赖注入：

```ts
import { usePageEditorWorkbench } from '@one-base-template/portal-engine';

const workbench = usePageEditorWorkbench({
  tabId,
  templateId,
  api: {
    tab: {
      detail: portalApi.tab.detail,
      update: portalApi.tab.update
    }
  },
  notify: {
    success: (text) => message.success(text),
    error: (text) => message.error(text),
    warning: (text) => message.warning(text)
  },
  resolvePreviewHref: ({ tabId, templateId, previewMode }) =>
    router.resolve({
      name: 'PortalPreview',
      query: { tabId, templateId, previewMode }
    }).href
});
```

页面层建议仅保留：

- `tabId/templateId` 路由参数解析
- 返回跳转（如 `onBack`）
- `PortalPageEditorWorkbench` 组件透传 `loading/saving/preview/pageSettingData` 与事件绑定

## 模板工作台壳层接入

模板工作台页面建议统一使用 `PortalTemplateWorkbenchShell`，通过插槽装配业务组件：

- `#header`：顶部栏（返回、刷新、页眉页脚入口）
- `#tree`：左侧树面板
- `#toolbar`：页面动作条
- `#preview`：预览舞台
- `#dialogs`：属性弹窗、页面设置抽屉、壳层设置抽屉

## PortalPreviewPanel 消费者接入（props 注入）

`PortalPreviewPanel` 已下沉到 `packages/portal-engine/src/renderer/PortalPreviewPanel.vue`，消费者（admin/portal/其他应用）统一通过 props 注入能力，**不依赖 `apps/admin` 的本地 `portalApi` 或 `useMaterials` mock**。

接入要点：

1. 注入 `previewDataSource`：提供 `getTabDetail/getTemplateDetail` 两个异步函数。
2. 注入 `materialsMap`：传入 `Record<string, Component>`，key 必须与 schema 的 `cmptConfig.index.name` 对齐。
3. 注入 `onNavigate`：统一接收 tab/url 跳转事件，由消费者决定路由跳转或外链打开策略。

```vue
<script setup lang="ts">
import { markRaw } from 'vue';
import { useRouter } from 'vue-router';
import {
  PortalPreviewPanel,
  type PortalPreviewDataSource,
  type PortalPreviewNavigatePayload
} from '@one-base-template/portal-engine';

import BaseTextIndex from './materials/BaseTextIndex.vue';
import { request } from './infra/request';

const router = useRouter();

const materialsMap = {
  'base-text-index': markRaw(BaseTextIndex)
};

const previewDataSource: PortalPreviewDataSource = {
  getTabDetail: (tabId) => request.get('/portal/tab/detail', { params: { id: tabId } }),
  getTemplateDetail: (templateId) =>
    request.get('/portal/template/detail', { params: { id: templateId } })
};

function handleNavigate(payload: PortalPreviewNavigatePayload) {
  if (payload.type === 'tab' && payload.tabId) {
    router.replace({
      query: {
        tabId: payload.tabId
      }
    });
    return;
  }
  if (payload.type === 'url' && payload.url) {
    window.open(payload.url, '_blank', 'noopener,noreferrer');
  }
}
</script>

<template>
  <PortalPreviewPanel
    tab-id="tab-1"
    template-id="tpl-1"
    :preview-data-source="previewDataSource"
    :materials-map="materialsMap"
    :on-navigate="handleNavigate"
    :listen-message="true"
    preview-mode="safe"
  />
</template>
```

## 基础物料（base）新增能力

`packages/portal-engine/src/materials/base` 当前已包含以下通用物料：

- `base-image`
  - 支持资源 ID / 直链两种图片输入。
  - 支持上传（可配置上传地址、请求头、附加参数、响应路径映射）。
  - 展示层可配置 `fit`、宽高、边框、阴影、说明文案、点击跳转。
- `base-carousel`
  - 支持多图项维护（标题、副标题、跳转）。
  - 支持自动播放、间隔、指示器/箭头显示策略。
  - 样式层支持遮罩、文案对齐、圆角、图片填充模式。
- `base-text`
  - 支持普通文本与 HTML 文本两种渲染方式。
  - 样式支持字号、字重、行高、边框、行数截断等常规排版能力。
- `base-table`
  - 支持静态 JSON 与真实接口两种数据源。
  - 支持 `successPath/listPath/totalPath` 返回实体映射，兼容不同后端结构。
  - 支持列配置（字段 key、列宽、对齐、省略、链接跳转参数）。
  - 支持显示表头、分页、行分割线、圆点标识、`el-table` JSON 扩展属性。
- `app-entrance`
  - 应用入口宫格，支持图标/图片、角标、描述和点击跳转。
  - 支持单行列数、间距、卡片背景与 hover 视觉配置。
- `image-link-list`
  - 图文导航列表，支持标题/描述/标签/图片与跳转配置。
  - 适合门户首页推荐区、专题入口区快速搭建。
- `base-button-group`
  - 可维护多按钮动作，支持横向/纵向排列、对齐、间距、按钮尺寸和跳转。
- `base-search-box`
  - 关键字输入 + 按钮提交，支持参数名配置与搜索页路由跳转。
- `base-notice`
  - 纵向公告轮播，支持自动播放、轮播间隔、圆点标识与链接跳转。
- `base-card-list`
  - 卡片式内容列表，支持静态/API 数据源、字段映射、分页与详情跳转。
- `base-form`
  - 动态字段表单，支持 JSON 字段定义、提交接口、成功校验与提交后跳转。
- `base-stat`
  - 统计卡片网格，支持字段映射、数量控制、趋势显示与卡片跳转。
- `base-file-list`
  - 文件列表，支持字段映射、附件下载、详情跳转与分页展示。
- `base-timeline`
  - 时间轴组件，支持静态/API 数据源、时间线样式与条目跳转。

### base 物料复用组件沉淀

- `materials/base/common/PortalDataSourceCard.vue`
  - 统一数据源配置卡片（静态 JSON / API 模式、返回路径、分页参数）。
- `materials/base/common/PortalActionLinkField.vue`
  - 统一跳转配置（path / paramKey / valueKey / openType）。
- `materials/base/common/portal-data-source.ts`
  - 抽离数据源模型、合并逻辑与请求加载函数。
- `materials/base/common/portal-link.ts`
  - 抽离链接模型、链接拼装与跳转执行逻辑。

> 约定：每个物料目录保持 `config.json + index.vue + content.vue + style.vue`，并通过 `useSchemaConfig` 回写 schema。

- 配置面板规范：
  - `packages/portal-engine/src/materials/base/**` 中涉及分组标题的设置区域，统一使用 `ObCard title` 分割，不再使用 `el-divider`。
  - `packages/portal-engine/src/materials/common/unified-container/**` 等抽离公共配置组件同样遵循上述规则，避免公共组件回流旧样式。
  - 统一容器内容配置中，“显示外链按钮/外链文字/外链地址”与标题项收敛在同一个 `ObCard`，避免标题与外链被拆成两个卡片造成割裂感。
  - 统一目标是让 base 物料设置面板在间距、层级和视觉上与后台配置页保持一致。

## portal-engine Agent 规则落点

- 主版本规则文件：`packages/portal-engine/AGENTS.md`
- 关键强制项（摘录）：
  - 分组标题必须使用 `ObCard`。
  - 颜色配置必须优先使用 `ObColorField`。
  - 边距配置必须优先使用 `PortalSpacingField`。
  - 边框配置必须优先使用 `PortalBorderField`。
  - 标题/副标题/图标/外链能力优先复用 `materials/common/unified-container/**`。

## 统一容器头部（Unified Container）

- 统一容器内容配置新增 `subtitleLayout` 字段：
  - `below`：副标题显示在主标题下方（默认）。
  - `inline`：副标题显示在主标题后方（同一行）。
- 编辑侧在 `UnifiedContainerContentConfig` 提供“副标题位置”开关，渲染侧由 `UnifiedContainerDisplay` 统一消费，base 物料无需单独实现。

## 运行时扩展 API

- 物料元数据扩展：
  - `registerPortalMaterial(material, options)`
  - `unregisterPortalMaterial(options)`
  - `createPortalMaterialRegistry(initialCategories?)`
- 物料渲染组件扩展：
  - `registerPortalMaterialComponent({ name, component, aliases?, strategy? })`
  - `unregisterPortalMaterialComponent(name, aliases?)`

> 推荐做法：先注册物料元数据（出现在物料库），再注册同名渲染组件（画布与预览可渲染）。

## 维护建议

- 新能力先判断是否可沉淀为共享引擎能力，再决定是否留在 `apps/admin`。
- CMS 物料中的消息提示统一通过 `packages/portal-engine/src/materials/cms/common/message.ts` 调用，避免在物料组件内散落直接 `ElMessage` 调用。
- 引擎包变更后，至少回归：

```bash
pnpm -C packages/portal-engine run verify:materials
pnpm -C packages/portal-engine run test:run
pnpm -C packages/portal-engine typecheck
pnpm -C apps/admin typecheck
pnpm -C apps/portal typecheck
pnpm -C apps/docs build
```

- 如果变更了物料命名/协议字段，必须同步更新 `portal-designer` 文档和本页。
