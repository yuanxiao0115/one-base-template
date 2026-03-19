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
- 模块边界清理：`PortalManagement/utils` 已移除；原先仅验证引擎导出的测试统一迁移到 `packages/portal-engine/src/{editor,schema,utils,shell}/*.test.ts`。

## 三线并行优化收口（2026-03-18）

- 权限弹窗拆分：
  - `templatePage/components/permission/permission-member-source.ts`：联系人树/人员搜索数据源。
  - `templatePage/components/permission/permission-role-source.ts`：角色列表加载与分页降级。
  - `templatePage/components/permission/permission-payload.ts`：页面权限与门户权限 payload 归一化。
  - `permission-payload` 在提交阶段统一去重 `roleIds/userIds/typeId`，避免重复授权项写入接口。
  - `permission-field-accessor.ts`：按字段映射生成 `get/setUsersByField`，消除弹窗脚本层重复分支判断。
  - `permission-form-fields.ts`：统一维护角色/人员表单字段配置，弹窗模板改为 `v-for` 渲染，减少重复片段。
  - `PagePermissionDialog.vue` / `PortalAuthorityDialog.vue` 仅保留 UI 状态与事件编排。
  - `templatePage/components/permission/usePermissionRoleOptions.ts`：统一角色选项加载状态（`roleOptions/roleLoading/ensureRoleOptions`）。
  - `templatePage/components/permission/usePermissionUserSelection.ts`：统一选人弹窗编排（`pickUsers/pickingField`），两处权限弹窗复用同一实现。
  - `usePermissionRoleOptions` 对同一 API 实例新增跨弹窗缓存与并发请求去重：同页多处权限弹窗首次打开时只请求一次角色数据，后续复用已加载结果。
  - `permission-member-source` 对同一 API 新增跨弹窗缓存与并发请求去重：组织节点与搜索关键字在同会话内按参数复用结果，减少重复接口请求。
  - 页面权限树与更新 payload 组装已下沉 `@one-base-template/portal-engine` 的 `domain/page-permission`，`PortalManagement` 不再保留同构 `utils/pagePermission.ts`。
- materials 单入口：
  - 新增 `materials/usePortalMaterials.ts`，统一按 `scene: 'editor' | 'renderer'` 取物料目录。
  - 删除 `useMaterials.ts`、`useEditorMaterials.ts`、`useRendererMaterials.ts` 三个 wrapper。
  - 编辑页与预览页均改为调用 `usePortalMaterials(scene)`。
- 模板兼容下沉 adapters：
  - `templatePage/api.ts` 不再依赖模块内 `compat/mapper.ts`。
  - `whiteList -> whiteDTOS` 兼容统一放在 `@one-base-template/adapters` 的 `normalizePortalTemplateWhiteList`。

## 注册链路补充（2026-03-18 P1）

- `engine/register.ts` 新增扩展签名集合，`setupPortalEngineForAdmin()` 重复调用时会跳过已注册签名，避免同一扩展被重复注册。
- 幂等策略不改变注册入口约束：页面层仍只允许通过 `setupPortalEngineForAdmin()` 触发引擎注入与扩展注册。
- `materials/extensions/index.ts` 为 admin 物料扩展声明唯一入口，不再维护 `materials/examples/**` 与 `registerDemoMaterial` 示例开关；入口通过 `import.meta.glob('../*/material.ts')` 自动收集物料 descriptor。
- admin 自定义物料目录固定结构为 `material.ts + defaults.ts + index.vue + content.vue + style.vue`，默认值集中在 `defaults.ts`，并复用于注册初始配置与编辑面板 merge 兜底。
- `useSchemaConfig` 已支持 `sections.defaultValue` 自动合并：`content/style` 面板可以只声明默认值，不再需要每个物料手写“初始化 merge + normalize”模板代码。
- 单测覆盖：`engine/register.unit.test.ts` 新增“重复 setup 不重复注册同签名扩展”断言。

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
