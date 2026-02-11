# standard-base-tamplate

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

默认 `apps/admin` 会启用 dev mock（Vite middleware），不需要后端即可跑通登录/菜单/SSO 基础流程：

- 未登录访问 `/` -> 自动跳转 `/login?redirect=/...`
- 登录成功 -> 拉取 `me` + `menu` -> 进入首页
- 多标签页（tabs）+ keep-alive 缓存
- 主题切换（多套主题色）
- SSO 回调：`/sso?token=xxx` / `ticket` / `code`

## 构建

```bash
pnpm build
```

## 环境变量（apps/admin）

建议在 `apps/admin` 下创建 `.env.development` / `.env.local`：

- `VITE_MENU_MODE=remote|static`
  - `remote`：菜单从后端获取（通过 Adapter `menu.fetchMenuTree()`）
  - `static`：菜单从静态路由的 `meta.title` 生成（适合简单项目，无需单独写菜单配置）
- `VITE_API_BASE_URL=https://your-backend.example.com`
  - 开发环境：存在时会启用 Vite 代理 `/api -> VITE_API_BASE_URL`，并默认关闭 mock
  - 生产环境：如需跨域直连，可作为 Axios `baseURL`（默认仍推荐同源 `/api`）
- `VITE_USE_MOCK=true`
  - 强制开启 mock（即使配置了 `VITE_API_BASE_URL`）

## 路由与模块切割

- 路由全量静态声明：`/Users/haoqiuzhi/code/standard-base-tamplate/apps/admin/src/modules/**/routes.ts`
- 删除某个 `modules/<name>` 目录即可移除对应功能（做到“可切割”）

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

- 接口契约：`/Users/haoqiuzhi/code/standard-base-tamplate/packages/core/src/adapter/types.ts`
- 示例实现：`/Users/haoqiuzhi/code/standard-base-tamplate/packages/adapters/src/defaultAdapter.ts`
- Cookie(HttpOnly) 模式：
  - 登录接口需要 `Set-Cookie`
  - HTTP 客户端默认 `withCredentials: true`
  - 开发 mock 通过 Vite middleware 模拟 `Set-Cookie`（见 `apps/admin/vite.config.ts`）

## 主题切换

主题在 `apps/admin/src/main.ts` 里配置：

- `createCore({ theme: { defaultTheme, themes } })`
- `packages/core` 会在切换时写入 Element Plus 主色及派生色 CSS 变量（`--el-color-primary-*`）
