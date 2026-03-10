# 模块系统与 CLI 切割

从 2026-02-27 起，`apps/admin` 采用 **模块 Manifest 驱动** 的路由组装方式，目标是让模块可以被 CLI 稳定裁剪。

## 1) 模块入口约定

每个业务模块必须提供 `manifest.ts + module.ts` 两个入口：

```text
apps/admin/src/modules/<module-id>/
  manifest.ts
  module.ts
  routes.ts
  <feature-a>/
  <feature-b>/
  api/
  services/
  stores/
  components/
  compat/
```

`manifest.ts` 必填字段：

- `id`: 模块标识（如 `portal`）
- `version`: 当前固定为 `'1'`
- `moduleTier`: 模块分层（`core`/`optional`）
- `enabledByDefault`: 是否默认启用

`module.ts` 必填字段：

- `routes.layout`: 挂载到 `AdminLayout` 下的路由（推荐来自 `routes.ts`）
- `routes.standalone`（可选）: 顶层路由（全屏/匿名等）
- `apiNamespace`: API 命名空间
- `compat`（可选）: 历史路径/字段兼容描述

约束补充：

- `core`：主链路模块，可按需 `enabledByDefault=true`
- `optional`：实验/迁移模块；`enabledByDefault` 必须显式写为 `false`（类型层与注册器都会校验）
- 若路由声明 `meta.skipMenuAuth=true`，必须提供稳定 `route.name`；应用启动时会从已装配路由自动收集白名单，未命名路由不会放行
- `skipMenuAuthLevel` 建议按场景分级：
  - `stable`（默认）：生产可用
  - `allowlist`：生产需命中 `platform-config.skipMenuAuthProductionAllowList`
  - `dev-only`：仅开发环境可用，生产自动禁用

### 快速创建模块（推荐）

可使用脚手架命令生成标准骨架：

```bash
pnpm new:module <module-id>
```

示例：

```bash
pnpm new:module user-center --title 用户中心
```

支持参数：

- `--title`：默认页面标题
- `--route`：路由前缀（默认与 `module-id` 相同）
- `--dry-run`：仅预览要创建的文件，不落盘

## 2) 路由组装规则

- 统一入口：`apps/admin/src/router/assemble-routes.ts`
- 清单扫描：`apps/admin/src/modules/**/manifest.ts`
- 模块加载：按 `enabledModules` 动态加载 `apps/admin/src/modules/**/module.ts`
- 全局固定路由仅保留：`/login`、`/sso`、`/403`、`/404`、404 兜底
- 业务路由一律来自模块 Manifest

这意味着：

- 顶层特例（如门户设计器）不再写在 `router/index.ts`
- 删除模块目录后，不会残留对应路由注册
- 模块页面路由建议使用 `component: () => import("./xx/page.vue")` 懒加载，降低首包体积与启动压力

### 2.1 装配参数输入（升级友好关键）

路由装配层不再直接读取 `getAppEnv()`，统一由 `bootstrap` 显式注入：

```ts
await getRouteAssemblyResult({
  enabledModules: appEnv.enabledModules,
  defaultSystemCode: appEnv.defaultSystemCode,
  systemHomeMap: appEnv.systemHomeMap,
  storageNamespace: appEnv.storageNamespace,
  routeConflictPolicy: appEnv.isProd ? "warn" : "fail-fast",
})
```

这样做的价值：

- `router/assemble-routes.ts` 退化为纯组装逻辑，降低隐式全局依赖
- 后续新增子项目时，只要在各自 `bootstrap` 组装参数即可复用装配器
- 基建升级的影响面主要停留在启动编排层，不会扩散到业务模块

新增约定：

- `routeConflictPolicy` 支持 `warn` / `fail-fast`
- admin 当前默认策略：
  - 开发环境：`fail-fast`（冲突直接抛错，避免本地调试“静默跳过”）
  - 生产环境：`warn`（兼容历史行为，冲突告警并跳过）
- 路由装配职责已拆为：
  - `route-assembly-validator`：冲突校验与 skipMenuAuth 规则收集
  - `route-assembly-builder`：递归构造模块路由、activePath 兼容与别名路由生成

### 2.2 compat 执行语义（已落地）

`module.compat` 不再只是声明，当前装配流程会实际执行：

- `compat.activePathMap`：
  - key 为“目标路由完整 path”
  - 当路由本身未声明 `meta.activePath` 时，自动补齐
  - 若与路由声明冲突，保留路由声明值并输出 warn
- `compat.routeAliases`：
  - 为历史路径生成 `redirect` 路由（`from -> to`）
  - 别名路由默认 `meta.hideInMenu=true`、`meta.hiddenTab=true`
  - 若 `from` 与保留路径/已装配路径冲突，会跳过并输出 warn

示例（`portal/module.ts`）：

```ts
compat: {
  routeAliases: [{ from: "/portal/setting", to: "/portal/templates" }],
  activePathMap: {
    "/portal/designer": "/portal/setting",
    "/portal/layout": "/portal/setting",
    "/portal/templates": "/portal/setting",
  },
}
```

### 2.3 守卫与 SSO 回调分层（第二/第三批优化）

- `packages/core/src/router/guards.ts` 继续作为唯一守卫入口，但内部流程已拆为小函数：
  - 公开路由判定（public/sso）
  - 登录跳转判定
  - 菜单同步与系统切换
  - `skipMenuAuth` 严格白名单判定
- 对应用层保持兼容：`setupRouterGuards(router, options)` 与 `RouterGuardOptions` 契约不变，admin 无需改调用方式。
- `apps/admin/src/pages/sso/SsoCallbackPage.vue` 的参数分支匹配逻辑已下沉到
  `apps/admin/src/shared/services/sso-callback-strategy.ts`。
- `sso-callback-strategy` 约定优先级固定为：
  `sourceCode=zhxt -> sourceCode=YDBG -> ticket -> type+token -> moaToken -> Usertoken`。
- 页面层职责收敛为“状态展示 + handler 注入”，后续新增 SSO 入口优先扩展策略层并补策略单测。
- 第三批回归补强已覆盖：
  - `packages/core/src/router/guards.test.ts`：`remote` 模式下 `remoteSynced=false` 的两类边界（`loaded=true` 后台同步、`loaded=false` 阻塞加载）；
  - `apps/admin/src/shared/services/__tests__/sso-callback-strategy.unit.test.ts`：`ticket` 分支 `redirectUrl` 缺省透传 `null` 与 handler 抛错透传。
- 第四批进一步收敛：
  - 新增 `apps/admin/src/shared/services/auth-scenario-provider.ts`，统一封装 `default/sczfw` 登录与 SSO 场景；
  - 页面层（`LoginPage.vue` / `SsoCallbackPage.vue`）只保留 UI 状态与跳转编排，不再直接拼接后端分支细节；
  - 新增 `auth-scenario-provider` 单测，覆盖场景分支、token 回填与异常分支。

### 2.4 路由冲突策略与测试护栏（第四批续）

- `assemble-routes` 已新增冲突策略单测：
  - `routeConflictPolicy='fail-fast'`：重复 path/name 冲突直接抛错
  - `routeConflictPolicy='warn'`：保持 `warn + skip` 兼容
- 关键文件：
  - `apps/admin/src/router/route-assembly-validator.ts`
  - `apps/admin/src/router/__tests__/assemble-routes-policy.unit.test.ts`

## 3) enabledModules 运行时开关

`apps/admin/public/platform-config.json` 新增：

```json
{
  "enabledModules": ["home", "user-management", "log-management", "system-management"]
}
```

支持两种形式：

- `"*"`：启用全部已注册模块
- `string[]`：白名单启用（如 `['home', 'user-management', 'log-management']`）
- 管理端生产环境建议使用 `string[]`，避免把 demo/portal 等非主链路模块默认带入。
- 代码层兜底：即使配置缺失或为空数组，`optional` 模块也不会被默认启用。

示例（临时全开所有模块）：

```json
{
  "enabledModules": "*"
}
```

## 4) API 分层约束

页面层只允许调用 `services/*`，不直接依赖 HTTP 客户端。

推荐结构：

- `api/endpoints.ts`：路径常量
- `api/contracts.ts`：请求/响应类型
- `api/client.ts`：唯一请求实现
- `services/*.ts`：页面用例编排
- `compat/*.ts`：历史字段映射（如 `whiteList -> whiteDTOS`）

对于 `apps/admin/src/modules/**` 的页面模块，建议进一步收敛为：

- `api.ts`：只保留接口方法定义与请求调用，不承载业务归一化、字段兜底、格式保底
- `types.ts`：只保留对外暴露的请求/响应类型（避免在 `api.ts` 堆叠大量类型）；实体类型优先“少字段 + 关键字段必填 + 其余可选”，不要求完整镜像后端 DTO。对于日志/审计等弱结构实体，可进一步使用“关键字段 + 索引签名”模式，减少超长字段清单维护成本。
- 跨模块可复用的通用协议类型统一放在 `apps/admin/src/shared/api/types.ts`（如 `ApiResponse<T>`、`ApiPageData<T>`）；各模块 `types.ts` 直接复用（`export type { ApiResponse }` 或直接引用 `ApiPageData<T>`），不要再新增中间响应别名，业务实体继续贴近模块维护。
- 模块内禁止新增 `normalizers.ts` / `mapper.ts` / `compat.ts`，复杂业务处理统一放在页面层或 composable 层

当前推荐落地范围：`CmsManagement`、`LogManagement`、`SystemManagement`、`UserManagement`。`LogManagement` 与其他模块保持一致，API 跟随子功能目录（如 `login-log/api.ts`、`sys-log/api.ts`），不再集中放在模块根 `api/` 目录。

说明：后端字段若不符合约定，优先在业务代码中显式处理，不在 API 层做隐式修正。

## 5) ESLint 边界约束

当前已启用两条硬约束：

1. `apps/admin/src/modules/**/*` 禁止直接 `@/modules/*` 互相依赖
2. 页面/组件/store 禁止直接引用 `@/infra/http`

这样可以减少模块间隐式耦合，确保模块可切割。

## 6) 面向 CLI 的最小契约

CLI 生成器可按以下步骤裁剪：

1. 读取 `platform-config.enabledModules`
2. 过滤模块 Manifest
3. 只组装白名单模块路由
4. 物理删除未选模块目录后执行验证：
   - `pnpm -w typecheck`
   - `pnpm -w lint`
   - `pnpm -w build`

通过该契约，可以稳定支持 `--modules home,portal,...` 的脚手架生成策略。

## 9) 文件长度建议（架构层）

为避免“编排 + 业务细节”长期堆在同一文件，`eslint` 已增加非阻断告警规则（`max-lines`）：

- `bootstrap/router/config/shared`：建议不超过 `220` 行
- `modules/pages`：建议不超过 `360` 行

说明：

- 当前为 `warning`，用于引导拆分，不会直接阻断构建
- 建议优先拆分为：页面编排层、业务逻辑层（composables/actions/services）、视图组件层

## 7) 命名规则复用（生成器推荐）

为减少生成代码与现有代码命名风格偏差，建议 CLI 同时读取命名白名单：

- 文档说明：`/guide/naming-whitelist`
- 机器可读文件：`apps/docs/public/cli-naming-whitelist.json`

## 8) UserManagement 模块示例（职位管理）

为了给后续 `user / org` 迁移打样，仓库新增了统一目录：

```text
apps/admin/src/modules/UserManagement/
  manifest.ts
  module.ts
  routes.ts
  position/page.vue
  position/api.ts
  position/form.ts
  position/components/*
```

关键点：

- 路由集中：模块根仅保留一个 `routes.ts`
- 路由防漏：新增/迁移 `page.vue` 必须同次更新 `routes.ts`，且路由组件路径必须可解析到真实文件
- 功能目录：`position/` 下内聚 `page + api + form + components`
- 路由入口：`/system/position`
- 页面结构：`ObPageContainer + ObTableBox + ObVxeTable`
- 弹窗形态：`ObCrudContainer + useEntityEditor`（业务只关心表单与接口）
- 接口对齐老项目：直接调用 `/cmict/admin/sys-post/page|add|update|delete|unique/check` 真实后端接口
- 角色域补充：迁移 UserManagement 角色模块时，需同时核对 `角色管理(/system/role/management)` 与 `角色分配(/system/role/assign)` 两条路由

角色分配页当前已落地，关键文件如下：

- 页面编排：`apps/admin/src/modules/UserManagement/role-assign/page.vue`
- 页面状态：`apps/admin/src/modules/UserManagement/role-assign/composables/useRoleAssignPageState.ts`
- 角色成员选择：`apps/admin/src/modules/UserManagement/role-assign/components/RoleAssignMemberSelectForm.vue`
- 复用选人组件：`apps/admin/src/components/PersonnelSelector/PersonnelSelector.vue`

当前交互基线：

- 左侧角色列表（支持关键字筛选）+ 右侧成员分页表格（`ObTableBox + ObVxeTable`）
- 左侧角色区通过 `ObPageContainer` 的 `#left` 插槽承载，采用“标题统计 + 搜索 + 菜单化角色列表”结构，优先复用容器与 Element 能力，减少页面私有样式
- 左侧角色区遵循扁平化视觉：搜索输入框与角色选中项均为无圆角样式，和管理端整体风格保持一致
- 右侧支持关键词搜索、批量选择、单条/批量移除人员
- “添加人员”使用 `dialog` 弹窗（非抽屉），并采用“左侧组织通讯录 + 右侧已选人员”双栏结构
- 弹窗内左侧支持组织下钻与人员搜索（含“下级”图标入口），右侧维护已选人员集合并支持拖拽排序
- 已选人员展示统一为“姓名（手机号）”，列表超长时右侧独立滚动，不撑高弹窗
- 保存时按差异调用 `addMembers/removeMembers`

`PersonnelSelector` 复用约定（对齐老项目 `openPersonnelSelection` 的多场景思路，但保持低耦合）：

- 通过 `mode=person|org|role|position` 控制查询语义，后续业务只需替换 `fetchNodes/searchNodes`
- 通过 `selectionField=userIds|orgIds|roleIds|positionIds` 复用同一组件存储不同选择结果
- `allowSelectOrg=true` 时可在“选人场景”附带勾选组织（兼容“人员 + 组织”混选需求）
- 右侧拖拽采用 `sortablejs` 动态导入，仅在“可拖拽且已选数量 > 1”时初始化，避免无效开销

函数式打开方式（面向“很多业务都要用”的接入场景）：

```ts
import { openPersonnelSelection } from '@/components/PersonnelSelector'
import { getCurrentInstance } from 'vue'

const appContext = getCurrentInstance()?.appContext

const result = await openPersonnelSelection({
  title: '添加人员',
  mode: 'person',
  users: selectedUsers,
  appContext,
  fetchNodes: ({ parentId }) => roleAssignApi.getOrgContactsLazy({ parentId }).then((res) => res.data || []),
  searchNodes: ({ keyword }) => roleAssignApi.searchContactUsers({ search: keyword }).then((res) => res.data || [])
})

console.log(result.userIds, result.users)
```

说明：

- `users/orgs/roles/positions` 为兼容老项目习惯的初始值入参（可选）
- `appContext` 建议在组件内通过 `getCurrentInstance()?.appContext` 传入，避免依赖私有 API
- 返回值同时提供 `model + ids + selectedItems`，便于不同业务按需消费

最小路由声明示例：

```ts
// apps/admin/src/modules/UserManagement/routes.ts
import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/system/position',
    name: 'SystemPositionManagement',
    component: () => import('./position/page.vue'),
    meta: {
      title: '职位管理',
      keepAlive: true
    }
  }
] satisfies RouteRecordRaw[]
```

后续迁移 `user/org` 时，建议继续沿用同一目录与页面骨架，保持“模块可切割 + CRUD 容器可复用”的一致性。

## 10) LogManagement 模块示例（登录日志 + 操作日志）

日志管理模块按同一模式落地在 `apps/admin/src/modules/LogManagement`：

```text
apps/admin/src/modules/LogManagement/
  manifest.ts
  module.ts
  routes.ts
  login-log/api.ts
  login-log/types.ts
  login-log/page.vue
  login-log/columns.tsx
  login-log/composables/*
  login-log/components/*
  sys-log/api.ts
  sys-log/types.ts
  sys-log/page.vue
  sys-log/columns.tsx
  sys-log/composables/*
  sys-log/components/*
```

关键点：

- 路由集中：`routes.ts` 统一管理 `/system/log/login-log` 与 `/system/log/sys-log`
- 页面编排：`page.vue` 仅保留 `ObTableBox + ObVxeTable + 详情抽屉` 编排
- 逻辑下沉：查询、删除、详情拉取统一放在 `composables/use*PageState.ts`
- 接口契约：`api.ts` 只保留请求调用；`types.ts` 保持“够用即可”，日志实体优先“关键字段 + 索引签名”以降低维护负担
- 模块装配：`platform-config.json` 的 `enabledModules` 显式加入 `log-management`

## 11) SystemManagement 模块示例（菜单管理 + 字典管理）

系统管理模块落地在 `apps/admin/src/modules/SystemManagement`：

```text
apps/admin/src/modules/SystemManagement/
  manifest.ts
  module.ts
  routes.ts
  menu/
    api.ts
    columns.ts
    form.ts
    composables/useMenuManagementPageState.ts
    components/*
    page.vue
  dict/
    api.ts
    columns.ts
    form.ts
    composables/useDictPageState.ts
    components/*
    page.vue
```

关键点：

- 路由集中：`routes.ts` 同时声明 `/system/permission`（菜单管理）与 `/system/dict`（字典管理）
- 菜单管理：沿用 `ObPageContainer + ObTableBox + ObVxeTable + ObCrudContainer`，支持树模式与筛选模式切换
- 菜单管理图标：支持手动输入（兼容 class/url/minio id）+ 可视化选择（CP=产品 Iconfont、DJ=党建 Iconfont、OM=OM Iconfont、OD=公文 Iconfont、EP=Element Plus、RI=Remix Icon）
  - 编辑表单入口采用“输入框右侧插槽 + 图标按钮”简约触发器（不展示“选择图标”文字按钮），控件高度统一 `30px`
  - iconfont 选择值统一保存为完整 class（例如 `dj-icons dj-icon-icon-1`）
  - iconify 选择值保存为 `ep:*` / `ri:*`，运行时按离线集合渲染
- 字典管理：主表为字典列表，二级弹层内承载字典项 CRUD 与启停能力
- 模块装配：`platform-config.json` 的 `enabledModules` 需包含 `system-management`
