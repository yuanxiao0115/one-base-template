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
  editor/        # 设计器能力（布局编辑、属性面板、物料面板）
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
  - 颜色配置必须优先使用 `PortalColorField`。
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
pnpm -C packages/portal-engine typecheck
pnpm -C apps/admin typecheck
pnpm -C apps/portal typecheck
pnpm -C apps/docs build
```

- 如果变更了物料命名/协议字段，必须同步更新 `portal-designer` 文档和本页。
