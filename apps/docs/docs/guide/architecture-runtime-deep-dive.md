# 启动链路细节（深度）

> 适用范围：`apps/admin`、`apps/admin-lite`、`apps/portal`、`packages/app-starter`、`packages/core`

本页承接 [目录结构与边界](/guide/architecture) 的运行时细节，聚焦“应用如何启动、如何收敛路由与平台配置”。

## admin 启动分层

管理端将启动链路集中在以下位置，避免多入口分叉：

- `apps/admin/src/config/platform-config.ts`：维护并校验代码静态平台配置
- `apps/admin/src/bootstrap/startup.ts`：统一启动编排（bootstrap -> beforeMount -> router.isReady -> mount）
- `apps/admin/src/config/env.ts`：聚合构建期 env 与代码静态平台配置
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

- `apps/admin-lite/src/config/platform-config.ts`：代码静态平台配置入口（默认 `remote-single + token + backend=basic`）
- `apps/admin-lite/src/config/env.ts`：聚合构建期 env 与平台静态配置
- `apps/admin-lite/src/main.ts`：保留 beforeMount 扩展入口
- `apps/admin-lite/src/bootstrap/startup.ts`：统一启动编排与错误兜底
- `apps/admin-lite/src/bootstrap/index.ts`：创建 app/pinia/router/http/core，并安装插件与守卫
- `apps/admin-lite/src/bootstrap/admin-lite-styles.ts`：基座基础样式统一入口
- `apps/admin-lite/src/bootstrap/{http,adapter,core,plugins,error-view}.ts`：HTTP、后端适配、core 安装、壳层插件、错误视图分层
- `apps/admin-lite/src/router/{registry,assemble-routes,meta,public-routes}.ts`：模块声明加载、路由装配、meta helper、公共路由定义
- `apps/admin-lite/src/modules/**/{manifest,module,routes}.ts`：模块契约与路由声明

### admin-lite 启动顺序（流程图）

![admin-lite 启动顺序流程图（SVG）](/diagrams/runtime-admin-lite-startup.svg)

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

- `bootstrap/index.ts` 内联 `createWebHistory(appEnv.baseUrl)`，避免 `BASE_URL` 来源分散
- `apps/admin` 不再依赖 `public/platform-config.json` 运行时文件，平台配置改为 `src/config/platform-config.ts` 代码静态维护。
- `apps/portal` 仍保留 runtime config loader 能力（并发复用、超时、重试、按需快照兜底）；`apps/admin-lite` 已收敛到代码静态配置。
- `router/registry.ts` 改为两阶段装配：
  - 先扫描 `modules/**/manifest.ts`（eager）
  - 再按 `enabledModules` 动态导入 `modules/**/module.ts`
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

## 延伸阅读

- [目录结构与边界](/guide/architecture)
- [模块系统与切割](/guide/module-system)
- [菜单与路由规范（Schema）](/guide/menu-route-spec)
- [布局与菜单](/guide/layout-menu)
- [主题系统](/guide/theme-system)
