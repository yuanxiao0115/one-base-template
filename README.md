# one-base-template

Vue 3 + Vite 8(beta) + Tailwind(v4) + Element Plus + Pinia + Vue Router 的 Monorepo 脚手架（pnpm workspaces + Turborepo）。

目标：提供一个“可拆可切”的后台壳模板，核心逻辑沉到 `packages/core`，UI 壳沉到 `packages/ui`，不同项目只需要替换 Adapter 与页面样式即可。

## 目录结构

```text
apps/admin            # 主应用
packages/core         # 纯逻辑：鉴权/SSO/菜单/主题/tabs/http 等
packages/ui           # UI 壳：布局/菜单/顶栏/tabs/keep-alive 等
packages/adapters     # Adapter 示例（含 dev mock）
```

## 快速开始

```bash
pnpm install
pnpm dev
```

## 文档站点（VitePress）

文档项目位于：`/Users/haoqiuzhi/code/one-base-template/apps/docs`

启动文档：

```bash
pnpm -C apps/docs dev
```

构建文档：

```bash
pnpm -C apps/docs build
```

说明：`pnpm dev` 默认启动 `apps/admin`（等价于 `pnpm -C apps/admin dev`）。如需用 Turborepo 启动可尝试 `pnpm dev:turbo`（部分环境下 turbo 对 dev server 的进程托管可能不稳定）。

默认 `apps/admin` 会启用 dev mock（Vite middleware），不需要后端即可跑通登录/菜单/SSO 基础流程：

- 未登录访问 `/` -> 自动跳转 `/login?redirect=/...`
- 登录成功 -> 拉取 `me` + `menu` -> 进入首页
- 多标签页（tabs）+ keep-alive 缓存
- 主题切换（多套主题色）
- SSO 回调：`/sso?token=xxx` / `ticket` / `code`
- 下载演示：进入“页面 A”，点击“下载示例文件”（验证 `$isDownload` + 自动触发下载）

## 构建

```bash
pnpm build
```

## 配置模型（apps/admin）

`apps/admin` 采用“双层配置”：

- 构建期（`.env*`）：只保留 `VITE_API_BASE_URL` / `VITE_USE_MOCK` 等 dev/proxy 相关项
- 运行时（`apps/admin/public/platform-config.json`）：backend/auth/menu/system/module 等业务配置

`platform-config.json` 关键字段：

- `backend`: `default | sczfw`
- `authMode`: `cookie | token | mixed`
- `menuMode`: `remote | static`
- `enabledModules`: `"*"` 或 `string[]`（模块白名单）
- `defaultSystemCode` / `systemHomeMap`: 多系统默认与首页映射
- `VITE_API_BASE_URL=https://your-backend.example.com`
  - 开发环境：存在时会启用 Vite 代理 `/api -> VITE_API_BASE_URL`，并默认关闭 mock
  - 生产环境：如需跨域直连，可作为 Axios `baseURL`（默认仍推荐同源 `/api`）
- `VITE_USE_MOCK=true`
  - 强制开启 mock（即使配置了 `VITE_API_BASE_URL`）

## 本地缓存（参考老项目）

为了对齐部分老项目“刷新后保留状态”的习惯，core 会把以下信息写入 localStorage：

- `ob_auth_user`：当前用户信息（`auth.fetchMe()` 成功后写入；登出/重置时清理）
- `ob_menu_tree`：菜单树（`menu.loadMenus()` 成功后写入；重置时清理）

## 路由与模块切割

- 路由全量静态声明在模块内：`apps/admin/src/modules/**/routes/*.ts`
- 模块唯一入口：`apps/admin/src/modules/**/module.ts`（Manifest）
- 路由统一由 `apps/admin/src/router/assemble-routes.ts` 组装
- 支持运行时白名单切割：`platform-config.json` 的 `enabledModules`

## 动态菜单 + 静态路由（核心规则）

- 路由：只从前端静态模块加载（不依赖后端动态 addRoute 才能访问）
- 菜单：
  - `remote`：从后端返回“可见菜单树”（决定显示 + allowedPaths）
  - `static`：从本地路由 `meta.title` 生成菜单树
- 默认权限校验：**菜单树出现过的 path 集合 = allowedPaths**；不在集合的路由统一拦截到 `403`

## SSO 单点登录

- 回调路由：`/sso`（默认白名单）
- 策略配置：`apps/admin/src/main.ts` -> `createCore({ sso: { strategies: [...] } })`
- 示例：
  - `/sso?token=demo&redirect=%2Fhome`
  - `/sso?ticket=st-demo&redirect=%2Fhome`
  - `/sso?code=xxx&state=yyy&redirect=%2Fhome`

## 如何对接真实后端（Adapter）

核心解耦点：`apps/admin` 不直接写死后端字段，统一通过 Adapter 适配。

- 接口契约：`/Users/haoqiuzhi/code/one-base-template/packages/core/src/adapter/types.ts`
- 示例实现：`/Users/haoqiuzhi/code/one-base-template/packages/adapters/src/defaultAdapter.ts`
- Cookie(HttpOnly) 模式：
  - 登录接口需要 `Set-Cookie`
  - HTTP 客户端默认 `withCredentials: true`
  - 开发 mock 通过 Vite middleware 模拟 `Set-Cookie`（见 `apps/admin/vite.config.ts`）

## 主题切换

主题在 `apps/admin/src/main.ts` 里配置：

- `createCore({ theme: { defaultTheme, themes } })`
- `packages/core` 会在切换时写入 Element Plus 主色及派生色 CSS 变量（`--el-color-primary-*`）

## HTTP/Axios 封装（兼容旧项目 PureHttp 习惯）

脚手架在 `packages/core` 内提供了 `createObHttp()`：

- 默认约定业务响应形态为 `{ code, data, message }`（可在 app 层通过 `options.biz` 覆盖）
- 默认成功码 **兼容 `0/200` 混用**（可通过 `successCodes` 覆盖）
- 默认 **不因业务码失败而抛异常**（贴近旧项目习惯）；网络错误仍会抛出
- 支持 `$isUpload/$isDownload/$noErrorAlert/beforeRequestCallback/beforeResponseCallback` 等字段
- `$isDownload` 默认 **自动触发下载**（可通过 hooks 自定义）

详细说明见：`/Users/haoqiuzhi/code/one-base-template/packages/core/README.md`。
