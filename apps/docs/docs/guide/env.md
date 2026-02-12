# 环境变量（apps/admin）

建议在 `apps/admin` 下创建 `.env.development` / `.env.local`，并按需覆盖 `.env.example`。

## 在代码里如何读取

为避免 `import.meta.env` 在不同模块散落导致不一致，本仓库约定：

- **禁止**在业务模块直接使用 `import.meta.env`
- 统一通过 `apps/admin/src/infra/env.ts` 导出的 `appEnv` 读取（ESLint 会强制校验）

## 后端切换

- `VITE_BACKEND=default|sczfw`
  - `default`：模板默认后端（`/api/*`）
  - `sczfw`：对接 sczfw（`/cmict/*`，以 token 模式为主）

## 鉴权模式

- `VITE_AUTH_MODE=cookie|token|mixed`
  - `cookie`：Cookie(HttpOnly) + `withCredentials`
  - `token`：每次请求携带 token（通过 `VITE_TOKEN_KEY` 从 localStorage 读取）
  - `mixed`：同时支持 cookie + token
- `VITE_TOKEN_KEY=...`
  - token 模式下使用的 localStorage key

## 菜单模式

- `VITE_MENU_MODE=remote|static`
  - `remote`：菜单从后端获取（Adapter `menu.fetchMenuTree/fetchMenuSystems`）
  - `static`：从静态路由 `meta.title` 生成菜单树（适合简单项目）

## 布局模式

- `VITE_LAYOUT_MODE=side|top|top-side`
  - `side`：左侧菜单布局
  - `top`：顶部横向菜单
  - `top-side`：顶部系统切换 + 左侧系统菜单

## sczfw 多系统配置

- `VITE_SCZFW_SYSTEM_PERMISSION_CODE=admin_server`
  - sczfw adapter 单系统退化模式下，取 `/cmict/admin/permission/my-tree` 指定根的 children
- `VITE_DEFAULT_SYSTEM_CODE=...`
  - 多系统场景下的默认系统 code（优先级高于 `VITE_SCZFW_SYSTEM_PERMISSION_CODE`）
- `VITE_SYSTEM_HOME_MAP='{\"admin_server\":\"/home/index\",\"b_system\":\"/b/home\"}'`
  - 每个系统固定首页路径（JSON 字符串）
