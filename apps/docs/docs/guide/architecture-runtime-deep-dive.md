# 启动链路细节（深度）

> 适用范围：`apps/admin`、`apps/admin-lite`、`apps/zfw-system-sfss`、`apps/portal`、`packages/app-starter`、`packages/core`

本页承接 [目录结构与边界](/guide/architecture) 的运行时细节，聚焦“应用如何启动、如何收敛路由与平台配置”。

## TL;DR

- `admin` 与 `admin-lite` 已收敛为“代码静态平台配置 + 统一 bootstrap 编排”。
- `admin` / `admin-lite` / `zfw-system-sfss` 的 `config` 已收敛为 `app.ts/auth.ts/request.ts/ui.ts/theme.ts/index.ts` 六个文件。
- `portal` 保留 runtime config loader，但登录与鉴权链路与 admin 共用 core 能力。
- 走查启动问题时优先看四层：`app` -> `runtime` -> `bootstrap/startup` -> `router assemble`。

## 最短执行路径（源码走查）

1. 先确定目标应用：`admin`、`admin-lite`、`portal` 三者启动入口不同，不要混看文件。
2. 按顺序阅读：`config/app.ts` -> `bootstrap/runtime.ts` -> `bootstrap/startup.ts` -> `bootstrap/index.ts`。
3. 再定位路由链路：`router/registry.ts` 与 `router/assemble-routes.ts`，确认模块装配与冲突防护。
4. 最后对照 `packages/core` 的共享能力（签名、登录场景、动态导入恢复）确认边界是否漂移。
5. 使用文末“验证与验收”命令做最小回归，避免只靠阅读判断。

## 前置条件

1. 已熟悉 [目录结构与边界](/guide/architecture) 中的分层职责。
2. 已明确当前问题发生在 `admin`、`admin-lite` 还是 `portal`。
3. 本地可运行目标应用的 `typecheck` 与 docs 构建命令。

## admin 启动分层

管理端将启动链路集中在以下位置，避免多入口分叉：

- `apps/admin/src/config/app.ts`：维护并校验代码静态平台配置
- `apps/admin/src/bootstrap/startup.ts`：统一启动编排（bootstrap -> beforeMount -> router.isReady -> mount）
- `apps/admin/src/bootstrap/runtime.ts`：聚合构建期 env 并输出运行时读取能力（`getRuntime/resolveBuildRuntime`）
- `apps/admin/src/router/{types,registry,assemble-routes}.ts`：模块清单扫描与按需路由装配
- `apps/admin/src/bootstrap/index.ts`：创建 app/pinia/router/http/core，并安装插件与守卫
- `apps/admin/src/bootstrap/startup-profiler.ts`：启动阶段耗时打点与汇总
- `packages/core/src/router/dynamic-import-recovery.ts`：动态路由模块加载失败自动恢复（admin / portal 装配调用）
- `packages/core/src/router/route-signature.ts`：路由装配签名计算（admin/其他 app 共享）
- `packages/core/src/router/route-diagnostics.ts`：路由装配诊断聚合（routeCount/signature）
- `packages/core/src/http/basic-client-signature.ts`：basic 签名请求头注入 helper（admin/portal 共享）
- `packages/core/src/http/client-signature.ts`：basic 签名算法单一实现源（默认参数 + 三段式拼接）
- `packages/core/src/auth/login-scenario.ts`：登录页场景判定（是否校验登录、是否加载登录配置、直登 token）
- `packages/core/src/auth/sso-callback-strategy.ts`：SSO 参数优先级分派
- `apps/admin/src/bootstrap/admin-styles.ts`：基础样式统一入口
- `apps/admin/src/styles/team-overrides.css`：团队覆写样式入口（仅 `main.ts` 引入）

### admin 启动顺序（流程图）

![admin 启动顺序流程图（SVG）](/diagrams/runtime-admin-startup.svg)

## admin-lite 启动分层（后台基座）

- `apps/admin-lite/src/config/app.ts`：代码静态平台配置入口（默认 `remote-single + token + backend=basic`）
- `apps/admin-lite/src/bootstrap/runtime.ts`：聚合构建期 env 并输出运行时读取能力（`getRuntime/resolveBuildRuntime`）
- `apps/admin-lite/src/main.ts`：保留 beforeMount 扩展入口
- `apps/admin-lite/src/bootstrap/startup.ts`：统一启动编排与错误兜底
- `apps/admin-lite/src/bootstrap/index.ts`：创建 app/pinia/router/http/core，并安装插件与守卫
- `apps/admin-lite/src/bootstrap/admin-lite-styles.ts`：基座基础样式统一入口
- `apps/admin-lite/src/bootstrap/{http,adapter,core,plugins,error-view}.ts`：HTTP、后端适配、core 安装、壳层插件、错误视图分层
- `apps/admin-lite/src/router/{registry,assemble-routes,meta,public-routes}.ts`：模块声明加载、路由装配、meta helper、公共路由定义
- `apps/admin-lite/src/modules/**/{meta,index,routes}.ts`：模块契约与路由声明（`meta.ts` 提供 `moduleMeta`）

### admin-lite 启动顺序（流程图）

![admin-lite 启动顺序流程图（SVG）](/diagrams/runtime-admin-lite-startup.svg)

## config 收敛（2026-04）

`admin`、`admin-lite`、`zfw-system-sfss` 三端统一将 `config` 收敛为仅面向项目使用者的配置入口：

- `src/config/app.ts`：平台运行配置（`backend/authMode/menuMode/historyMode/enabledModules` 等）
- `src/config/auth.ts`：SSO 策略与认证端点（`sso/authApi`）
- `src/config/request.ts`：请求策略（`timeout/auth/successCodes/networkMsg`）
- `src/config/ui.ts`：界面策略（`layout/table/crud/login/topbar/materialCache`）
- `src/config/theme.ts`：主题策略（`defaultTheme/allowCustomPrimary/themes`）
- `src/config/index.ts`：统一导出

非配置逻辑不再放进 `config`：

- `src/bootstrap/runtime.ts`：构建期 env 解析与运行时读取
- `src/bootstrap/{adapter,plugins,error-view,material-image-service-worker}.ts`：默认值就地常量收敛
- `src/services/auth/ticket-service-url.ts`：`resolveTicketServiceUrl` 逻辑收敛

## portal 启动分层（门户消费者）

- `apps/portal/public/platform-config.json`：运行时配置（默认落地 `/portal/index`）
- `apps/portal/src/main.ts`：串联配置加载与挂载
- `apps/portal/src/bootstrap/index.ts`：安装 router + core + ui，并注入 `http/adapter`
- `apps/portal/src/bootstrap/{http.ts,adapter.ts}`：复用与 admin 一致的鉴权接入
- `apps/portal/src/modules/portal/materials/useMaterials.ts`：向 `portal-engine` 注入 `cmsApi`

### portal 启动顺序（流程图）

![portal 启动顺序流程图（SVG）](/diagrams/runtime-portal-startup.svg)

### portal 登录与菜单边界

- `admin` / `portal` 共享登录基础能力：
  - `packages/ui/src/components/auth/LoginBox.vue`
  - `packages/ui/src/components/auth/LoginBoxV2.vue`
  - `packages/core/src/auth/login.ts`
- `LoginBoxV2` 对外提供 `stage-change` 事件（如 `captcha-loading`、`captcha-checking`、`captcha-passed`），应用层可据此展示“验证码加载中/校验中/登录与菜单加载中”的阶段反馈，降低登录等待的无感知时段
- 两端保留各自验证码适配服务：`src/services/auth/auth-captcha-service.ts`
- `portal` 登录成功后优先处理 `redirect`，否则调用 `/cmict/admin/front-config/portal` 做前台分流
- `apps/portal` 保持前台独立边界：默认不接 `/cmict/admin/permission/*` 菜单体系

## 启动收敛补充（2026-03）

- `bootstrap/index.ts` 按 `historyMode` 选择 `createWebHistory/createWebHashHistory`，统一消费 runtime 的 `baseUrl`，避免路由前缀与静态资源前缀分散
- `apps/admin` 不再依赖 `public/platform-config.json` 运行时文件，平台配置改为 `src/config/app.ts` 代码静态维护。
- `apps/portal` 仍保留 runtime config loader 能力（并发复用、超时、重试、按需快照兜底）；`apps/admin-lite` 已收敛到代码静态配置。
- `router/registry.ts` 改为两阶段装配：
  - 先扫描 `modules/**/meta.ts` 中的 `moduleMeta`（eager）
  - 再按 `enabledModules` 动态导入同目录 `modules/**/index.ts` 默认导出
- `router/assemble-routes.ts` 增加保留 path/name 与重复路由冲突防护
- `router/assemble-routes.ts` 新增 `diagnostics` 输出（由 `route-assembly-diagnostics.ts` 统一生成）：
  - `routeCount`
  - `signature`（由 `route-signature.ts` 生成）
- `bootstrap/plugins.ts` 中 `OneTag.storageKey` 增加 `storageNamespace` 前缀，避免同域冲突
- `bootstrap/index.ts` 接入 `startup-profiler`，记录 `assemble-routes/create-router/create-http/install-core/setup-router-guards` 等关键阶段耗时
- `bootstrap/http.ts` 改为复用 `createBasicClientSignatureBeforeRequest()`，避免 admin/portal 重复维护签名注入逻辑
- `services/security/client-signature.ts` 与 `services/security/crypto.ts` 统一复用 `services/security/signature.ts`（该文件继续复用 `packages/core/src/http/client-signature.ts`），避免签名实现漂移
- `apps/portal/src/bootstrap/index.ts` 也接入 `installRouteDynamicImportRecovery(router)`，与 admin 保持一致恢复策略
- `apps/admin-lite/src/bootstrap/index.ts` 同步接入 `installRouteDynamicImportRecovery(router)` 与 `registerMessageUtils`，保证与 admin 启动职责一致

## 存储命名空间与首次路由

- `createCore({ storageNamespace })` 为 core 状态增加命名空间前缀（示例：`one-base-template-admin-lite:*`）
- auth/system/menu/layout/tabs/assets 统一遵循命名空间规则，并兼容读取历史无前缀 key
- admin 首次路由落点通过 `getInitialPath()` 统一决策（代码首页优先，菜单叶子兜底）

## 验证与验收（启动链路走查）

在仓库根目录执行：

```bash
pnpm -C apps/admin typecheck
pnpm -C apps/admin-lite typecheck
pnpm -C apps/portal typecheck
pnpm -C apps/docs lint
pnpm -C apps/docs build
```

通过标准：

- 三个应用 `typecheck` 均通过，无新增启动链路相关类型错误。
- 文档构建通过，启动链路页面无断链、图片引用错误、标题层级异常。
- 走查时可明确回答三件事：配置从哪里来、路由何时装配、登录后菜单边界归属哪个应用。

失败处理：

1. 若“看起来卡启动”：优先检查 `startup.ts` 是否卡在 `router.isReady()` 前后，再看 `startup-profiler` 输出阶段。
2. 若配置来源混乱：先区分代码静态配置（`app.ts`）与 runtime 配置（`portal/public/platform-config.json`）。
3. 若菜单行为异常：确认是否误把 portal 当 admin 菜单体系（`portal` 默认不接 `/cmict/admin/permission/*`）。

## FAQ

### 1) 为什么 admin 和 portal 的平台配置看起来不一样？

`admin` 走代码静态配置收敛，`portal` 保留 runtime loader 能力，两者是有意分层，不是实现漂移。

### 2) 启动链路排查时，先看 app 代码还是 core 代码？

先看应用层入口是否按预期调用，再下钻到 `packages/core` 共享能力，避免一开始就陷入底层细节。

### 3) 为什么文档强调“先定位目标应用”？

因为三个应用的启动入口与配置来源不同，跨应用混看最容易把问题归因到错误文件。

## 延伸阅读

- [目录结构与边界](/guide/architecture)
- [模块系统与切割](/guide/module-system)
- [菜单与路由规范（Schema）](/guide/menu-route-spec)
- [布局与菜单](/guide/layout-menu)
- [主题系统](/guide/theme-system)
