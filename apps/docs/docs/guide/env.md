# 配置模型（apps/admin）

从 2026-03-24 开始，`apps/admin` 采用“**构建期 env + 代码静态平台配置**”，不再依赖运行时 `platform-config.json` 文件。

## 1) 构建期配置（`.env*`）

示例见：`apps/admin/.env.example`

当前保留最小集合：

| 名称                | 值                                                          | 解释                                                                               |
| ------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | `https://gateway-basic-30746.p.onecode.cmict.cloud`（示例） | Vite dev server 的 `/api`、`/cmict` 代理目标；生产构建时也可作为 http baseURL 来源 |
| `VITE_APP_BASE`     | `/`（示例）                                                 | 统一前缀配置：同时作用于 Vite `base` 与 router `baseUrl`，避免静态资源路径错位     |

## 2) 代码静态平台配置（`platform-config.ts`）

文件路径：`apps/admin/src/config/platform-config.ts`

业务配置集中维护在该文件常量中。推荐按下面清单逐项维护（`apps/admin`、`apps/admin-lite` 同口径）：

1. `preset`：路由与菜单预设（`static-single | remote-single`）；当前后台默认 `remote-single`。
2. `backend`：后端适配类型（`default | basic`）；当前默认 `basic`。
3. `authMode`：鉴权模式（`cookie | token | mixed`）；当前默认 `token`。
4. `historyMode`：路由模式（`history | hash`）；当前默认 `history`。
5. `menuMode`：菜单来源（`remote | static`）；`remote-single` 下应为 `remote`。
6. `authorizationType`：权限类型透传字段；用于后端权限域区分。
7. `appsource`：应用来源透传字段；用于后端识别终端来源。
8. `appcode`：应用唯一标识；用于后端与本地配置区分应用。
9. `storageNamespace`：本地存储命名空间；用于隔离多应用缓存与 token key 前缀。
10. `tokenKey` / `idTokenKey`：登录 token 存储 key；preset 场景可省略，默认按 `storageNamespace`（未配置回退 `appcode`）自动生成。
11. `clientSignatureClientId`：basic 签名 clientId。
12. `clientSignatureSalt`：basic 签名盐值（公开盐，不是 secret）。
13. `defaultSystemCode`：默认系统编码；首次进入或无系统上下文时使用。
14. `systemHomeMap`：系统首页映射（`Record<string, string>`）；key 为系统编码，value 为首页路由。
15. `enabledModules`：模块开关（`"*"` 或 `string[]`）；建议显式维护白名单。

说明：

- `getPlatformConfig()` 为同步读取；`loadPlatformConfig()` 仅保留兼容签名，返回同一份静态配置。
- 配置 schema 校验规则位于 `packages/core/src/config/platform-config.ts`（通过 `parseRuntimeConfig` 统一校验）。

## 3) 接手最小清单（降低心智负担）

优先只看两处：

- **本地环境**：`apps/admin/.env.development.local` 的 `VITE_API_BASE_URL`
- **业务平台配置**：`apps/admin/src/config/platform-config.ts`

其余配置文件按“是否需要维护”分层：

| 文件                            | 作用                            | 是否建议日常修改           |
| ------------------------------- | ------------------------------- | -------------------------- |
| `src/config/platform-config.ts` | 业务平台配置（静态）            | 按需修改                   |
| `src/config/env.ts`             | 构建期 env + 平台配置聚合       | 一般不改                   |
| `src/config/layout.ts`          | 布局参数（侧栏宽度、顶栏高度）  | 按需修改                   |
| `src/config/theme.ts`           | 主题注册与默认主题              | 按需修改                   |
| `src/config/auth-sso.ts`        | SSO 策略与 SSO 接口配置统一入口 | 按需修改                   |
| `src/config/systems.ts`         | 系统首页映射                    | 按需修改                   |
| `src/config/ui.ts`              | UI 默认配置（容器类型、分页键） | 按需修改                   |
| `src/utils/logger.ts`           | 日志工具                        | 非配置，不放在 config 维护 |
| `src/services/security/*`       | 签名与加密能力                  | 非配置，按安全能力维护     |

## 4) 启动顺序与失败策略

- `src/main.ts` 统一调用 `startAdminApp()`
- `startup.ts` 内执行：`bootstrapAdminApp()` -> `beforeMount` -> `router.isReady()` -> `app.mount('#app')`
- 启动失败时统一渲染错误页（`renderBootstrapError`），避免白屏
- 所有路径统一走同一条启动链路，不再维护匿名独立启动链路

## 5) 代码约束

- 业务模块仍然**禁止**直接使用 `import.meta.env`
- 统一通过 `apps/admin/src/config/env.ts` 导出的 `getAppEnv()` 读取业务配置
- `apps/admin/src/config` 仅承载“可维护配置项 + 平台配置入口”，工具逻辑统一放到 `utils/*` 或 `services/*`

## 6) 其他应用说明

- `apps/portal` 仍使用 `public/platform-config.json` 运行时文件，并在 `src/config/sso.ts` 统一维护 SSO 路由策略与登录相关端点（`loginPageConfigEndpoint`、`portalFrontConfigEndpoint`、`ticketSsoEndpoint`）
- `apps/admin-lite` 与 `apps/admin` 一样，采用“构建期 env + 代码静态平台配置”模式
- 本页以 `apps/admin` 为主说明，`apps/admin-lite` 可按同口径理解
