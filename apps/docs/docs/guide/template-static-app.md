# Template 迁移基座项目

> 项目路径：`apps/template`
> 当前定位：**与 admin 同构的子项目基座**（非最小静态示例）

## TL;DR

- template 已升级为“可复制底盘”，用于后续新子项目孵化与老项目迁移承接。
- 平台配置入口固定为 `src/config/platform-config.ts`，不再依赖 `public/platform-config.json`。
- 模块契约固定为 `manifest.ts + module.ts + routes.ts`，路由装配统一走 `registry + assemble`。
- 默认鉴权口径：`remote-single + token + backend=basic`，并保留 `default/basic` 双后端分支。

## 1. 目标与边界

### 目标

- 提供与 admin 一致的启动分层：`startup/index/core/http/adapter/plugins/error-view`。
- 提供可执行红线：`pnpm -C apps/template lint:arch`。
- 让后续迁移模块主要只改 `modules/**` 与少量 `config/**`。

### 非目标

- 本轮不迁移具体老项目业务页面。

## 2. 启动方式

在仓库根目录执行：

```bash
pnpm dev:template
```

等价命令：

```bash
pnpm -C apps/template dev
```

## 2.1 以 template 派生新 app

默认从仓库根目录执行：

```bash
pnpm new:app <app-id>
```

若需要同时带一套默认 CRUD starter：

```bash
pnpm new:app <app-id> --with-crud-starter
```

仅预览生成结果、不落盘：

```bash
pnpm new:app <app-id> --dry-run
```

生成后建议直接验证：

```bash
pnpm -C apps/<app-id> typecheck
pnpm -C apps/<app-id> lint
pnpm -C apps/<app-id> lint:arch
pnpm -C apps/<app-id> test:run
pnpm -C apps/<app-id> build
```

说明：

- 新 app 统一复制 `apps/template`，再按 `<app-id>` 重写应用名、平台标识、样式入口与测试常量。
- 启动命令统一使用 `vp run --filter <app-id> dev`，不额外向根 `package.json` 增长 `dev:<app-id>` 脚本。
- `--with-crud-starter` 会生成 `starter-crud` 模块，使用本地内存数据演示查询 / 新增 / 编辑 / 删除闭环。
- 示例参考：`zfw-system-sfss` 已完成 `--with-crud-starter` 生成，可直接查看 [zfw-system-sfss 快速使用手册](/guide/zfw-system-sfss-quick-start)。

## 3. 启动骨架（与 admin 对齐）

核心链路：

- `src/main.ts`：仅保留 `beforeMount` 扩展入口
- `src/bootstrap/startup.ts`：统一启动编排与错误兜底
- `src/bootstrap/index.ts`：创建 app/pinia/router/http/core，注册守卫与插件
- `src/bootstrap/{http,adapter,core,plugins,error-view}.ts`：按职责拆分

关键约束：

- `setupRouterGuards(...)` 必须先于 `app.use(router)`，保证首屏导航可拦截。
- `registerMessageUtils`、`OneUiPlugin`、`OneTag` 统一在 bootstrap 链路安装。

## 4. 配置入口（代码静态配置）

唯一平台配置入口：

- `apps/template/src/config/platform-config.ts`

默认配置口径：

- `preset: 'remote-single'`
- `authMode: 'token'`
- `backend: 'basic'`
- `menuMode: 'remote'`
- `enabledModules: ['home', 'demo']`

环境聚合入口：

- `apps/template/src/config/env.ts`

说明：

- 禁止恢复 `apps/template/public/platform-config.json` 运行时加载。
- 除 `config/env.ts` 与 `utils/logger.ts` 外，禁止直接使用 `import.meta.env`。

## 5. 模块契约与路由装配

模块目录契约：

- `modules/<module>/manifest.ts`：模块元信息（id、版本、层级、默认启用）
- `modules/<module>/module.ts`：模块声明（apiNamespace、routes）
- `modules/<module>/routes.ts`：路由静态声明

路由装配入口：

- `src/router/registry.ts`：manifest 扫描 + enabledModules 过滤 + module 声明加载
- `src/router/assemble-routes.ts`：固定路由与模块路由统一装配
- `src/router/meta.ts`：`open/auth/menu` 语义 helper
- `src/router/public-routes.ts`：登录/SSO/403/404 公共路由定义

## 6. 登录与服务分层

登录基线：

- 登录页统一使用 `@one-base-template/ui/lite-auth` 的 `LoginBox`/`LoginBoxV2`
- 禁止 `demo/demo` 自动预填
- 验证码服务统一收口到 `src/services/auth/auth-captcha-service.ts`

服务与类型分层：

- `src/services/auth/*`：登录/SSO 场景服务
- `src/services/security/*`：签名与加密能力
- `src/types/api.ts`：通用 API 类型
- `src/utils/*`：应用级工具

## 7. 架构门禁（必须执行）

```bash
pnpm -C apps/template lint:arch
```

门禁脚本：`scripts/check-template-arch.mjs`，覆盖：

- 启动骨架边界（禁止业务侧创建 app/pinia/router）
- 全局安装边界（禁止业务侧 `app.use(...)`）
- 模块边界（禁止模块间直接 import）
- CRUD 红线（`list.vue` 禁止 `el-table/el-dialog/el-upload`）
- 模板事件红线（禁止内联箭头函数）
- API 红线（禁止 `obHttp` 中间变量与类型中转导出）

## 8. 提测命令清单

```bash
pnpm -C apps/template typecheck
pnpm -C apps/template lint
pnpm -C apps/template lint:arch
pnpm -C apps/template test:run
pnpm -C apps/template build
```

跨仓门禁（根目录）：

```bash
pnpm lint:arch
```

说明：根 `lint:arch` 会自动发现 `apps/*/package.json` 中声明了 `lint:arch` 的 app，并在最后补跑 `pnpm check:basic-signature`。

## 9. 相关规范入口

- Template 红线主版本：`apps/template/AGENTS.md`
- 可读版文档：`/guide/template-agent-redlines`
- 全仓规则分层：`/guide/agents-scope`
