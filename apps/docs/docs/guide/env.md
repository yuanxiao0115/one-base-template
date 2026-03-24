# 配置模型（apps/admin）

从 2026-02-24 开始，`apps/admin` 采用“双层配置”：

- **构建期配置**（`.env*`）：只保留 Vite dev/proxy 必需项
- **运行时配置**（`public/platform-config.json`）：业务行为配置（backend/auth/menu/system 等）

## 1) 构建期配置（`.env*`）

示例见：`apps/admin/.env.example`

当前保留最小集合：

- `VITE_API_BASE_URL`
  - Vite dev server 的 `/api`、`/cmict` 代理目标
  - 生产构建时也会作为 http baseURL 的来源
- `VITE_ENABLE_PLATFORM_CONFIG_SNAPSHOT_FALLBACK`
  - 启用启动容灾：当 `platform-config.json` 加载失败时，允许回退到浏览器本地只读快照
  - 默认关闭，建议仅在灰度/特定部署场景按需开启

## 2) 运行时配置（`platform-config.json`）

文件路径：`apps/admin/public/platform-config.json`

推荐优先使用 `preset`（更少配置）：

### 2.1 最简写法（推荐）

```json
{
  "preset": "static-single"
}
```

或：

```json
{
  "preset": "remote-single"
}
```

默认补全规则：

- `backend=default`
- `authMode=token`
- `tokenKey=token`
- `idTokenKey=idToken`
- `enabledModules=*`
- `authorizationType=ADMIN`
- `appsource=frame`
- `appcode=one-base-template`
- `storageNamespace=appcode`
- `defaultSystemCode=default`
- `systemHomeMap={ [defaultSystemCode]: "/home/index" }`

并且 preset 模式下仅允许单系统（`systemHomeMap` 只能 1 个 key）。

### 2.2 完整写法（高级）

示例：

```json
{
  "preset": "remote-single",
  "backend": "basic",
  "authMode": "token",
  "tokenKey": "token",
  "idTokenKey": "idToken",
  "menuMode": "remote",
  "enabledModules": "*",
  "authorizationType": "ADMIN",
  "appsource": "frame",
  "appcode": "od",
  "storageNamespace": "one-base-template-admin",
  "clientSignatureClientId": "1",
  "clientSignatureSalt": "fc54f9655dc04da486663f1055978ba8",
  "defaultSystemCode": "admin_server",
  "systemHomeMap": {
    "admin_server": "/home/index"
  }
}
```

字段说明：

- `preset`（可选）: `static-single | remote-single`，用于收敛到“单系统 + 不混合”模式
- `backend`: `default | basic`
- `authMode`: `cookie | token | mixed`
- `tokenKey` / `idTokenKey`: token 存储键
- `menuMode`: `remote | static`
- `enabledModules`: `"*"` 或 `string[]`（模块白名单；例如 `["home","user-management","log-management","system-management"]`）
- `authorizationType` / `appsource` / `appcode`: basic 请求头约定
- `storageNamespace`（可选）: 前端持久化命名空间（主题等状态隔离）；未配置时回退为 `appcode`
- `clientSignatureClientId` / `clientSignatureSalt`: basic 签名参数（公开盐值，非前端 secret）
- `defaultSystemCode`: 默认系统 code（用于多系统初始化）
- `systemHomeMap`: 系统首页映射（`{ [systemCode]: "/path" }`）

布局说明：

- `layoutMode` 与 `systemSwitchStyle` 不再由 `platform-config.json` 提供
- 请在 `apps/admin/src/config/layout.ts` 中通过代码配置布局与系统切换样式（含 `topbarHeight` / `sidebarWidth` / `sidebarCollapsedWidth`）

### 2.3 接手最小配置清单（降低心智负担）

优先只看这两处：

- **常用必配**：`apps/admin/.env.development.local` 中的 `VITE_API_BASE_URL`
- **业务必配**：`apps/admin/public/platform-config.json`

其余配置文件按“是否需要维护”分层：

| 文件                            | 作用                            | 是否建议日常修改           |
| ------------------------------- | ------------------------------- | -------------------------- |
| `src/config/layout.ts`          | 布局参数（侧栏宽度、顶栏高度）  | 按需修改                   |
| `src/config/theme.ts`           | 主题注册与默认主题              | 按需修改                   |
| `src/config/sso.ts`             | SSO 回调策略                    | 按需修改                   |
| `src/config/systems.ts`         | 系统首页映射                    | 按需修改                   |
| `src/config/ui.ts`              | UI 默认配置（容器类型、分页键） | 按需修改                   |
| `src/config/env.ts`             | 运行时配置聚合入口              | 一般不改                   |
| `src/config/platform-config.ts` | 运行时配置加载策略              | 一般不改                   |
| `src/utils/logger.ts`           | 日志工具                        | 非配置，不放在 config 维护 |
| `src/services/security/*`       | 签名与加密能力                  | 非配置，按安全能力维护     |

## 3) 启动顺序与失败策略

- `src/main.ts` 启动时先加载 `platform-config.json`
- 配置加载成功后，再动态导入 `bootstrap/index.ts`；业务运行时配置仍通过 `getAppEnv()` 懒读取并缓存
- 所有路径统一走 `bootstrapAdminApp()`，`/login` 与 `/sso` 只保留为主路由表中的公共路由，不再维护匿名独立启动链路
- 未授权回跳时，会按需动态导入 `@one-base-template/tag/store` 清理 tags，再统一 `router.replace('/login')`
- 校验失败或加载失败时，应用**硬失败**（不进入业务路由），页面展示通用错误信息而不是白屏
- 若开启 `VITE_ENABLE_PLATFORM_CONFIG_SNAPSHOT_FALLBACK=true`，会尝试读取本地只读快照作为兜底配置
- 只有配置加载成功后，才会进入 admin bootstrap

## 4) 代码约束

- 业务模块仍然**禁止**直接使用 `import.meta.env`
- 统一通过 `apps/admin/src/config/env.ts` 导出的 `getAppEnv()` 读取业务运行时配置；`buildEnv` 仅承载构建期最小集合
- 运行时配置统一通过 `apps/admin/src/config/platform-config.ts` 加载，schema 校验规则位于 `packages/core/src/config/platform-config.ts`
- `apps/admin/src/config` 仅承载“可维护配置项 + 运行时入口”，工具逻辑统一放到 `utils/*` 或 `services/*`
