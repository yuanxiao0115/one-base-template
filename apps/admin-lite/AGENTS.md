# AGENTS.MD（apps/admin-lite）

> 适用范围：`/Users/haoqiuzhi/code/one-base-template/apps/admin-lite/**`
>
> 先遵循根规则：`/Users/haoqiuzhi/code/one-base-template/AGENTS.md`

## 核心职责

- `admin-lite` 是**后台快速起项目基座**，用于承接新的后台管理项目。
- 默认只保留通用后台骨架：`home`、`admin-management`、`system-management`、`log-management`。
- 不把 CMS、Portal、公文表单等强业务模块作为默认基线；确有需要时，只能以**可开关扩展**方式回接。

## 基座边界

- `apps/admin-lite` 只做应用组装、页面样式、模块编排与项目级配置。
- 通用逻辑优先下沉 `packages/core`，通用壳组件优先复用 `packages/ui`。
- 后端字段差异优先通过 `packages/adapters` 解决，不在页面、组件和 composable 里散落兼容。
- 新项目从 `admin-lite` 派生时，优先改 `config/**`、`modules/**` 与少量样式文件，不要回退到“单文件拼装启动链路”。

## 默认能力

- 启动链路固定为：`main.ts -> bootstrap/startup.ts -> bootstrap/index.ts -> mount`。
- 平台配置唯一入口：`src/config/platform-config.ts`。
- UI 开关统一收口：`src/config/ui.ts`。
- 默认打开模块：`home`、`admin-management`、`system-management`、`log-management`。
- 默认关闭扩展：租户切换、素材图片缓存、强业务管理模块。

## 目录约束

- `src/config`：只放开发者可维护配置项与代码静态平台配置入口。
- `src/services/auth`：登录、SSO、验证码场景服务。
- `src/services/security`：签名与加密能力。
- `src/types`：跨模块通用协议类型。
- `src/utils`：应用级工具；禁止把配置和安全逻辑塞回 `utils`。
- `tests`：应用层测试；架构边界类测试统一放 `tests/architecture`。

## 路由与菜单

- 路由全部前端静态声明，统一通过 `modules/**/routes.ts` 导出。
- 模块契约固定为：`manifest.ts + module.ts + routes.ts`。
- 模块路由统一经 `router/registry.ts + router/assemble-routes.ts` 装配，禁止回退到运行时动态 `addRoute`。
- 菜单模式支持 `remote` / `static`；未声明 `meta.access` 时默认按 `menu` 处理。
- 非菜单但需要登录的页面，统一使用 `meta.access='auth'` 或 `meta.activePath` 收口。

## 登录与顶栏

- 登录页统一使用 `@one-base-template/ui/lite-auth` 提供的公共登录框，不要回退到页面内自拼表单。
- 顶栏扩展开关统一在 `src/config/ui.ts` 控制：
  - `tenantSwitcher`
  - `profileDialog`
  - `changePassword`
  - `personalization`
  - `titleSuffix`
- 登录页标题、登录框标题统一从 `src/config/ui.ts` 读取，禁止在页面中写死业务文案。
- 素材图片缓存默认关闭；仅在真实需要时通过配置开启，禁止默认注册 Service Worker。

## 模块与扩展

- `admin-lite` 默认不承载 `PortalManagement`、`CmsManagement`、`DocumentFormManagement`。
- 后续如需回接扩展模块，必须同时满足：
  - 默认关闭，不影响基座冷启动与构建体积。
  - 有单独文档说明启用方式、依赖范围与验证命令。
  - 不得把扩展模块规则写回 `admin-lite` 默认红线。
- 新增后台管理模块优先沿用现有 CRUD 范式，不要为单模块重新设计目录结构。

## CRUD 与交互红线

- CRUD 列表编排页统一使用 `ObPageContainer + ObTableBox + ObVxeTable`，禁止回退 `el-table`。
- CRUD 新增/编辑/查看容器统一使用 `ObCrudContainer`，禁止在 CRUD 场景回退 `el-dialog` / `el-drawer` 直连编排。
- 模块业务代码统一使用 `@one-base-template/ui` 的消息与确认能力，禁止直接使用 `ElMessage` / `ElMessageBox`。
- CRUD 目录范式固定：`list.vue + api.ts + types.ts + routes.ts`。
- 模板事件禁止内联箭头函数（如 `@click="() => handleXxx(row)"`）。

## API 与类型红线

- `api.ts` / `api/client.ts` 禁止 `const http = obHttp()` 与 `getHttp()` 包装；统一直接使用 `obHttp().get/post/...`。
- 禁止在同文件内做 `import type ...` 后再 `export type ...` 的类型中转。
- 通用协议类型统一放在 `src/types/api.ts`，模块内 `types.ts` 只保留页面真实消费字段。
- `services/security/signature.ts` 必须继续复用 `@one-base-template/core` 的签名辅助方法。

## 工程门禁

- `lint`：`node ../../scripts/run-vp-task-from-root.mjs lint`
- `lint:arch`：`node ../../scripts/check-admin-lite-arch.mjs`
- `lint:fix`：`node ../../scripts/run-vp-task-from-root.mjs check --fix src`
- `build`：`node ../../scripts/run-vp-build.mjs`
- `lint:arch` 必须覆盖启动边界、模块边界、模板事件禁令、CRUD 红线与 API 红线。

## 本地验证命令

```bash
pnpm -C apps/admin-lite dev
pnpm -C apps/admin-lite typecheck
pnpm -C apps/admin-lite lint
pnpm -C apps/admin-lite lint:arch
pnpm -C apps/admin-lite test:run
pnpm -C apps/admin-lite build
```
