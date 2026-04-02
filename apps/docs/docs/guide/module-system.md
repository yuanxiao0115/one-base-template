# 模块系统与 CLI 切割

从 2026-02-27 起，`apps/admin` 采用 **模块 moduleMeta + 模块声明驱动** 的路由组装方式，目标是让模块可以被 CLI 稳定裁剪。

<div class="doc-tldr">
  <strong>先读这一段：</strong>新增模块只需要先看「1) 模块入口约定」+「2) 路由组装规则」+「3) enabledModules 配置开关」，其余章节是深入说明与治理细节。
</div>

## 1) 模块入口约定

每个业务模块必须提供 `module.ts + routes.ts`（或 `routes/index.ts`）入口：

```text
apps/admin/src/modules/<module-id>/
  module.ts
  routes.ts | routes/index.ts
  <feature-a>/
  <feature-b>/
  api/
  services/
  stores/
  components/
```

### 模块入口树图（推荐）

![模块入口树图（SVG）](/diagrams/module-entry-tree.svg)

`module.ts` 内 `moduleMeta` 必填字段：

- `id`: 模块标识（建议 kebab-case，如 `portal-management`）
- `version`: 当前固定为 `'1'`
- `moduleTier`: 模块分层（`core`/`optional`）
- `enabledByDefault`: 是否默认启用

`module.ts` 默认导出（`AppModuleManifest`）必填字段：

- `routes.layout`: 挂载到 `AdminLayout` 下的路由（可来自 `routes.ts` 或 `routes/index.ts`）
- `routes.standalone`（可选）: 顶层路由（全屏/匿名等）
- `apiNamespace`: API 命名空间
- `compat`（可选）: 历史路径/字段兼容描述

说明：

- 类型名 `AppModuleManifest` / `AppModuleManifestMeta` 仍沿用历史命名。
- **当前契约不再要求单独 `manifest.ts` 文件**，元信息统一内联在 `module.ts` 的 `moduleMeta` 常量中。

路由文件组织建议：

- 只有 layout 路由的简单模块：优先单文件 `routes.ts`
- 同时有 `layout + standalone` 的模块：优先 `routes/` 目录并通过 `routes/index.ts` 统一导出
- 避免同模块同时长期保留“顶层 `routes.ts` + `routes/` 转发壳”两套结构，减少命名噪音

约束补充：

- `core`：主链路模块，可按需 `enabledByDefault=true`
- `optional`：实验/迁移模块；`enabledByDefault` 必须显式写为 `false`（类型层与注册器都会校验）
- `meta` 采用就近声明：
  - 未声明 `access` 时默认按 `menu` 处理
  - 匿名页显式声明 `access: 'open'`
  - 登录后可访问但不依赖菜单权限的页面显式声明 `access: 'auth'`
  - compat 别名由装配器统一补齐 `hideInMenu/hiddenTab/activePath`

### 为什么把 `manifest.ts` 合并进 `module.ts`

- 单一事实源：模块 id、开关默认值、路由声明在同一文件，减少“改了 A 忘了改 B”的漂移。
- 注册链路更短：不再需要 `manifest.ts -> module.ts` 的路径映射，`registry` 直接从 `module.ts` 读取 `moduleMeta`。
- 新人心智更低：一个模块只看 `module.ts + routes.ts` 就能理解注册与装配逻辑。
- 脚手架更稳：`new:module` 与 `new:app` 模板天然一致，后续维护不再双文件同步。

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

### 命名现状说明（避免误解）

- 当前仓库存在历史目录命名混用（如 `PortalManagement`、`adminManagement`）。
- 现行脚手架 `pnpm new:module <module-id>` 强制 `module-id` 为 kebab-case，并在 `apps/admin/src/modules/<module-id>/` 下生成标准结构。
- 新增模块按 kebab-case 执行，历史模块可按业务节奏逐步收敛，不影响本次开发链路。

## 2) 路由组装规则

- 统一入口：`apps/admin/src/router/assemble-routes.ts`
- 模块元信息扫描：`apps/admin/src/modules/**/module.ts`（eager 读取 `moduleMeta`）
- 模块加载：按 `enabledModules` 动态加载 `apps/admin/src/modules/**/module.ts`
- 全局固定路由仅保留：`/login`、`/sso`、`/403`、`/404`、404 兜底
  - 其中 `/login`、`/sso` 都按“认证入口”处理，不是“登录后也可反复进入的普通开放页”
- admin 当前约定：`/403`、`/404` 作为 `AdminLayout` 子路由渲染（保留顶部栏与侧栏），404 通配兜底默认使用 push 语义
- 业务路由一律来自模块声明（`module.ts` 默认导出）

这意味着：

- 顶层特例（如门户设计器）不再写在路由中转层，统一归口 `router/assemble-routes.ts`
- 删除模块目录后，不会残留对应路由注册
- 模块页面路由建议使用 `component: () => import("./xx/list.vue")` 懒加载，降低首包体积与启动压力

### 2.1 装配参数输入（升级友好关键）

路由装配层不再直接读取 `getAppEnv()`，统一由 `bootstrap` 显式注入：

```ts
await assembleRoutes({
  enabledModules: appEnv.enabledModules,
  defaultSystemCode: appEnv.defaultSystemCode,
  systemHomeMap: appEnv.systemHomeMap,
  storageNamespace: appEnv.storageNamespace
});
```

这样做的价值：

- `router/assemble-routes.ts` 退化为纯组装逻辑，降低隐式全局依赖
- 后续新增子项目时，只要在各自 `bootstrap` 组装参数即可复用装配器
- 基建升级的影响面主要停留在启动编排层，不会扩散到业务模块

新增约定：

- 路由冲突统一采用 `warn + skip`，不再区分环境策略，降低心智负担
- 路由装配职责已拆为：
  - `route-assembly-builder`：递归构造模块路由、activePath 兼容、别名路由生成与冲突校验
  - 其中通用算法已下沉到 `packages/core/src/router/module-assembly.ts`，`apps/admin/src/router/route-assembly-builder.ts` 仅保留 admin 常量与日志适配
  - `registry` 的 moduleMeta 校验与 enabledModules 筛选纯逻辑已下沉到 `packages/core/src/router/module-registry.ts`，`apps/admin/src/router/registry.ts` 仅保留 `import.meta.glob` 加载与缓存编排
  - 固定路由（layout/public/catchall）工厂已下沉到 `packages/core/src/router/fixed-routes.ts`，`apps/admin/src/router/assemble-routes.ts` 仅保留应用级参数编排

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
  activePathMap: {
    "/portal/design": "/portal/setting",
    "/portal/page/edit": "/portal/setting",
  },
}
```

### 2.3 守卫与 SSO 回调分层（第二/第三批优化）

- `packages/core/src/router/guards.ts` 继续作为唯一守卫入口，但内部流程已拆为小函数：
  - 路由访问级别判定（`open/auth/menu`）
  - 认证入口回跳判定（已登录访问 `/login`、`/sso` 时，优先按 `redirect/redirectUrl` 回到站内目标，否则回到 `/`）
  - `token/mixed` 模式下的认证入口前置判断（无 token 直接放行；有 token 才进入 `ensureAuthed()`）
  - 登录跳转判定
  - 菜单同步与系统切换
  - 菜单权限判定（仅 `menu` 路由触发）
- 对应用层保持兼容：`setupRouterGuards(router, options)` 与 `RouterGuardOptions` 契约保持稳定；当前支持通过 `resolveAuthedLoginRedirect` 注入自定义回跳解析逻辑（用于 baseUrl 子路径部署等场景）。
- `apps/admin/src/pages/sso/SsoCallbackPage.vue` 的参数分支匹配逻辑已下沉到
  `packages/core/src/auth/sso-callback-strategy.ts`，admin 侧只保留远端登录编排。
- `sso-callback-strategy` 约定优先级固定为：
  `sourceCode=zhxt -> sourceCode=YDBG -> ticket -> type+token -> moaToken -> Usertoken`。
- `ticket` 分支参数透传约定：
  - 优先读取 URL `serviceUrl` 并透传给业务 handler（与 auth `/ticket/sso` 契约对齐）；
  - 若未携带 `serviceUrl`，再透传 `redirectUrl` 供应用侧回退拼装。
- 页面层职责收敛为“状态展示 + handler 注入”，后续新增 SSO 入口优先扩展策略层并补策略单测。
- 路由装配诊断也已下沉到 `packages/core/src/router/{route-signature,route-diagnostics}.ts`，
  admin 只负责组装业务路由并消费 diagnostics。
- `token` 鉴权下新增“缺 token 会话探测”兜底：首次命中无 token 时会尝试一次 `fetchMe()`，成功按已登录处理（避免误进 `/login`），失败再清理缓存并回到未登录态。
- 第三批回归补强已覆盖：
  - `packages/core/src/router/guards.test.ts`：`remote` 模式下 `remoteSynced=false` 的两类边界（`loaded=true` 后台同步、`loaded=false` 阻塞加载）；
  - `packages/core/src/auth/sso-callback-strategy.test.ts`：`ticket` 分支 `redirectUrl` 缺省透传 `null` 与 handler 抛错透传。
- 第四批进一步收敛：
  - 新增 `apps/admin/src/services/auth/auth-scenario-provider.ts`，统一封装 `default/basic` 登录与 SSO 场景；
  - 页面层（`LoginPage.vue` / `SsoCallbackPage.vue`）只保留 UI 状态与跳转编排，不再直接拼接后端分支细节；
  - 新增 `auth-scenario-provider` 单测，覆盖场景分支、token 回填与异常分支。
  - 登录页直登 token 场景优先执行会话收口与跳转，避免被登录页配置接口阻塞。
  - SSO 失败分支统一清理 `tokenKey` 与 `idTokenKey`，降低残留状态影响。
- 2026-04-02 补充：
  - `apps/admin` 与 `apps/admin-lite` 的 SSO 配置与远端接口地址统一收敛到 `src/config/auth-sso.ts`；
  - `apps/portal` 已启用 `/sso` 回调路由与 core SSO 策略（此前 `sso.enabled=false` 的缺口已关闭）。

### 2.4 路由冲突策略与测试护栏（第四批续）

- `assemble-routes` 对重复 path/name、保留路径冲突统一采用 `warn + skip`。
- 公共固定路由清单已独立到 `apps/admin/src/router/public-routes.ts`，`assemble-routes` 只负责装配。
- 路由路径常量收敛为 `routePaths` 单对象（`apps/admin/src/router/constants.ts`），不再使用 `APP_XXX` 风格常量前缀。
- 公共路由 name 统一使用小写语义名：`login / sso / forbidden / not-found`，避免大写英文名带来的额外记忆负担。
- `buildFixedRoutes` 的 `notFoundPath` 已改为可选：优先取显式传参，未传时从 `publicRoutes` 自动推断（`name=not-found` 或 `path=/404`）。
- 关键文件：
  - `apps/admin/src/router/route-assembly-builder.ts`
  - `apps/admin/src/router/public-routes.ts`
  - `apps/admin/src/router/__tests__/assemble-routes.unit.test.ts`

### 2.5 全屏路由归属与路由纯函数下沉（2026-03-10）

- **全屏/不走 Layout 路由统一就近注册到业务模块 `routes.standalone`**：
  - 例如 `PortalManagement` 的 `/portal/design`、`/portal/page/edit`、`/portal/preview`。
  - `router/assemble-routes.ts` 只做装配与校验，不再集中维护业务全屏路由明细。
- `packages/core` 新增可复用路由纯函数，`admin` 直接复用：
  - `toRouteNameKey`：统一 route.name 归一化（string/symbol）
  - `normalizeRoutePath` + `buildRouteFullPath`：统一路径归一化与父子路径拼接
  - `resolveAppRedirectTarget`：统一安全 redirect + baseUrl 去前缀逻辑
- 这样做的收益：
  - 路由业务归属更清晰（业务路由在业务模块）
  - admin/router 与 core/router 的边界更清晰（业务装配 vs 通用算法）
  - 避免不同应用重复维护 route.name/path/redirect 的同构实现

## 3) enabledModules 配置开关

`apps/admin/src/config/platform-config.ts` 配置：

```json
{
  "enabledModules": ["home", "admin-management", "log-management", "system-management"]
}
```

支持两种形式：

- `"*"`：启用全部已注册模块
- `string[]`：白名单启用（如 `['home', 'admin-management', 'log-management']`）
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
- `api/client.ts`：唯一请求实现（统一从 `@one-base-template/core` 获取 `obHttp()`）
- `services/*.ts`：页面用例编排
- 协议兼容映射优先下沉到 `packages/adapters`（例如 `whiteList -> whiteDTOS`），不要在模块内新增 `compat/*.ts`

对于 `apps/admin/src/modules/**` 的页面模块，建议进一步收敛为：

- `api.ts`：只保留接口方法定义与请求调用，不承载业务归一化、字段兜底、格式保底
- `types.ts`：只保留对外暴露的请求/响应类型（避免在 `api.ts` 堆叠大量类型）；实体类型优先“少字段 + 关键字段必填 + 其余可选”，不要求完整镜像后端 DTO。对于日志/审计等弱结构实体，可进一步使用“关键字段 + 索引签名”模式，减少超长字段清单维护成本。
- 跨模块可复用的通用协议类型统一放在 `apps/admin/src/types/api.ts`（如 `ApiResponse<T>`、`ApiPageData<T>`）；各模块 `types.ts` 直接复用（`export type { ApiResponse }` 或直接引用 `ApiPageData<T>`），不要再新增中间响应别名，业务实体继续贴近模块维护。
- 模块内禁止新增 `normalizers.ts` / `mapper.ts` / `compat.ts`，复杂业务处理统一放在页面层或 composable 层

当前推荐落地范围：`CmsManagement`、`LogManagement`、`SystemManagement`、`adminManagement`。`LogManagement` 与其他模块保持一致，API 跟随子功能目录（如 `login-log/api.ts`、`sys-log/api.ts`），不再集中放在模块根 `api/` 目录。

说明：后端字段若不符合约定，优先在业务代码中显式处理，不在 API 层做隐式修正。

### 4.1) 应用级公共目录边界（admin）

`apps/admin` 的应用级公共能力统一落在以下目录：

- `apps/admin/src/config/*`：环境解析、运行时配置、应用级 logger、basic 签名/加密
- `apps/admin/src/types/api.ts`：跨模块复用的通用协议类型（`ApiResponse`/`ApiPageData`）
- `apps/admin/src/services/auth/*`：登录/SSO/验证码场景编排
- `apps/admin/tests/*`：应用层测试统一维护目录

约束：

- 单模块私有逻辑（仅一处使用的 `mapper/normalize/helper`）不要上提到应用级公共目录，保持在 `modules/<module>/**` 就近维护。
- 出现跨应用复用价值时，优先下沉到 `packages/core` / `packages/adapters`。

## 5) ESLint 边界约束

当前已启用两条硬约束：

1. `apps/admin/src/modules/**/*` 禁止直接 `@/modules/*` 互相依赖
2. 页面/组件/store 禁止直接引用 `@/infra/http`（该文件已移除）；HTTP 访问统一在 `api.ts/api/client.ts` 里通过 `@one-base-template/core` 的 `obHttp()` 获取

这样可以减少模块间隐式耦合，确保模块可切割。

## 6) 面向 CLI 的最小契约

CLI 生成器可按以下步骤裁剪：

1. 读取 `platform-config.enabledModules`
2. 过滤模块 `moduleMeta`
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

## 8) adminManagement 模块示例（职位管理）

为了给后续 `user / org` 迁移打样，仓库新增了统一目录：

```text
apps/admin/src/modules/adminManagement/
  module.ts
  routes.ts
  position/list.vue
  position/api.ts
  position/form.ts
  position/components/*
```

关键点：

- 路由集中：模块根仅保留一个 `routes.ts`
- 路由防漏：新增/迁移 `list.vue` 必须同次更新 `routes.ts`，且路由组件路径必须可解析到真实文件
- 功能目录：`position/` 下内聚 `page + api + form + components`
- 路由入口：`/system/position`
- 页面结构：`ObPageContainer + ObTableBox + ObVxeTable`
- 弹窗形态：`ObCrudContainer + useEntityEditor`（业务只关心表单与接口）
- 接口对齐老项目：直接调用 `/cmict/admin/sys-post/page|add|update|delete|unique/check` 真实后端接口
- 角色域补充：迁移 adminManagement 角色模块时，需同时核对 `角色管理(/system/role/management)` 与 `角色分配(/system/role/assign)` 两条路由

角色分配页当前已落地，关键文件如下：

- 页面编排：`apps/admin/src/modules/adminManagement/role-assign/list.vue`
- 页面状态：`apps/admin/src/modules/adminManagement/role-assign/composables/useRoleAssignPageState.ts`
- 角色成员选择：`apps/admin/src/modules/adminManagement/role-assign/components/RoleAssignMemberSelectForm.vue`
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
import { openPersonnelSelection } from '@/components/PersonnelSelector';
import { getCurrentInstance } from 'vue';

const appContext = getCurrentInstance()?.appContext;

const result = await openPersonnelSelection({
  title: '添加人员',
  mode: 'person',
  users: selectedUsers,
  appContext,
  fetchNodes: ({ parentId }) =>
    roleAssignApi.getOrgContactsLazy({ parentId }).then((res) => res.data || []),
  searchNodes: ({ keyword }) =>
    roleAssignApi.searchContactUsers({ search: keyword }).then((res) => res.data || [])
});

console.log(result.userIds, result.users);
```

说明：

- `users/orgs/roles/positions` 为兼容老项目习惯的初始值入参（可选）
- `appContext` 建议在组件内通过 `getCurrentInstance()?.appContext` 传入，避免依赖私有 API
- 返回值同时提供 `model + ids + selectedItems`，便于不同业务按需消费

最小路由声明示例：

```ts
// apps/admin/src/modules/adminManagement/routes.ts
import type { RouteRecordRaw } from 'vue-router';

export default [
  {
    path: '/system/position',
    name: 'SystemPositionManagement',
    component: () => import('./position/list.vue'),
    meta: {
      title: '职位管理',
      keepAlive: true
    }
  }
] satisfies RouteRecordRaw[];
```

后续迁移 `user/org` 时，建议继续沿用同一目录与页面骨架，保持“模块可切割 + CRUD 容器可复用”的一致性。

## 10) LogManagement 模块示例（登录日志 + 操作日志）

日志管理模块按同一模式落地在 `apps/admin/src/modules/LogManagement`：

```text
apps/admin/src/modules/LogManagement/
  module.ts
  routes.ts
  login-log/api.ts
  login-log/types.ts
  login-log/list.vue
  login-log/columns.tsx
  login-log/composables/*
  login-log/components/*
  sys-log/api.ts
  sys-log/types.ts
  sys-log/list.vue
  sys-log/columns.tsx
  sys-log/composables/*
  sys-log/components/*
```

关键点：

- 路由集中：`routes.ts` 统一管理 `/system/log/login-log` 与 `/system/log/sys-log`
- 页面编排：`list.vue` 仅保留 `ObTableBox + ObVxeTable + 详情抽屉` 编排
- 逻辑下沉：查询、删除、详情拉取统一放在 `composables/use*PageState.ts`
- 接口契约：`api.ts` 只保留请求调用；`types.ts` 保持“够用即可”，日志实体优先“关键字段 + 索引签名”以降低维护负担
- 模块装配：`apps/admin/src/config/platform-config.ts` 的 `enabledModules` 显式加入 `log-management`

## 11) SystemManagement 模块示例（菜单管理 + 字典管理）

系统管理模块落地在 `apps/admin/src/modules/SystemManagement`：

```text
apps/admin/src/modules/SystemManagement/
  module.ts
  routes.ts
  dict/
    api.ts
    columns.ts
    form.ts
    composables/useDictPageState.ts
    components/*
    list.vue

apps/admin/src/modules/adminManagement/
  module.ts
  routes.ts
  menu/
    api.ts
    columns.ts
    form.ts
    composables/useMenuManagementPageState.ts
    components/*
    list.vue
  tenant-info/
    api.ts
    columns.ts
    form.ts
    components/*
    list.vue
  tenant-manager/
    api.ts
    columns.ts
    components/*
    list.vue
```

关键点：

- 路由集中：`adminManagement/routes.ts` 声明 `/system/permission`（菜单管理），`SystemManagement/routes.ts` 仅保留 `/system/dict`（字典管理）
- 菜单管理：沿用 `ObPageContainer + ObTableBox + ObTable + ObCrudContainer`，支持“左系统列表 + 右侧权限树”与筛选列表模式切换
- 系统列表交互：左侧系统项支持 icon 级编辑/删除，不必切换到右侧操作列
- 菜单管理表单：系统与权限拆分组件；系统入口放在左侧系统列表头部（`+ 新增系统`）；系统表单固定顶级且抽屉单列 `400px`
- 菜单权限表单：上级权限使用树形选择；顶级权限类型只允许“系统”；组件路径与缓存路由字段在当前静态路由模式下隐藏
- 菜单管理图标：支持手动输入（兼容 class/url/minio id）+ 可视化选择（CP=产品 Iconfont、DJ=党建 Iconfont、OM=OM Iconfont、OD=公文 Iconfont、EP=Element Plus、RI=Remix Icon）
  - 编辑表单入口采用“输入框右侧插槽 + 图标按钮”简约触发器（不展示“选择图标”文字按钮），控件高度统一 `30px`
  - iconfont 选择值统一保存为完整 class（例如 `dj-icons dj-icon-icon-1`）
  - iconify 选择值保存为 `ep:*` / `ri:*`，运行时按离线集合渲染
- 字典管理：主表为字典列表，二级弹层内承载字典项 CRUD 与启停能力
- 模块装配：`apps/admin/src/config/platform-config.ts` 的 `enabledModules` 需包含 `system-management`
