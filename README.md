# one-base-template

Vue 3 + Vite Plus + Tailwind(v4) + Element Plus + Pinia + Vue Router 的 Monorepo 脚手架（pnpm workspaces + Vite Task）。

目标：提供一个“可拆可切”的后台壳模板，核心逻辑沉到 `packages/core`，UI 壳沉到 `packages/ui`，不同项目只需要替换 Adapter 与页面样式即可。

## 目录结构

```text
apps/admin            # 主应用
apps/portal           # 门户消费者应用（独立渲染）
apps/template         # 最小可用示例（静态菜单）
packages/core         # 纯逻辑：鉴权/SSO/菜单/主题/tabs/http 等
packages/ui           # UI 壳：布局/菜单/顶栏/tabs/keep-alive 等
packages/adapters     # Adapter 示例（默认/后端协议适配）
packages/app-starter  # 跨应用启动骨架（runtime config + 统一启动编排）
```

## 快速开始

```bash
pnpm install
pnpm dev
pnpm dev:portal
pnpm dev:template
pnpm doctor
```

常用开发命令：

```bash
pnpm new:module <module-id>
pnpm lint:arch
pnpm test:run
pnpm check:naming
pnpm verify
```

## Vite Plus 使用说明

本项目已经切换为 Vite Plus（`vp`），日常仍可直接用 `pnpm` 脚本，也可直接使用 `vp` 命令：

```bash
# 安装依赖（等价于 pnpm install）
vp install

# 启动指定应用
vp run --filter admin dev
vp run --filter portal dev
vp run --filter template dev

# 全仓任务
vp run -r lint
vp run -r test:run
vp run -r typecheck
vp run -r build

# 单仓质量检查
vp lint .
vp test run
```

说明：

- 根脚本已统一通过 `vp run` 编排（见根 `package.json`）。
- `apps/admin` / `apps/portal` / `apps/template` 的 `build` 使用了包装脚本过滤 Rolldown 插件耗时噪音日志，不影响失败退出码。
- 文档站 `apps/docs` 的 `build` 使用包装脚本过滤 VitePress 上游已知弃用提示，不影响真实错误输出。

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

说明：`pnpm dev` 默认启动 `apps/admin`（等价于 `vp run --filter admin dev`）；`pnpm dev:portal` 启动门户消费者应用（等价于 `vp run --filter portal dev`）；`pnpm dev:template` 启动最小静态菜单示例（等价于 `vp run --filter template dev`）；`pnpm dev:all` 启动全部 workspace 的 dev 任务。

`apps/admin` 开发默认通过 Vite 代理直连后端（配置 `VITE_API_BASE_URL`）：

- Vite dev server 会代理 `/api`、`/cmict` 到 `VITE_API_BASE_URL`
- 登录后拉取 `me` + `menu`，进入首页并按权限展示菜单
- `admin` 运行依赖后端登录与菜单权限接口（如 `token/verify`、`permission/my-tree`/`permissionCode`）

## 构建

```bash
pnpm build
```

## 配置模型（apps/admin）

`apps/admin` 采用“构建期 env + 代码静态平台配置”：

- 构建期（`.env*`）：只保留 `VITE_API_BASE_URL` 等 dev/proxy 相关项
- 代码静态平台配置（`apps/admin/src/config/platform-config.ts`）：backend/auth/menu/system/module 等业务配置

`platform-config.ts` 关键字段：

- `backend`: `default | basic`
- `authMode`: `cookie | token | mixed`
- `menuMode`: `remote | static`
- `enabledModules`: `"*"` 或 `string[]`（模块白名单）
- `defaultSystemCode` / `systemHomeMap`: 多系统默认与首页映射
- `VITE_API_BASE_URL=https://your-backend.example.com`
  - 开发环境：存在时会启用 Vite 代理 `/api`、`/cmict` 到 `VITE_API_BASE_URL`
  - 生产环境：如需跨域直连，可作为 Axios `baseURL`（默认仍推荐同源 `/api`）

## 本地缓存（参考老项目）

为了对齐部分老项目“刷新后保留状态”的习惯，core 会把以下信息写入 localStorage：

- `ob_auth_user`：当前用户信息（`auth.fetchMe()` 成功后写入；登出/重置时清理，兼容保留 `nickName/roleCodes/permissionCodes/companyId/tenantId` 等老字段）
- `ob_menu_tree`：菜单树（`menu.loadMenus()` 成功后写入；重置时清理）

## 路由与模块切割

- 路由全量静态声明在模块内：`apps/admin/src/modules/**/routes/*.ts`
- 模块轻量清单：`apps/admin/src/modules/**/manifest.ts`（仅元数据）
- 模块声明入口：`apps/admin/src/modules/**/module.ts`（路由/API 命名空间）
- 路由统一由 `apps/admin/src/router/assemble-routes.ts` 组装
- `enabledModules` 先筛清单再按需动态加载模块声明，减少可选模块的启动扫描开销

## 动态菜单 + 静态路由（核心规则）

- 路由：只从前端静态模块加载（不依赖后端动态 addRoute 才能访问）
- 菜单：
  - `remote`：从后端返回“可见菜单树”（决定显示 + allowedPaths）
  - `static`：从本地路由 `meta.title` 生成菜单树
- 默认权限校验：**菜单树出现过的 path 集合 = allowedPaths**；不在集合的路由统一拦截到 `403`

## SSO 单点登录

- 认证入口 / 回调路由：`/sso`
- 路由语义：未登录允许进入以完成回调；已登录再次访问时会被全局守卫拦截并安全回跳到站内地址
- 策略配置：`apps/admin/src/config/sso.ts`
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
