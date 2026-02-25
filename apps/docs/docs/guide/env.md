# 配置模型（apps/admin）

从 2026-02-24 开始，`apps/admin` 采用“双层配置”：

- **构建期配置**（`.env*`）：只保留 Vite dev/proxy/mock 必需项
- **运行时配置**（`public/platform-config.json`）：业务行为配置（backend/auth/menu/system 等）

## 1) 构建期配置（`.env*`）

示例见：`apps/admin/.env.example`

当前保留最小集合：

- `VITE_API_BASE_URL`
  - Vite dev server 的 `/api`、`/cmict` 代理目标
  - 生产构建时也会作为 http baseURL 的来源
- `VITE_USE_MOCK`
  - 仅影响 dev middleware mock 是否强制开启
- `VITE_SCZFW_SYSTEM_PERMISSION_CODE`
  - 仅影响 dev mock 返回菜单时的系统根 code

## 2) 运行时配置（`platform-config.json`）

文件路径：`apps/admin/public/platform-config.json`

示例：

```json
{
  "backend": "sczfw",
  "authMode": "token",
  "tokenKey": "token",
  "idTokenKey": "idToken",
  "menuMode": "remote",
  "authorizationType": "ADMIN",
  "appsource": "frame",
  "appcode": "od",
  "storageNamespace": "one-base-template-admin",
  "clientSignatureClientId": "1",
  "clientSignatureSecret": "fc54f9655dc04da486663f1055978ba8",
  "defaultSystemCode": "admin_server",
  "systemHomeMap": {
    "admin_server": "/home/index",
    "b_system": "/b/home"
  }
}
```

字段说明：

- `backend`: `default | sczfw`
- `authMode`: `cookie | token | mixed`
- `tokenKey` / `idTokenKey`: token 存储键
- `menuMode`: `remote | static`
- `authorizationType` / `appsource` / `appcode`: sczfw 请求头约定
- `storageNamespace`（可选）: 前端持久化命名空间（主题等状态隔离）；未配置时回退为 `appcode`
- `clientSignatureClientId` / `clientSignatureSecret`: sczfw 签名参数
- `defaultSystemCode`: 默认系统 code（用于多系统初始化）
- `systemHomeMap`: 系统首页映射（`{ [systemCode]: "/path" }`）

布局说明：
- `layoutMode` 与 `systemSwitchStyle` 不再由 `platform-config.json` 提供
- 请在 `apps/admin/src/config/layout.ts` 中通过代码配置布局与系统切换样式（含 `topbarHeight` / `sidebarWidth` / `sidebarCollapsedWidth`）

## 3) 启动顺序与失败策略

- `src/main.ts` 启动时先加载 `platform-config.json`
- 校验失败或加载失败时，应用**硬失败**（不进入业务路由），页面展示错误信息
- 只有配置加载成功后，才会进入 `bootstrapAdminApp()`

## 4) 代码约束

- 业务模块仍然**禁止**直接使用 `import.meta.env`
- 统一通过 `apps/admin/src/infra/env.ts` 导出的 `appEnv` 读取配置
- 运行时配置统一通过 `apps/admin/src/config/platform-config.ts` 加载与校验
