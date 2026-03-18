# PortalManagement 管理端接入

> 适用范围：`apps/admin/src/modules/PortalManagement/**`

## 目标

这页只回答一个问题：**在 admin 侧如何稳定消费 `portal-engine`，并保持模块边界清晰。**

## 页面入口与职责

| 页面           | 文件                                       | 主要职责                           |
| -------------- | ------------------------------------------ | ---------------------------------- |
| 门户设计工作台 | `designPage/PortalTemplateSettingPage.vue` | 树结构编排、页面动作、壳层配置入口 |
| 页面编辑器     | `designPage/PortalPageEditPage.vue`        | 深度拖拽编辑、保存、预览           |
| 预览渲染页     | `designPage/PortalPreviewRenderPage.vue`   | 预览数据源装配、渲染态路由接入     |

## 路由与页面边界

- `layout` 路由仅保留模板列表：`/portal/setting`。
- `standalone` 路由承载全屏工作区：`/portal/design`、`/portal/page/edit`、`/portal/preview`。
- `meta.hiddenTab=true`：避免门户编辑页进入顶部标签栏。

## 引擎注入链路（唯一入口）

固定入口：`apps/admin/src/modules/PortalManagement/engine/register.ts`

负责三件事：

1. 注入 CMS API（`setPortalCmsApi`）。
2. 注入页面设置 API（`setPortalPageSettingsApi`）。
3. 注册 admin 物料扩展（`registerMaterialExtensions`）。

约束：页面层禁止直接散落调用 `setPortal*` 注入函数。

## 页面接入基线

- 设计页优先使用：`usePortalTemplateDesignerRoute()`。
- 编辑页优先使用：`usePortalPageDesignerRoute()`。
- 预览页优先使用：`usePortalPreviewPageByRoute()` + `PortalPreviewPanel`。

这样页面层只保留：

- 路由参数注入。
- `message/confirm` 注入。
- 壳组件拼装。

## 模块收敛（2026-03-18）

- `PortalManagement/api.ts` 已收敛为兼容导出入口，领域实现拆到：
  - `api/portal.ts`
  - `api/cms.ts`
  - `api/portal-authority.ts`
- 模板列表状态编排 `usePortalTemplateListPageState.ts` 已拆分：
  - `usePortalTemplateDialogActions.ts`（新建/编辑/复制/预览等模板动作）
  - `usePortalTemplatePermissionCenter.ts`（门户权限 + 页面权限中心）
  - `template-list-helpers.ts`（normalize 与 ID 提取等纯函数）

## 常见改造优先级

1. **先改路由编排，不先改渲染细节**。
2. **先收敛注入入口，再扩展页面能力**。
3. **能下沉 `portal-engine` 的逻辑，不留在 `apps/admin`**。

## 提交前验证

```bash
pnpm -C apps/admin typecheck
pnpm -C apps/admin lint
pnpm -C apps/admin build
pnpm -C apps/docs lint
pnpm -C apps/docs build
```
