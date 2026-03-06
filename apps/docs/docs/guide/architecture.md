# 目录结构与边界

仓库根目录：`/Users/haoqiuzhi/code/one-base-template`

```text
apps/
  admin/                 # 主应用（Vite + Vue）
  portal/                # 门户消费者应用（独立渲染）
  template/              # 最小可用示例（静态菜单）
  docs/                  # 文档站点（VitePress）
packages/
  core/                  # 纯逻辑：鉴权/SSO/菜单/主题/tabs/http 等（禁止耦合 UI）
  ui/                    # UI 壳：Layout/Sidebar/Topbar/Tabs/KeepAlive/错误页 等（依赖 core）
  adapters/              # Adapter 示例：对接后端接口/字段映射
  utils/                 # 通用工具包（数组/树/日期/格式化/storage/加密/Vue hooks 等）
```

## admin 的启动分层

为避免启动链路分散导致不可控，`apps/admin` 将启动逻辑集中在：

- `apps/admin/src/config/platform-config.ts`：加载并校验运行时配置（`public/platform-config.json`）
- `packages/core/src/config/platform-config.ts`：运行时配置 schema 与校验规则（可复用）
- `apps/admin/src/config/layout.ts`：管理端布局代码配置（`layoutMode/systemSwitchStyle/topbarHeight/sidebarWidth/sidebarCollapsedWidth`）
- `apps/admin/src/config/theme.ts`：主题注册入口（复用 core 内置主题 + 项目自定义主题）
- `apps/admin/src/infra/env.ts`：聚合构建期 env + 运行时配置，导出 `appEnv`
- `apps/admin/src/router/{types,registry,assemble-routes}.ts`：模块 Manifest 扫描、白名单过滤与路由组装
- `apps/admin/src/router/index.ts`：路由装配单一入口（仅暴露 `getRouteAssemblyResult()`）
- `apps/admin/src/bootstrap/`：创建 app/pinia/router、初始化 http、安装 core、注册路由守卫
- `packages/core/src/storage/namespace.ts`：统一存储命名空间规则（读取兼容旧 key）
- `packages/core/src/router/initial-path.ts`：统一根路由首次跳转决策（系统首页映射 + 菜单叶子兜底）

启动顺序：

1. `main.ts` 先调用 `loadPlatformConfig()`
2. 配置加载成功后动态导入 `bootstrap`
3. `bootstrap` 内安装 `@one-base-template/ui` 插件（`app.use(OneUiPlugin, { prefix: 'Ob' })`，自动注册全局组件）
4. 路由由 `module-system` 基于 `modules/**/module.ts` 组装（支持 `enabledModules` 白名单）
5. 注册 core 路由守卫（默认启用 core tabs 同步）
6. `router.isReady()` 后 mount
7. 配置加载失败时，应用硬失败并显示错误页（不进入业务路由）

## template 的启动分层（最小静态菜单）

`apps/template` 复用同一套 core/ui 壳能力，但收敛为最小链路：

- `apps/template/public/platform-config.json`：运行时配置（推荐 `preset=static-single`）
- `apps/template/src/config/platform-config.ts`：加载与校验配置
- `apps/template/src/infra/mock-adapter.ts`：本地 mock 鉴权（无后端依赖）
- `apps/template/src/router/routes.ts`：静态路由与菜单来源（`modules/**/routes.ts`）
- `apps/template/src/bootstrap/index.ts`：安装 router + core + ui + tag + 守卫

## portal 的启动分层（门户消费者）

`apps/portal` 基于 template 骨架收敛为“独立渲染入口”：

- `apps/portal/public/platform-config.json`：运行时配置（默认 `preset=static-single`，落地 `/portal/index`）
- `apps/portal/src/bootstrap/index.ts`：安装 router + core + ui，并注入 `http/adapter`
- `apps/portal/src/bootstrap/{http.ts,adapter.ts}`：复用与 admin 一致的后端鉴权接入能力
- `apps/portal/src/pages/login/LoginPage.vue`：门户登录页；复用共享 `LoginBox.vue` / `LoginBoxV2.vue` 与 `login.ts`，但页面壳与登录后分流逻辑仍由 portal 自己维护
- `apps/portal/src/shared/services/auth-captcha-service.ts`：门户登录页滑块验证码接口收口
- `apps/portal/src/shared/services/auth-remote-service.ts`：登录页配置与前台首页分流接口收口（`/cmict/portal/getLoginPage`、`/cmict/admin/front-config/portal`）
- `apps/portal/src/modules/portal/pages/PortalRenderPage.vue`：消费者渲染页（`useMaterials + PortalGridRenderer`）
- `apps/portal/src/modules/portal/api/**`：portal/cms 接口收口（tab/templatePublic/tabPublic + cms）
- `apps/portal/src/modules/portal/materials/useMaterials.ts`：向 `portal-engine` 注入 `cmsApi`

### portal 登录与菜单边界

- `admin` 与 `portal` 共享：
  - `packages/ui/src/components/auth/LoginBox.vue`
  - `packages/ui/src/components/auth/LoginBoxV2.vue`
  - `packages/core/src/auth/login.ts`
- `admin` / `portal` 各自保留 `shared/services/auth-captcha-service.ts`，只负责把验证码接口适配给共享 `LoginBoxV2.vue`
- `admin` 登录页统一使用 `LoginBoxV2.vue`；`portal` 按各自场景决定使用 `LoginBox.vue` 或 `LoginBoxV2.vue`
- `LoginBox.vue` 内置默认密码校验与 SM4 加密能力，可通过 props 开关/覆盖；滑动验证场景统一走 `LoginBoxV2.vue`
- `apps/*/infra/sczfw` 继续保留请求签名能力（`Client-Signature`）；其中 admin 还保留少量业务字段加密能力
- `admin` / `portal` **不共享整页登录页**：页面壳、背景、直登/SSO、登录后跳转继续各自维护
- `admin` / `portal` 登录页不再保留 `backend === 'default'` 的 demo 分支，统一由各自页面壳组合共享登录组件
- `portal` 登录成功后优先处理 `redirect`，否则再调用 `/cmict/admin/front-config/portal` 做前台首页分流
- `portal` 继续保持前台静态应用边界：**不接菜单接口**，不依赖 `/cmict/admin/permission/*`

### 启动与路由收敛补充（2026-03）

- `bootstrap/router.ts` 使用 `createWebHistory(appEnv.baseUrl)`，由 `infra/env.ts` 统一聚合 `BASE_URL`，避免子路径部署路由错位与读取来源分散。
- `config/platform-config.ts` 增加了：
  - **并发复用**（同一时刻只发一次配置请求）
  - **超时控制**（默认 8s）
  - **失败重试**（默认 1 次）
  - **只读快照兜底（开关控制）**：开启 `VITE_ENABLE_PLATFORM_CONFIG_SNAPSHOT_FALLBACK=true` 时，主配置加载失败可回退本地快照
- `router/registry.ts` 为模块清单增加内存缓存，降低重复扫描开销；HMR 时自动失效重建。
- `router/assemble-routes.ts` 在模块路由装配阶段增加冲突防护：
  - 禁止占用保留 path/name（`/login`、`/sso`、`/403`、`/404`、通配 404 等）
  - 检测重复 path/name，后出现的冲突路由自动跳过并告警
  - 通配 404 改为 `replace: true`，避免非法地址回退产生历史栈污染
- `bootstrap/index.ts` 收敛为启动编排层；插件安装与守卫安装拆分为 `bootstrap/plugins.ts` 与 `bootstrap/guards.ts`。
- `bootstrap/plugins.ts` 的 `OneTag` 配置改为：
  - `homePath` 统一复用 `DEFAULT_FALLBACK_HOME`
  - `storageKey` 加 `storageNamespace` 前缀（`${storageNamespace}:ob_tags`），避免多应用同域冲突
- `router/index.ts` 移除 `getRoutes()` 多入口，仅保留 `getRouteAssemblyResult()`，避免路由装配结果在调用侧分叉。

## 存储命名空间与首次路由

- `createCore({ storageNamespace })` 可为 core 状态存储增加命名空间前缀（例如 `one-base-template-admin:*`）。
- core 的 auth/system/menu/layout/tabs/assets 均遵循同一命名空间规则，并在读取阶段兼容历史未命名空间 key，便于渐进迁移。
- admin 根路由不再直接读取 `ob_*` 内部 key；统一通过 `getInitialPath()` 解析首次落点，保持“代码配置首页优先，菜单叶子兜底”的行为一致。

## 主题架构分层

- `packages/core/src/stores/theme.ts`
  - 维护主题状态（preset/custom 模式、自定义主色、持久化）
  - 通过 `storageNamespace` 实现跨项目隔离存储
- `packages/core/src/theme/one/theme-tokens.ts`
  - 管理 one token：主色九阶、色板变量、反馈状态色（含 link）
  - token 单一来源收敛到 `PRESET_TOKENS`（`themes/palette/feedback`）
- `packages/core/src/theme/one/style-host.ts`
  - 主题样式宿主：负责 `style#one-theme-base` / `style#one-theme-runtime` 的创建与更新
- `packages/core/src/theme/one/apply-theme.ts`
  - 将主题变量分层写入 head 下双 style tag（不再写 `html.style`）
  - 将 One token 桥接到 Element Plus 变量（`--el-*`）
  - One 默认实现下反馈状态色固定（`success/warning/error/info/link`）
- `apps/admin/src/config/theme.ts`
  - 仅注册项目主题（例如 `adminOrange` / `adminPurple`），不再维护 token 引擎
  - 推荐仅注册 `name/primary/primaryScale`，语义色扩展位由 core 自定义应用器按需消费
- `packages/ui/src/components/theme/ThemeSwitcher.vue`
  - 个性设置内容面板（主题风格切换 / 主色微调 / 灰色模式）
- `packages/ui/src/components/theme/PersonalizationDrawer.vue`
  - 个性设置抽屉容器（承载标题/说明/关闭交互，与 TopBar 解耦，内部使用不对外导出）
- `packages/ui/src/components/container/PageContainer.vue`
  - 提供“撑满父容器 + 内部滚动区”的页面容器壳，供业务页面快速复用
- `packages/ui/src/pages/error/*`
  - 维护通用错误页（403/404），admin 路由直接复用，避免多应用重复实现

## 边界规则（必须遵守）

- `packages/core`
  - 只写逻辑与契约，不依赖具体 UI（禁止引入 element-plus）。
  - 不假设具体后端字段（由 Adapter 适配）。
- `packages/ui`
  - 只做 UI 壳与交互。
  - 通过 core 的 store/composable 获取数据。
  - 禁止反向依赖 apps。
- `apps/admin`
  - 只做组装与页面样式。
  - 对接不同后端时优先替换 `packages/adapters` 或应用侧注入 adapter。

## 模块 Manifest 与切割

- 模块唯一入口：`apps/admin/src/modules/<module-id>/module.ts`
- `module.ts` 必须显式声明 `moduleTier`（`core`/`optional`），用于表达主链路与非主链路模块边界
- 路由分组：
  - `routes/layout.ts`：挂在 `AdminLayout` 下
  - `routes/standalone.ts`：顶层全屏/匿名路由（可选）
- 运行时白名单：`platform-config.json` 的 `enabledModules`
  - `"*"`：启用全部模块
  - `string[]`：只启用指定模块
  - 管理端生产配置建议使用 `string[]` 显式白名单，避免把实验/迁移模块一并装配进主链路
  - `optional` 模块必须配置 `enabledByDefault=false`；若契约不合法会被注册器忽略并告警
- API 约束：页面只能调 `services/*`，模块 HTTP 请求收敛在 `api/client.ts`

## 静态路由 + 动态菜单

核心约定：
- 路由：始终静态声明（模块内 `routes/*.ts`），由 `module.ts` 统一导出给路由组装器。
- 菜单：
  - `remote`：后端返回“可见菜单树”
  - `static`：从静态路由生成
- 权限（默认）：**菜单树出现过的 path 集合 = allowedPaths**；不在集合的路由统一拦截到 `403`。
  - 详情/编辑等“非菜单路由”用 `meta.activePath` 归属到某个菜单入口
  - 若页面是“本地维护但暂未接入菜单”，可用 `meta.skipMenuAuth=true`（仍需登录）
  - 守卫白名单会基于“已装配路由 + `meta.skipMenuAuth` + `route.name`”自动推导；未命名路由不会被放行并会告警
