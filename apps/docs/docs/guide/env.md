# 配置模型（apps/admin / admin-lite）

<div class="doc-tldr">
  <strong>TL;DR：</strong>`admin` 与 `admin-lite` 统一采用“构建期 env + 代码静态平台配置（platform-config.ts）”，不再依赖运行时 `platform-config.json`；业务模块统一通过 `getAppEnv()` 取配置，禁止直接读 `import.meta.env`。
</div>

## 适用范围

- 适用目录：`apps/admin/**`、`apps/admin-lite/**`
- 适用场景：环境配置调整、后端接入切换、模块开关治理
- 目标读者：业务开发、项目维护者、迁移实施同学

## 1. 当前生效的配置分层

### 1.1 构建期配置（`.env*`）

示例文件：`apps/admin/.env.example`

| 名称                | 示例值                                              | 用途                                                     |
| ------------------- | --------------------------------------------------- | -------------------------------------------------------- |
| `VITE_API_BASE_URL` | `https://gateway-basic-30746.p.onecode.cmict.cloud` | Vite 开发代理目标（`/api`、`/cmict`）与可选 http baseURL |
| `VITE_APP_BASE`     | `/`                                                 | 统一 base 前缀（Vite `base` + Router `baseUrl`）         |

### 1.2 代码静态平台配置（`platform-config.ts`）

核心文件：`apps/admin/src/config/platform-config.ts`

当前按 4 组维护：

1. `systemScopeConfig`：系统范围（`systemConfig/defaultSystemCode/systemHomeMap`）
2. `runtimeModeConfig`：运行模式（`backend/authMode/historyMode/menuMode`）
3. `appIdentityConfig`：应用身份（`appcode/storageNamespace/basic headers/signature`）
4. `moduleConfig`：模块开关（`enabledModules`）

最终通过 `parseRuntimeConfig({...})` 合并并校验。

## 2. 高价值字段速查

| 字段               | 当前语义                         | 常见修改场景           |
| ------------------ | -------------------------------- | ---------------------- |
| `systemConfig`     | 单系统/多系统范围控制            | 需要切系统展示策略     |
| `backend`          | 后端适配类型（`basic/default`）  | 切换后端协议           |
| `authMode`         | 鉴权模式（`token/cookie/mixed`） | 登录态策略切换         |
| `menuMode`         | 菜单来源（`remote/static`）      | 后端菜单与静态菜单切换 |
| `storageNamespace` | 本地缓存隔离命名空间             | 多应用并行部署防串数据 |
| `enabledModules`   | 模块白名单/全量开关              | 发布裁剪或灰度模块     |

> 说明：`tokenKey` / `idTokenKey` 未显式配置时，会基于 `storageNamespace` 自动生成。

## 3. 最小可运行路径（改配置必走）

### 3.1 修改入口

1. 改构建期变量：`apps/admin/.env.development.local`
2. 改业务平台配置：`apps/admin/src/config/platform-config.ts`

### 3.2 快速核对

在仓库根目录执行：

```bash
rg -n "VITE_API_BASE_URL|VITE_APP_BASE" apps/admin/.env.example
rg -n "systemConfig|backend|authMode|menuMode|storageNamespace|enabledModules" apps/admin/src/config/platform-config.ts
```

### 3.3 验证命令

```bash
pnpm -C apps/admin typecheck
pnpm -C apps/admin build
pnpm -C apps/docs build
```

通过标准：

1. admin 构建通过。
2. 文档构建通过。
3. 配置字段与文档描述一致。

## 4. 启动与读取链路（真实行为）

- 聚合入口：`apps/admin/src/config/env.ts`
- 统一读取：`getAppEnv()`
- 启动链路：`main.ts -> startAdminApp() -> bootstrap/startup.ts -> bootstrap/index.ts -> mount`

关键约束：

1. 业务模块禁止直接使用 `import.meta.env`。
2. 配置读取统一走 `getAppEnv()`。
3. `loadPlatformConfig()` 与 `getPlatformConfig()` 读取同一份静态配置。

## 5. 其他应用差异

- `apps/portal`：仍使用 `public/platform-config.json` 运行时配置。
- `apps/admin-lite`：与 `apps/admin` 同口径，采用静态 `platform-config.ts`。

## 6. 常见问题

| 问题                          | 原因                                  | 处理方式                                      |
| ----------------------------- | ------------------------------------- | --------------------------------------------- |
| 改了 `.env` 但菜单/模块没变化 | 菜单/模块受 `platform-config.ts` 控制 | 到 `platform-config.ts` 调整对应字段          |
| 多应用 token 互相污染         | `storageNamespace` 重复或缺失         | 为每个应用显式设置独立 `storageNamespace`     |
| 页面读取到旧配置              | 业务代码绕过 `getAppEnv()`            | 清理直读 `import.meta.env`，统一改走 `env.ts` |

## 7. 相关阅读

- [目录结构与边界](/guide/architecture)
- [开发规范与维护](/guide/development)
- [菜单与路由规范（Schema）](/guide/menu-route-spec)
